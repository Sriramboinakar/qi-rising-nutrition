"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { logActivity } from "@/lib/activity";

export async function createNote(clientId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || !body) return { error: "Title and note body are required." };

  await prisma.coachNote.create({
    data: { clientId, authorId: session.user.id, title, body },
  });

  await logActivity(session.user.id, clientId, "note.created", `Added note "${title}"`);
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/notes`);
}

export async function togglePin(noteId: string, clientId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  const note = await prisma.coachNote.findUnique({ where: { id: noteId } });
  if (!note) return;

  await prisma.coachNote.update({
    where: { id: noteId },
    data: { pinned: !note.pinned },
  });
  revalidatePath(`/clients/${clientId}/notes`);
}

export async function deleteNote(noteId: string, clientId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Not authenticated");

  await prisma.coachNote.delete({ where: { id: noteId } });
  revalidatePath(`/clients/${clientId}/notes`);
}