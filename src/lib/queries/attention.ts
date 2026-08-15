import { cache } from "react";
import { prisma } from "@/lib/db";
import { startOfDay, addDays } from "date-fns";
import { getCheckInStatus, type CheckInStatusInfo } from "@/lib/checkin-status";

export type AttentionKind = "OVERDUE" | "NEW_CHECKIN" | "PLAN_EXPIRING" | "DUE";

export type AttentionItem = {
  clientId: string;
  clientName: string;
  kind: AttentionKind;
  detail: string;
  /** Id of the unreviewed check-in for the "Review" action. */
  checkInId?: string;
  /** True when the client has a coach-owned check-in link to send. */
  canSendLink: boolean;
};

const KIND_PRIORITY: Record<AttentionKind, number> = {
  OVERDUE: 0,
  NEW_CHECKIN: 1,
  PLAN_EXPIRING: 2,
  DUE: 3,
};

const KIND_LABEL: Record<AttentionKind, string> = {
  OVERDUE: "Overdue",
  NEW_CHECKIN: "New check-in",
  PLAN_EXPIRING: "Plan expiring",
  DUE: "Due",
};

/** Human-readable detail line for each attention item. */
function detailFor(kind: AttentionKind, info: CheckInStatusInfo, extra?: string): string {
  if (kind === "OVERDUE") {
    return `Check-in overdue by ${info.daysOverdue} day${info.daysOverdue === 1 ? "" : "s"}`;
  }
  if (kind === "NEW_CHECKIN") return extra ?? "Submitted check-in waiting for review";
  if (kind === "PLAN_EXPIRING") return extra ?? "Active plan is approaching its end date";
  return "Check-in due today";
}

/**
 * Build the "Needs Attention" queue for the coach dashboard.
 *
 * One item per client, using the highest-priority reason, so the list stays
 * compact. Sorted by priority, then oldest/most urgent first within the same
 * priority. Only clients with an actionable item are included.
 */
async function buildAttentionQueue(): Promise<AttentionItem[]> {
  const today = startOfDay(new Date());
  const planExpiryWindow = addDays(today, 14);

  const [clients, unreviewed, expiringPlans] = await Promise.all([
    prisma.client.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        status: true,
        intakeSubmittedAt: true,
        programStartDate: true,
        createdAt: true,
        checkIns: {
          orderBy: { checkInDate: "desc" },
          take: 1,
          select: { id: true, checkInDate: true, weekNumber: true, reviewedAt: true },
        },
      },
    }),
    prisma.checkIn.findMany({
      where: { status: "COMPLETED", reviewedAt: null, client: { status: "ACTIVE" } },
      orderBy: { checkInDate: "asc" },
      select: { id: true, weekNumber: true, checkInDate: true, clientId: true },
    }),
    prisma.nutritionPlan.findMany({
      where: {
        status: "ACTIVE",
        client: { status: "ACTIVE" },
        endDate: { not: null, gte: today, lte: planExpiryWindow },
      },
      orderBy: { endDate: "asc" },
      select: { id: true, name: true, endDate: true, clientId: true },
    }),
  ]);

  const unreviewedByClient = new Map(
    unreviewed.map((c) => [c.clientId, c])
  );
  const planByClient = new Map(
    expiringPlans.map((p) => [p.clientId, p])
  );

  const items: (AttentionItem & { priority: number; sortKey: number })[] = [];

  for (const client of clients) {
    const name = `${client.firstName} ${client.lastName}`;

    const statusInfo = getCheckInStatus({
      clientStatus: client.status,
      intakeSubmittedAt: client.intakeSubmittedAt,
      programStartDate: client.programStartDate,
      createdAt: client.createdAt,
      lastCheckIn: client.checkIns[0] ?? null,
    });

    const unreviewedCheckIn = unreviewedByClient.get(client.id);
    const expiringPlan = planByClient.get(client.id);

    // NEW_CHECKIN takes priority over DUE/PLAN_EXPIRING, but OVERDUE wins over all.
    let kind: AttentionKind | null = null;
    let extra: string | undefined;
    let sortKey = 0;

    if (statusInfo.status === "OVERDUE") {
      kind = "OVERDUE";
      sortKey = statusInfo.daysOverdue; // most overdue first
    } else if (unreviewedCheckIn) {
      kind = "NEW_CHECKIN";
      extra = `Week ${unreviewedCheckIn.weekNumber} check-in submitted`;
      sortKey = unreviewedCheckIn.checkInDate.getTime(); // oldest first
    } else if (expiringPlan) {
      kind = "PLAN_EXPIRING";
      extra = `${expiringPlan.name} ends ${expiringPlan.endDate?.toLocaleDateString()}`;
      sortKey = expiringPlan.endDate?.getTime() ?? 0; // soonest first
    } else if (statusInfo.status === "DUE") {
      kind = "DUE";
      sortKey = statusInfo.nextCheckInAt?.getTime() ?? 0;
    }

    if (!kind) continue;

    items.push({
      clientId: client.id,
      clientName: name,
      kind,
      detail: detailFor(kind, statusInfo, extra),
      checkInId: kind === "NEW_CHECKIN" ? unreviewedCheckIn?.id : undefined,
      canSendLink: kind === "OVERDUE" || kind === "DUE",
      priority: KIND_PRIORITY[kind],
      sortKey,
    });
  }

  return items
    .sort((a, b) => a.priority - b.priority || a.sortKey - b.sortKey)
    .map((item) => ({
      clientId: item.clientId,
      clientName: item.clientName,
      kind: item.kind,
      detail: item.detail,
      checkInId: item.checkInId,
      canSendLink: item.canSendLink,
    }));
}

export const getDashboardAttention = cache(async () => buildAttentionQueue());

export const ATTENTION_KIND_LABEL = KIND_LABEL;

/** Backend-only: which active clients need a check-in reminder right now. */
export async function getClientsNeedingReminders() {
  const clients = await prisma.client.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      status: true,
      intakeSubmittedAt: true,
      programStartDate: true,
      createdAt: true,
      email: true,
      phone: true,
      checkIns: {
        orderBy: { checkInDate: "desc" },
        take: 1,
        select: { checkInDate: true },
      },
    },
  });

  const reminders: {
    clientId: string;
    clientName: string;
    type: "DUE" | "OVERDUE";
    daysOverdue: number;
    message: string;
  }[] = [];

  for (const client of clients) {
    const info = getCheckInStatus({
      clientStatus: client.status,
      intakeSubmittedAt: client.intakeSubmittedAt,
      programStartDate: client.programStartDate,
      createdAt: client.createdAt,
      lastCheckIn: client.checkIns[0] ?? null,
    });
    if (info.status !== "DUE" && info.status !== "OVERDUE") continue;

    reminders.push({
      clientId: client.id,
      clientName: `${client.firstName} ${client.lastName}`,
      type: info.status,
      daysOverdue: info.daysOverdue,
      message:
        info.status === "OVERDUE"
          ? `Reminder: ${client.firstName} has missed the weekly check-in (${info.daysOverdue} day(s) overdue).`
          : `Reminder: ${client.firstName}'s weekly check-in is due today.`,
    });
  }

  return reminders.sort((a, b) => {
    const p = (t: "DUE" | "OVERDUE") => (t === "OVERDUE" ? 0 : 1);
    return p(a.type) - p(b.type) || b.daysOverdue - a.daysOverdue;
  });
}