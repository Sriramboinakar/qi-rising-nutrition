"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { issueAccessToken, resolveAccessToken } from "@/lib/access-token";
import { parseDateInput } from "@/lib/utils";
import { auth } from "@/auth";
import { logActivity } from "@/lib/activity";
import type { GoalCategory } from "@/generated/prisma/enums";

/** Coach-facing: generate fresh access-link tokens for a client in one round-trip. */
export async function createClientAccessLinks(clientId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { coachId: true },
  });
  if (!client || client.coachId !== session.user.id) throw new Error("Not authorized");

  const [intake, checkin, plan] = await Promise.all([
    issueAccessToken(clientId, "INTAKE"),
    issueAccessToken(clientId, "CHECKIN"),
    issueAccessToken(clientId, "PLAN"),
  ]);

  return { intake, checkin, plan };
}

/** Coach-facing: issue a single fresh check-in link for one-click sharing. */
export async function getClientCheckInLink(clientId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { coachId: true },
  });
  if (!client || client.coachId !== session.user.id) throw new Error("Not authorized");

  const token = await issueAccessToken(clientId, "CHECKIN");
  return token;
}

function num(name: string, formData: FormData): number | null {
  const v = String(formData.get(name) ?? "").trim();
  return v ? Number(v) : null;
}

/**
 * Client-facing intake submission. Verifies the access token, then creates
 * the initial assessment and updates the client profile from what the client
 * submitted. Never trusts client input to escalate access.
 */
export async function submitIntake(token: string, formData: FormData) {
  const clientId = await resolveAccessToken(token, "INTAKE");
  if (!clientId) return { error: "This intake link is invalid or has expired. Please ask your coach for a new one." };

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  if (!firstName || !lastName) return { error: "First and last name are required." };

  const dateOfBirth = String(formData.get("dateOfBirth") ?? "");
  const sex = String(formData.get("sex") ?? "") || null;
  const goal = (String(formData.get("goal") ?? "") || "FAT_LOSS") as GoalCategory;
  const heightCm = num("heightCm", formData);
  const weightKg = num("weightKg", formData);
  const goalWeightKg = num("goalWeightKg", formData);

  if (!weightKg || !heightCm) {
    return { error: "Height and weight are required for your nutrition calculations." };
  }

  const assessment = await prisma.$transaction(async (tx) => {
    const updated = await tx.client.update({
      where: { id: clientId },
      data: {
        firstName,
        lastName,
        dateOfBirth: parseDateInput(dateOfBirth) ?? undefined,
        sex,
        category: goal,
        heightCm: heightCm ? heightCm : undefined,
        intakeSubmittedAt: new Date(),
      },
    });

    const created = await tx.assessment.create({
      data: {
        clientId,
        type: "INITIAL",
        heightCm,
        weightKg,
        goalWeightKg,
        activityLevel: String(formData.get("activityLevel") ?? "") || null,
        goalSummary: String(formData.get("goalSummary") ?? "") || null,
        medicalNotes: String(formData.get("medicalNotes") ?? "") || null,
        allergies: String(formData.get("allergies") ?? "") || null,
        medications: String(formData.get("medications") ?? "") || null,
        lifestyleNotes: String(formData.get("lifestyleNotes") ?? "") || null,
        dietaryPreference: String(formData.get("dietaryPreference") ?? "") || null,
        foodRestrictions: String(formData.get("foodRestrictions") ?? "") || null,
        mealTiming: String(formData.get("mealTiming") ?? "") || null,
        sleepHours: num("sleepHours", formData),
        waterLiters: num("waterLiters", formData),
        notes: String(formData.get("notes") ?? "") || null,
      },
    });

    return { updated, created };
  });

  const coachId = assessment.updated.coachId;
  await logActivity(
    coachId,
    clientId,
    "intake.submitted",
    `Client ${assessment.updated.firstName} completed their intake`
  );

  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { ok: true };
}

/** Marks an intake as reviewed by the coach. */
export async function markIntakeReviewed(clientId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  await prisma.client.update({
    where: { id: clientId },
    data: { intakeReviewedAt: new Date() },
  });

  await logActivity(session.user.id, clientId, "intake.reviewed", "Reviewed client intake");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/dashboard");
}