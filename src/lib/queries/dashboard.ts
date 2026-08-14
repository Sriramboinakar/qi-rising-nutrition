import { cache } from "react";
import { prisma } from "@/lib/db";
import { startOfDay, endOfDay, subDays, addDays } from "date-fns";

export async function getDashboardStats() {
  const [activeCount, openFollowUps, overdueFollowUps] = await Promise.all([
    prisma.client.count({ where: { status: "ACTIVE" } }),
    prisma.followUp.count({ where: { status: "OPEN" } }),
    prisma.followUp.count({
      where: { status: "OPEN", dueDate: { lt: startOfDay(new Date()) } },
    }),
  ]);

  return { activeCount, openFollowUps, overdueFollowUps };
}

export const getDashboardAttention = cache(async () => {
  return buildAttentionQueue();
});

export const getDashboardUpcoming = cache(async () => {
  const today = new Date();
  const [recentActivity, upcoming] = await Promise.all([
    prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { client: { select: { id: true, firstName: true, lastName: true } } },
    }),
    prisma.followUp.findMany({
      where: {
        status: "OPEN",
        dueDate: { gte: startOfDay(today), lte: endOfDay(addDays(today, 7)) },
      },
      orderBy: { dueDate: "asc" },
      include: { client: { select: { id: true, firstName: true, lastName: true } } },
    }),
  ]);

  return { recentActivity, upcoming };
});

type AttentionItem = {
  clientId: string;
  clientName: string;
  reason: string;
  detail: string;
  severity: "high" | "medium" | "low";
  action: string;
};

async function buildAttentionQueue(): Promise<AttentionItem[]> {
  const today = new Date();
  const weekAgo = subDays(today, 7);
  const in30Days = addDays(today, 30);
  const items: AttentionItem[] = [];

  const clients = await prisma.client.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      programEndDate: true,
      program: { select: { name: true } },
      assessments: { select: { id: true }, orderBy: { date: "desc" }, take: 1 },
      checkIns: {
        select: { checkInDate: true, adherencePct: true },
        orderBy: { checkInDate: "desc" },
        take: 1,
      },
      followUps: {
        where: { status: "OPEN" },
        select: { title: true, dueDate: true },
        orderBy: { dueDate: "asc" },
      },
    },
  });

  for (const client of clients) {
    const name = `${client.firstName} ${client.lastName}`;

    const overdueFollowUp = client.followUps.find((f) => f.dueDate < startOfDay(today));
    if (overdueFollowUp) {
      items.push({
        clientId: client.id,
        clientName: name,
        reason: "Overdue follow-up",
        detail: `${overdueFollowUp.title} — due ${overdueFollowUp.dueDate.toLocaleDateString()}`,
        severity: "high",
        action: "Resolve follow-up now",
      });
      continue;
    }

    const lastCheckIn = client.checkIns[0];
    const missedThisWeek = !lastCheckIn || lastCheckIn.checkInDate < weekAgo;
    if (missedThisWeek) {
      const daysAgo = lastCheckIn
        ? Math.floor((today.getTime() - lastCheckIn.checkInDate.getTime()) / 86400000)
        : null;
      items.push({
        clientId: client.id,
        clientName: name,
        reason: "Check-in due",
        detail: lastCheckIn
          ? `Last check-in was ${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`
          : "No check-in recorded yet",
        severity: lastCheckIn ? "medium" : "low",
        action: "Collect weekly check-in",
      });
      continue;
    }

    if (lastCheckIn && lastCheckIn.adherencePct !== null && lastCheckIn.adherencePct < 80) {
      items.push({
        clientId: client.id,
        clientName: name,
        reason: "Low adherence",
        detail: `Adherence was ${lastCheckIn.adherencePct}% on ${lastCheckIn.checkInDate.toLocaleDateString()}`,
        severity: "medium",
        action: "Review plan adherence",
      });
      continue;
    }

    if (client.assessments.length === 0) {
      items.push({
        clientId: client.id,
        clientName: name,
        reason: "No assessment",
        detail: "Initial assessment has not been completed",
        severity: "medium",
        action: "Complete initial assessment",
      });
      continue;
    }

    if (
      client.program &&
      client.programEndDate &&
      client.programEndDate <= in30Days &&
      client.programEndDate >= startOfDay(today)
    ) {
      items.push({
        clientId: client.id,
        clientName: name,
        reason: "Program ending soon",
        detail: `${client.program.name} ends ${client.programEndDate.toLocaleDateString()}`,
        severity: "low",
        action: "Plan program renewal",
      });
    }
  }

  return items.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  });
}