"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { getOrCreateAccessToken } from "@/lib/access-token";
import { TEST_EMAIL_DOMAINS } from "@/lib/test-data";
import type { ClientStatus, GoalCategory } from "@/generated/prisma/enums";
import { logActivity } from "@/lib/activity";
import { parseDateInput } from "@/lib/utils";

export async function createClient(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  if (!firstName || !lastName) return { error: "First and last name are required." };

  const email = String(formData.get("email") ?? "").trim() || null;
  if (email) {
    const existing = await prisma.client.findUnique({ where: { email } });
    if (existing) return { error: "A client with this email already exists." };
  }

  const category = (String(formData.get("category") ?? "") || "FAT_LOSS") as GoalCategory;
  const programId = String(formData.get("programId") ?? "") || null;
  const startDate = String(formData.get("programStartDate") ?? "");
  const endDate = String(formData.get("programEndDate") ?? "");

  const client = await prisma.client.create({
    data: {
      firstName,
      lastName,
      email,
      phone: String(formData.get("phone") ?? "") || null,
      sex: String(formData.get("sex") ?? "") || null,
      category,
      coachId: session.user.id,
      programId,
      programStartDate: parseDateInput(startDate),
      programEndDate: parseDateInput(endDate),
      notes: String(formData.get("notes") ?? "") || null,
    },
  });

  await logActivity(session.user.id, client.id, "client.created", `Created client ${client.firstName} ${client.lastName}`);

  revalidatePath("/clients");
  return { id: client.id };
}

/**
 * Coach-facing: create a client instantly (name optional) and return a ready
 * intake link to share directly — no need to fill the full form first. The
 * client can later be completed manually or via the link.
 */
export async function createClientQuickLink(name?: string, goal?: GoalCategory) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  const firstName = (parts[0] || "New Client").slice(0, 100);
  const lastName = parts.slice(1).join(" ").slice(0, 100);

  const client = await prisma.client.create({
    data: {
      firstName,
      lastName,
      category: goal ?? "FAT_LOSS",
      coachId: session.user.id,
    },
  });

  const intakeToken = await getOrCreateAccessToken(client.id, "INTAKE");
  await logActivity(session.user.id, client.id, "client.created", `Created client ${firstName} ${lastName}`);

  return { clientId: client.id, intakeToken };
}

export async function updateClient(clientId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  if (!firstName || !lastName) return { error: "First and last name are required." };

  const email = String(formData.get("email") ?? "").trim() || null;
  const category = (String(formData.get("category") ?? "") || "FAT_LOSS") as GoalCategory;
  const status = (String(formData.get("status") ?? "") || "ACTIVE") as ClientStatus;
  const programId = String(formData.get("programId") ?? "") || null;
  const startDate = String(formData.get("programStartDate") ?? "");
  const endDate = String(formData.get("programEndDate") ?? "");

  await prisma.client.update({
    where: { id: clientId },
    data: {
      firstName,
      lastName,
      email,
      phone: String(formData.get("phone") ?? "") || null,
      sex: String(formData.get("sex") ?? "") || null,
      category,
      status,
      programId,
      programStartDate: parseDateInput(startDate),
      programEndDate: parseDateInput(endDate),
      notes: String(formData.get("notes") ?? "") || null,
    },
  });

  await logActivity(session.user.id, clientId, "client.updated", `Updated ${firstName} ${lastName}'s profile`);
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/clients");
  revalidatePath("/dashboard");
}

export async function setClientStatus(clientId: string, status: ClientStatus) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  await prisma.client.update({
    where: { id: clientId },
    data: { status },
  });

  await logActivity(session.user.id, clientId, "client.status", `Marked client as ${status.toLowerCase()}`);
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/dashboard");
}

/**
 * Bulk-delete clients by id. Coach can only delete their own clients; a
 * SUPER_ADMIN can delete any. Child records (assessments, plans, check-ins,
 * tokens, notes, follow-ups, activity) cascade via DB ON DELETE CASCADE.
 */
export async function bulkDeleteClients(ids: string[]): Promise<{ error?: string; count?: number }> {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const cleanIds = Array.isArray(ids)
    ? ids.filter((id): id is string => typeof id === "string" && id.length > 0).slice(0, 500)
    : [];
  if (cleanIds.length === 0) return { error: "Nothing selected to delete." };

  const result = await prisma.client.deleteMany({
    where: {
      id: { in: cleanIds },
      ...(session.user.role === "SUPER_ADMIN" ? {} : { coachId: session.user.id }),
    },
  });

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  return { count: result.count };
}

const TEST_DOMAINS = TEST_EMAIL_DOMAINS;

/** List obvious test/demo clients (reserved email domains) for cleanup. */
export async function getTestClients() {
  const session = await auth();
  if (!session?.user) return [];

  return prisma.client.findMany({
    where: {
      OR: TEST_DOMAINS.map((d) => ({ email: { endsWith: d } })),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      createdAt: true,
      _count: { select: { assessments: true, checkIns: true, plans: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Coach override of calculated nutrition targets. Null clears the override. */
export async function setNutritionTargets(
  clientId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const num = (name: string): number | null => {
    const v = String(formData.get(name) ?? "").trim();
    return v ? Number(v) : null;
  };

  await prisma.client.update({
    where: { id: clientId },
    data: {
      calorieTarget: num("calorieTarget"),
      proteinTargetG: num("proteinTargetG"),
      carbsTargetG: num("carbsTargetG"),
      fatTargetG: num("fatTargetG"),
    },
  });

  await logActivity(
    session.user.id,
    clientId,
    "client.targets",
    "Updated nutrition target overrides"
  );
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/dashboard");
  return {};
}