import { cache } from "react";
import { prisma } from "@/lib/db";
import { startOfDay, endOfDay, addDays } from "date-fns";

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