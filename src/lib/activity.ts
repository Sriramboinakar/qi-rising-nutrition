import { prisma } from "@/lib/db";

export async function logActivity(
  userId: string,
  clientId: string | null,
  type: string,
  message: string
) {
  await prisma.activity.create({
    data: { userId, clientId, type, message },
  });
}