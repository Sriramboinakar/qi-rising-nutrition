"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { logActivity } from "@/lib/activity";
import type { HabitFrequency } from "@/generated/prisma/enums";
import { startOfDay } from "date-fns";

export async function createHabit(clientId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Habit name is required." };

  const frequency = (String(formData.get("frequency") ?? "") || "DAILY") as HabitFrequency;

  await prisma.habit.create({
    data: { clientId, name, frequency },
  });

  await logActivity(session.user.id, clientId, "habit.created", `Added habit "${name}"`);
  revalidatePath(`/clients/${clientId}/habits`);
}

export async function toggleHabitLog(habitId: string, clientId: string, dateStr: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const date = startOfDay(new Date(dateStr));

  const existing = await prisma.habitLog.findUnique({
    where: { habitId_date: { habitId, date } },
  });

  if (existing) {
    await prisma.habitLog.delete({ where: { id: existing.id } });
  } else {
    await prisma.habitLog.create({ data: { habitId, date } });
  }

  revalidatePath(`/clients/${clientId}/habits`);
}

export async function deleteHabit(clientId: string, habitId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  await prisma.habit.delete({ where: { id: habitId } });
  revalidatePath(`/clients/${clientId}/habits`);
}