import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { addDays } from "date-fns";

export type AccessPurpose = "INTAKE" | "CHECKIN" | "PLAN";

const ACCESS_TOKEN_TTL_DAYS = 90;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Create a fresh access token for a client. Returns the raw token once;
 * only its SHA-256 hash is stored. Invalidates any previous token for the
 * same client+purpose so old links stop working immediately.
 */
export async function issueAccessToken(clientId: string, purpose: AccessPurpose): Promise<string> {
  const raw = randomBytes(32).toString("base64url");

  await prisma.$transaction([
    prisma.clientAccessToken.updateMany({
      where: { clientId, purpose, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
    prisma.clientAccessToken.create({
      data: {
        clientId,
        purpose,
        tokenHash: hashToken(raw),
        expiresAt: addDays(new Date(), ACCESS_TOKEN_TTL_DAYS),
      },
    }),
  ]);

  return raw;
}

/**
 * Resolve a raw token to a client id if it is valid (not revoked, not
 * expired, purpose matches). Touches lastUsedAt on success. Returns null
 * when invalid — callers must treat null as "not found".
 */
export async function resolveAccessToken(
  token: string,
  purpose: AccessPurpose
): Promise<string | null> {
  if (!token) return null;

  const found = await prisma.clientAccessToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { id: true, clientId: true, purpose: true, expiresAt: true, revokedAt: true },
  });

  if (!found) return null;
  if (found.purpose !== purpose) return null;
  if (found.revokedAt) return null;
  if (found.expiresAt < new Date()) return null;

  await prisma.clientAccessToken.update({
    where: { id: found.id },
    data: { lastUsedAt: new Date() },
  });

  return found.clientId;
}

/** Revoke all access for a client (used when access should be cut off). */
export async function revokeAllClientAccess(clientId: string): Promise<void> {
  await prisma.clientAccessToken.updateMany({
    where: { clientId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}