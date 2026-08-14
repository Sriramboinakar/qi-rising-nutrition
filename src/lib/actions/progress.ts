"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { logActivity } from "@/lib/activity";
import type { PhotoType } from "@/generated/prisma/enums";

function num(name: string, formData: FormData): number | null {
  const v = String(formData.get(name) ?? "").trim();
  return v ? Number(v) : null;
}

export async function createProgressEntry(clientId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  await prisma.progressEntry.create({
    data: {
      clientId,
      date: formData.get("date") ? new Date(String(formData.get("date"))) : new Date(),
      weightKg: num("weightKg", formData),
      chestCm: num("chestCm", formData),
      waistCm: num("waistCm", formData),
      hipsCm: num("hipsCm", formData),
      armCm: num("armCm", formData),
      thighCm: num("thighCm", formData),
      bodyFatPct: num("bodyFatPct", formData),
      notes: String(formData.get("notes") ?? "") || null,
    },
  });

  await logActivity(session.user.id, clientId, "progress.added", "Recorded progress measurements");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/progress`);
}

export async function deleteProgressEntry(clientId: string, entryId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  await prisma.progressEntry.delete({ where: { id: entryId } });
  revalidatePath(`/clients/${clientId}/progress`);
}

export async function createProgressPhoto(clientId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const url = String(formData.get("url") ?? "").trim();
  if (!url) return { error: "Photo URL is required." };
  const type = (String(formData.get("type") ?? "") || "FRONT") as PhotoType;

  await prisma.progressPhoto.create({
    data: {
      clientId,
      url,
      type,
      date: formData.get("date") ? new Date(String(formData.get("date"))) : new Date(),
      note: String(formData.get("note") ?? "") || null,
    },
  });

  await logActivity(session.user.id, clientId, "photo.added", `Added ${type.toLowerCase()} progress photo`);
  revalidatePath(`/clients/${clientId}/progress`);
}

export async function deleteProgressPhoto(clientId: string, photoId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  await prisma.progressPhoto.delete({ where: { id: photoId } });
  revalidatePath(`/clients/${clientId}/progress`);
}