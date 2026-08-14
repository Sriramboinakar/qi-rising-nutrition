"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function createProgram(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Program name is required." };

  const slug = String(formData.get("slug") ?? "").trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  await prisma.program.create({
    data: {
      name,
      slug,
      description: String(formData.get("description") ?? ""),
      durationMonths: Number(formData.get("durationMonths") ?? 6),
      price: formData.get("price") ? Number(formData.get("price")) : null,
    },
  });

  revalidatePath("/programs");
}

export async function updateProgram(programId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Program name is required." };

  await prisma.program.update({
    where: { id: programId },
    data: {
      name,
      description: String(formData.get("description") ?? ""),
      durationMonths: Number(formData.get("durationMonths") ?? 6),
      price: formData.get("price") ? Number(formData.get("price")) : null,
      isActive: formData.get("isActive") === "on",
    },
  });

  revalidatePath("/programs");
}

export async function toggleProgramActive(programId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const program = await prisma.program.findUnique({ where: { id: programId } });
  if (!program) return;

  await prisma.program.update({
    where: { id: programId },
    data: { isActive: !program.isActive },
  });
  revalidatePath("/programs");
}