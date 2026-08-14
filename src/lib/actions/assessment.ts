"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { logActivity } from "@/lib/activity";
import type { AssessmentType } from "@/generated/prisma/enums";

function num(name: string, formData: FormData): number | null {
  const v = String(formData.get(name) ?? "").trim();
  return v ? Number(v) : null;
}

export async function createAssessment(clientId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const type = (String(formData.get("type") ?? "") || "INITIAL") as AssessmentType;

  await prisma.assessment.create({
    data: {
      clientId,
      type,
      date: formData.get("date") ? new Date(String(formData.get("date"))) : new Date(),
      weightKg: num("weightKg", formData),
      goalWeightKg: num("goalWeightKg", formData),
      heightCm: num("heightCm", formData),
      bodyFatPct: num("bodyFatPct", formData),
      chestCm: num("chestCm", formData),
      waistCm: num("waistCm", formData),
      hipsCm: num("hipsCm", formData),
      armCm: num("armCm", formData),
      thighCm: num("thighCm", formData),
      activityLevel: String(formData.get("activityLevel") ?? "") || null,
      goalSummary: String(formData.get("goalSummary") ?? "") || null,
      medicalNotes: String(formData.get("medicalNotes") ?? "") || null,
      allergies: String(formData.get("allergies") ?? "") || null,
      medications: String(formData.get("medications") ?? "") || null,
      lifestyleNotes: String(formData.get("lifestyleNotes") ?? "") || null,
      notes: String(formData.get("notes") ?? "") || null,
    },
  });

  await logActivity(session.user.id, clientId, "assessment.added", `Added ${type.toLowerCase()} assessment`);
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/assessment`);
}

export async function deleteAssessment(clientId: string, assessmentId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  await prisma.assessment.delete({ where: { id: assessmentId } });
  await logActivity(session.user.id, clientId, "assessment.deleted", "Deleted an assessment");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/assessment`);
}