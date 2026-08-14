"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

const ALLOWED_KEYS = new Set([
  "platformName",
  "coachingEmail",
  "defaultCheckInDay",
  "followUpReminderDays",
  "businessHours",
]);

export async function saveSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") throw new Error("Forbidden");

  const updates = [];
  for (const key of ALLOWED_KEYS) {
    const value = String(formData.get(key) ?? "").trim();
    if (value) {
      updates.push({ key, value });
    }
  }

  for (const { key, value } of updates) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  revalidatePath("/settings");
}