"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  getOrCreateAccessToken,
  regenerateAccessToken,
  resolveAccessToken,
  type AccessPurpose,
} from "@/lib/access-token";
import { parseDateInput } from "@/lib/utils";
import { auth } from "@/auth";
import { logActivity } from "@/lib/activity";
import type { GoalCategory } from "@/generated/prisma/enums";

/**
 * Coach-facing: get the stable self-service links for a client, creating
 * tokens lazily on first use and reusing the same ones afterward. Links are
 * progressively revealed based on the client's actual state: intake link is
 * always available, check-in only after intake is submitted, plan only while
 * an ACTIVE plan exists. The returned URLs never change for the same
 * client + purpose.
 */
export async function getClientAccessLinks(clientId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      coachId: true,
      intakeSubmittedAt: true,
      plans: {
        where: { status: "ACTIVE" },
        orderBy: { updatedAt: "desc" },
        take: 1,
        select: { id: true, name: true },
      },
    },
  });
  if (!client || client.coachId !== session.user.id) throw new Error("Not authorized");

  const intakeSubmitted = Boolean(client.intakeSubmittedAt);
  const activePlan = client.plans[0] ?? null;

  const intake = await getOrCreateAccessToken(clientId, "INTAKE");
  const checkin = intakeSubmitted ? await getOrCreateAccessToken(clientId, "CHECKIN") : null;
  const plan = activePlan ? await getOrCreateAccessToken(clientId, "PLAN") : null;

  return {
    intake,
    checkin,
    plan,
    intakeSubmitted,
    hasActivePlan: Boolean(activePlan),
    activePlanName: activePlan?.name ?? null,
  };
}

/** Coach-facing: get (or lazily create) the stable weekly check-in link. */
export async function getClientCheckInLink(clientId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { coachId: true, intakeSubmittedAt: true },
  });
  if (!client || client.coachId !== session.user.id) throw new Error("Not authorized");
  if (!client.intakeSubmittedAt) throw new Error("Intake not completed yet");

  return getOrCreateAccessToken(clientId, "CHECKIN");
}

/** Coach-facing: intentionally rotate a client's link, invalidating the old URL. */
export async function regenerateClientAccessLink(clientId: string, purpose: AccessPurpose) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { coachId: true },
  });
  if (!client || client.coachId !== session.user.id) throw new Error("Not authorized");

  const token = await regenerateAccessToken(clientId, purpose);
  revalidatePath(`/clients/${clientId}`);
  return token;
}

function num(name: string, formData: FormData): number | null {
  const v = String(formData.get(name) ?? "").trim();
  return v ? Number(v) : null;
}

/**
 * Shared write path for intake data: updates the client profile and creates an
 * INITIAL assessment. Used by both the client-facing link (submitIntake) and
 * the coach-facing manual entry (manualSubmitIntake). Returns an error object
 * on invalid input, otherwise { ok: true }.
 */
async function applyIntakeData(clientId: string, formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  if (!firstName || !lastName) return { error: "First and last name are required." };
  if (firstName.length > 100 || lastName.length > 100) {
    return { error: "Names must be 100 characters or fewer." };
  }

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

/**
 * Client-facing intake submission. Verifies the access token, then creates
 * the initial assessment and updates the client profile from what the client
 * submitted. Never trusts client input to escalate access.
 */
export async function submitIntake(token: string, formData: FormData) {
  const clientId = await resolveAccessToken(token, "INTAKE");
  if (!clientId) return { error: "This intake link is invalid or has expired. Please ask your coach for a new one." };
  return applyIntakeData(clientId, formData);
}

/**
 * Coach-facing: manually record a client's intake when they did not (or could
 * not) fill the intake link. Same write path as the link, but authenticated as
 * the coach who owns the client. Redirects to the client profile on success.
 */
export async function manualSubmitIntake(clientId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { coachId: true },
  });
  if (!client || client.coachId !== session.user.id) throw new Error("Not authorized");

  const result = await applyIntakeData(clientId, formData);
  if (result && "ok" in result) {
    redirect(`/clients/${clientId}`);
  }
  return result;
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