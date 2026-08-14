"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { logActivity } from "@/lib/activity";
import type { FollowUpPriority } from "@/generated/prisma/enums";

export async function createFollowUp(clientId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const title = String(formData.get("title") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "");
  if (!title) return { error: "Title is required." };
  if (!dueDate) return { error: "Due date is required." };

  const priority = (String(formData.get("priority") ?? "") || "MEDIUM") as FollowUpPriority;

  await prisma.followUp.create({
    data: {
      clientId,
      authorId: session.user.id,
      title,
      description: String(formData.get("description") ?? "") || null,
      dueDate: new Date(dueDate),
      priority,
    },
  });

  await logActivity(session.user.id, clientId, "followup.created", `Created follow-up "${title}"`);
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/followups`);
  revalidatePath("/dashboard");
}

export async function completeFollowUp(followUpId: string, clientId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  await prisma.followUp.update({
    where: { id: followUpId },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  await logActivity(session.user.id, clientId, "followup.completed", "Completed a follow-up");
  revalidatePath(`/clients/${clientId}/followups`);
  revalidatePath("/dashboard");
}

export async function deleteFollowUp(followUpId: string, clientId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  await prisma.followUp.delete({ where: { id: followUpId } });
  revalidatePath(`/clients/${clientId}/followups`);
  revalidatePath("/dashboard");
}