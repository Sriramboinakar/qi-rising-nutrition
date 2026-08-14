"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { logActivity } from "@/lib/activity";
import type { CheckInStatus } from "@/generated/prisma/enums";

function num(name: string, formData: FormData): number | null {
  const v = String(formData.get(name) ?? "").trim();
  return v ? Number(v) : null;
}

export async function createCheckIn(clientId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const weekNumber = Number(formData.get("weekNumber") ?? 1);
  const status = (String(formData.get("status") ?? "") || "COMPLETED") as CheckInStatus;
  const followUpDate = String(formData.get("followUpDate") ?? "");

  const existing = await prisma.checkIn.findUnique({
    where: { clientId_weekNumber: { clientId, weekNumber } },
  });
  if (existing) return { error: `Week ${weekNumber} already has a check-in.` };

  await prisma.checkIn.create({
    data: {
      clientId,
      weekNumber,
      status,
      checkInDate: formData.get("date") ? new Date(String(formData.get("date"))) : new Date(),
      weightKg: num("weightKg", formData),
      waistCm: num("waistCm", formData),
      sleepHours: num("sleepHours", formData),
      energyLevel: num("energyLevel", formData),
      mood: num("mood", formData),
      adherencePct: num("adherencePct", formData),
      waterLiters: num("waterLiters", formData),
      notes: String(formData.get("notes") ?? "") || null,
      response: String(formData.get("response") ?? "") || null,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
    },
  });

  await logActivity(
    session.user.id,
    clientId,
    "checkin.added",
    `Recorded week ${weekNumber} check-in`
  );
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/checkins`);
  revalidatePath("/dashboard");
}

export async function updateCheckIn(clientId: string, checkInId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const status = (String(formData.get("status") ?? "") || "COMPLETED") as CheckInStatus;
  const followUpDate = String(formData.get("followUpDate") ?? "");

  await prisma.checkIn.update({
    where: { id: checkInId },
    data: {
      status,
      weightKg: num("weightKg", formData),
      waistCm: num("waistCm", formData),
      sleepHours: num("sleepHours", formData),
      energyLevel: num("energyLevel", formData),
      mood: num("mood", formData),
      adherencePct: num("adherencePct", formData),
      waterLiters: num("waterLiters", formData),
      notes: String(formData.get("notes") ?? "") || null,
      response: String(formData.get("response") ?? "") || null,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
    },
  });

  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/checkins`);
  revalidatePath("/dashboard");
}

export async function markCheckInMissed(clientId: string, weekNumber: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const existing = await prisma.checkIn.findUnique({
    where: { clientId_weekNumber: { clientId, weekNumber } },
  });
  if (existing) return;

  await prisma.checkIn.create({
    data: {
      clientId,
      weekNumber,
      status: "MISSED",
      checkInDate: new Date(),
    },
  });

  await logActivity(session.user.id, clientId, "checkin.missed", `Marked week ${weekNumber} as missed`);
  revalidatePath(`/clients/${clientId}/checkins`);
  revalidatePath("/dashboard");
}