"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { resolveAccessToken } from "@/lib/access-token";
import { logActivity } from "@/lib/activity";
import { subDays } from "date-fns";

function num(name: string, formData: FormData): number | null {
  const v = String(formData.get(name) ?? "").trim();
  return v ? Number(v) : null;
}

/**
 * Client-facing weekly check-in. Verifies the access token, attaches the
 * submission to the correct client, auto-computes the week number and
 * generates a concise summary from the submitted data for the coach.
 */
export async function submitClientCheckIn(token: string, formData: FormData) {
  const clientId = await resolveAccessToken(token, "CHECKIN");
  if (!clientId) {
    return { error: "This check-in link is invalid or has expired. Please ask your coach for a new one." };
  }

  const weightKg = num("weightKg", formData);
  const adherencePct = num("adherencePct", formData);
  const sleepHours = num("sleepHours", formData);
  const waterLiters = num("waterLiters", formData);
  const energyLevel = num("energyLevel", formData);
  const mood = num("mood", formData);
  const notesRaw = String(formData.get("notes") ?? "").trim();
  const goalFocus = String(formData.get("goalFocus") ?? "").trim();
  const notes =
    [goalFocus ? `This week's focus: ${goalFocus}` : "", notesRaw].filter(Boolean).join("\n\n") || null;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, firstName: true, lastName: true, coachId: true },
  });
  if (!client) return { error: "Client not found." };

  const checkIns = await prisma.checkIn.findMany({
    where: { clientId },
    orderBy: { weekNumber: "desc" },
    take: 2,
    select: { weekNumber: true, weightKg: true, sleepHours: true, waterLiters: true, checkInDate: true },
  });

  const toNum = (v: unknown): number | null => (v === null || v === undefined ? null : Number(v));
  const last = checkIns[0]
    ? {
        weekNumber: checkIns[0].weekNumber,
        checkInDate: checkIns[0].checkInDate,
        weightKg: toNum(checkIns[0].weightKg),
        sleepHours: toNum(checkIns[0].sleepHours),
        waterLiters: toNum(checkIns[0].waterLiters),
      }
    : null;
  const prev = checkIns[1]
    ? {
        weekNumber: checkIns[1].weekNumber,
        checkInDate: checkIns[1].checkInDate,
        weightKg: toNum(checkIns[1].weightKg),
        sleepHours: toNum(checkIns[1].sleepHours),
        waterLiters: toNum(checkIns[1].waterLiters),
      }
    : null;
  const weekNumber = last ? last.weekNumber + 1 : 1;

  // Guard: prevent a client submitting two check-ins for the same week.
  if (last && last.checkInDate >= subDays(new Date(), 1)) {
    return {
      error: `A check-in for week ${weekNumber} was already recorded recently. Please wait for your next weekly check-in.`,
    };
  }

  const summary = buildWeeklySummary({ weightKg, adherencePct, sleepHours, waterLiters, energyLevel, mood, notes }, last, prev);

  // Client-submitted progress photos (base64 data URLs, resized client-side).
  // Defense in depth: reject if the combined payload exceeds 2MB in case the
  // client-side resize is bypassed.
  const photos: string[] = ["photo0", "photo1", "photo2"]
    .map((key) => String(formData.get(key) ?? "").trim())
    .filter((v) => v.length > 0);
  if (photos.length > 3) {
    return { error: "You can add up to 3 photos per check-in." };
  }
  const totalPhotoBytes = photos.reduce((sum, p) => sum + Buffer.byteLength(p, "utf8"), 0);
  if (totalPhotoBytes > 2 * 1024 * 1024) {
    return { error: "Photos are too large. Please try smaller photos." };
  }

  const checkIn = await prisma.checkIn.create({
    data: {
      clientId,
      weekNumber,
      weightKg,
      sleepHours,
      waterLiters,
      energyLevel,
      mood,
      adherencePct,
      notes,
      summary,
    },
  });

  if (photos.length > 0) {
    await prisma.progressPhoto.createMany({
      data: photos.map((url) => ({
        clientId,
        checkInId: checkIn.id,
        url,
        type: "FRONT",
      })),
    });
  }

  await logActivity(
    client.coachId,
    clientId,
    "checkin.submitted",
    `Client submitted week ${weekNumber} check-in`
  );

  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/checkins`);
  revalidatePath("/dashboard");
  return { ok: true };
}

type CheckInInput = {
  weightKg: number | null;
  adherencePct: number | null;
  sleepHours: number | null;
  waterLiters: number | null;
  energyLevel: number | null;
  mood: number | null;
  notes: string | null;
};

type PriorCheckIn = {
  weightKg: number | null;
  sleepHours: number | null;
  waterLiters: number | null;
} | null;

/**
 * Generate the coach-facing weekly summary from actual submitted data only.
 * Never fabricates values — missing fields are omitted rather than guessed.
 */
function buildWeeklySummary(
  input: CheckInInput,
  last: PriorCheckIn,
  prev: PriorCheckIn
): string {
  const lines: string[] = [];

  if (input.weightKg !== null) {
    const prevWeight = prev?.weightKg ?? last?.weightKg;
    if (prevWeight !== null && prevWeight !== undefined) {
      const delta = input.weightKg - Number(prevWeight);
      const sign = delta <= 0 ? "" : "+";
      lines.push(`Weight: ${Number(prevWeight)} → ${input.weightKg} kg (${sign}${delta.toFixed(1)} kg)`);
    } else {
      lines.push(`Weight: ${input.weightKg} kg`);
    }
  }

  if (input.adherencePct !== null) lines.push(`Adherence: ${input.adherencePct}%`);

  if (input.energyLevel !== null) lines.push(`Energy: ${input.energyLevel}/10`);

  if (input.mood !== null) lines.push(`Mood: ${input.mood}/10`);

  if (input.sleepHours !== null && prev?.sleepHours !== null && prev?.sleepHours !== undefined) {
    const trend = input.sleepHours - Number(prev.sleepHours);
    lines.push(`Sleep: ${trend > 0 ? "Improved" : trend < 0 ? "Declined" : "Unchanged"}`);
  } else if (input.sleepHours !== null) {
    lines.push(`Sleep: ${input.sleepHours} hrs`);
  }

  if (input.waterLiters !== null) {
    const trend =
      prev?.waterLiters !== null && prev?.waterLiters !== undefined
        ? input.waterLiters - Number(prev.waterLiters)
        : null;
    lines.push(
      trend !== null
        ? `Water: ${trend >= 0 ? "On track" : "Needs improvement"}`
        : `Water: ${input.waterLiters} L`
    );
  }

  if (input.notes) lines.push(`Notes: ${input.notes}`);

  return lines.length > 0 ? lines.join("\n") : "Check-in submitted without numeric data.";
}