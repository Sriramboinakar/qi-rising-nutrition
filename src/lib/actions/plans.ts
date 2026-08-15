"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { logActivity } from "@/lib/activity";
import { parseDateInput } from "@/lib/utils";
import type { PlanStatus } from "@/generated/prisma/enums";

function num(name: string, formData: FormData): number | null {
  const v = String(formData.get(name) ?? "").trim();
  return v ? Number(v) : null;
}

export async function createPlan(clientId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Plan name is required." };

  const status = (String(formData.get("status") ?? "") || "DRAFT") as PlanStatus;
  const startDate = String(formData.get("startDate") ?? "");
  const endDate = String(formData.get("endDate") ?? "");

  const mealCount = Number(formData.get("mealCount") ?? 0);
  const meals = [];
  for (let i = 0; i < mealCount; i++) {
    const mealName = String(formData.get(`meal_${i}_name`) ?? "").trim();
    if (!mealName) continue;
    meals.push({
      mealName,
      mealOrder: i + 1,
      timeOfDay: String(formData.get(`meal_${i}_time`) ?? "") || null,
      foods: String(formData.get(`meal_${i}_foods`) ?? ""),
      calories: num(`meal_${i}_calories`, formData),
      proteinG: num(`meal_${i}_protein`, formData),
      carbsG: num(`meal_${i}_carbs`, formData),
      fatG: num(`meal_${i}_fat`, formData),
      notes: String(formData.get(`meal_${i}_notes`) ?? "") || null,
    });
  }

  await prisma.nutritionPlan.create({
    data: {
      clientId,
      name,
      status,
      calories: num("calories", formData),
      proteinG: num("proteinG", formData),
      carbsG: num("carbsG", formData),
      fatG: num("fatG", formData),
      waterLiters: num("waterLiters", formData),
      startDate: parseDateInput(startDate),
      endDate: parseDateInput(endDate),
      supplements: String(formData.get("supplements") ?? "") || null,
      notes: String(formData.get("notes") ?? "") || null,
      meals: { create: meals },
    },
  });

  await logActivity(session.user.id, clientId, "plan.created", `Created nutrition plan "${name}"`);
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/plan`);
}

export async function activatePlan(clientId: string, planId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  await prisma.$transaction([
    prisma.nutritionPlan.updateMany({
      where: { clientId, status: "ACTIVE" },
      data: { status: "ARCHIVED" },
    }),
    prisma.nutritionPlan.update({
      where: { id: planId },
      data: { status: "ACTIVE" },
    }),
  ]);

  await logActivity(session.user.id, clientId, "plan.activated", "Activated a nutrition plan");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/plan`);
}

export async function archivePlan(clientId: string, planId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  await prisma.nutritionPlan.update({
    where: { id: planId },
    data: { status: "ARCHIVED" },
  });
  revalidatePath(`/clients/${clientId}/plan`);
}

export async function deletePlan(clientId: string, planId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  await prisma.nutritionPlan.delete({ where: { id: planId } });
  await logActivity(session.user.id, clientId, "plan.deleted", "Deleted a nutrition plan");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/plan`);
}