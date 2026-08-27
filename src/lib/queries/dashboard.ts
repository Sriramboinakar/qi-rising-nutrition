import { cache } from "react";
import { prisma } from "@/lib/db";
import { startOfDay, endOfDay, addDays } from "date-fns";
import { buildNutritionProfile } from "@/lib/nutrition";

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
 * dashboard widgets. Uses each client's latest assessment + profile, with
 * coach-set nutrition overrides taking precedence over calculated values.
 */
export async function getDashboardNutritionSnapshot(): Promise<DashboardNutritionSnapshot> {
  const clients = await prisma.client.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      category: true,
      sex: true,
      dateOfBirth: true,
      heightCm: true,
      calorieTarget: true,
      proteinTargetG: true,
      carbsTargetG: true,
      fatTargetG: true,
      assessments: {
        orderBy: { date: "desc" },
        take: 1,
        select: { weightKg: true, activityLevel: true, heightCm: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const rows: DashboardNutritionRow[] = clients.map((c) => {
    const a = c.assessments[0];
    const profile = buildNutritionProfile({
      weightKg: a?.weightKg != null ? Number(a.weightKg) : null,
      heightCm:
        c.heightCm != null
          ? Number(c.heightCm)
          : a?.heightCm != null
            ? Number(a.heightCm)
            : null,
      dateOfBirth: c.dateOfBirth,
      sex: c.sex,
      activityLevel: a?.activityLevel,
      goal: c.category,
    });

    const override = c.calorieTarget !== null;
    return {
      id: c.id,
      name: `${c.firstName} ${c.lastName}`,
      calories: override ? c.calorieTarget : profile.calorieTarget,
      proteinG: override ? c.proteinTargetG : profile.proteinG,
      carbsG: override ? c.carbsTargetG : profile.carbsG,
      fatG: override ? c.fatTargetG : profile.fatG,
      ready:
        (override ? c.calorieTarget : profile.calorieTarget) !== null &&
        (override ? c.proteinTargetG : profile.proteinG) !== null &&
        (override ? c.carbsTargetG : profile.carbsG) !== null &&
        (override ? c.fatTargetG : profile.fatG) !== null,
    };
  });

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