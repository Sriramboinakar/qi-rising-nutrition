import { cache } from "react";
import { prisma } from "@/lib/db";
import { startOfDay, endOfDay, addDays } from "date-fns";

export async function getDashboardStats() {
  const weekAgo = startOfDay(addDays(new Date(), -6));
  const [activeCount, openFollowUps, overdueFollowUps, checkedInThisWeek] = await Promise.all([
    prisma.client.count({ where: { status: "ACTIVE" } }),
    prisma.followUp.count({ where: { status: "OPEN" } }),
    prisma.followUp.count({
      where: { status: "OPEN", dueDate: { lt: startOfDay(new Date()) } },
    }),
    prisma.client.count({
      where: { status: "ACTIVE", checkIns: { some: { checkInDate: { gte: weekAgo } } } },
    }),
  ]);

  return { activeCount, openFollowUps, overdueFollowUps, checkedInThisWeek };
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

export type DashboardNutritionRow = {
  id: string;
  name: string;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  ready: boolean;
};

export type DashboardNutritionSnapshot = {
  count: number;
  avgCalories: number | null;
  avgProtein: number | null;
  avgCarbs: number | null;
  avgFat: number | null;
  top: DashboardNutritionRow[];
};

/**
 * Aggregate daily calorie + macro targets across active clients for the
 * dashboard widgets. The coach-set nutrition overrides are the ONLY source
 * of truth — calculated estimates are never used as targets.
 */
export async function getDashboardNutritionSnapshot(): Promise<DashboardNutritionSnapshot> {
  const clients = await prisma.client.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      category: true,
      calorieTarget: true,
      proteinTargetG: true,
      carbsTargetG: true,
      fatTargetG: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const rows: DashboardNutritionRow[] = clients.map((c) => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName}`,
    calories: c.calorieTarget,
    proteinG: c.proteinTargetG,
    carbsG: c.carbsTargetG,
    fatG: c.fatTargetG,
    ready: c.calorieTarget !== null,
  }));

  const ready = rows.filter((r) => r.ready);
  const avg = (pick: (r: DashboardNutritionRow) => number | null): number | null => {
    const vals = ready.map(pick).filter((v): v is number => typeof v === "number");
    return vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : null;
  };
  const top = [...ready]
    .sort((a, b) => (b.calories ?? 0) - (a.calories ?? 0))
    .slice(0, 6);

  return {
    count: ready.length,
    avgCalories: avg((r) => r.calories),
    avgProtein: avg((r) => r.proteinG),
    avgCarbs: avg((r) => r.carbsG),
    avgFat: avg((r) => r.fatG),
    top,
  };
}