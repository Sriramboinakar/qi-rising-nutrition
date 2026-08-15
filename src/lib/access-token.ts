import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { addDays } from "date-fns";

export type AccessPurpose = "INTAKE" | "CHECKIN" | "PLAN";

// Kept for backwards compatibility: legacy tokens were issued with a 90-day
// expiry. New stable client links store expiresAt = null (never expires) so a
// saved WhatsApp link is not silently broken. The constant is only used when
// migrating/issuing tokens that still need an explicit expiry.
const LEGACY_TOKEN_TTL_DAYS = 90;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Derive a stable 32-byte AES-256 key from the deployment secret. */
function cipherKey(): Buffer {
  const secret = process.env.AUTH_SECRET ?? "qi-rising-dev-secret";
  return createHash("sha256").update(`qi-rising:client-link-encryption:${secret}`).digest();
}

/** Encrypt a raw token so the same URL can be re-displayed later. */
function encryptToken(token: string): string {
  const key = cipherKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

/** Decrypt a stored token ciphertext; returns null when unreadable. */
function decryptToken(payload: string): string | null {
  try {
    const buf = Buffer.from(payload, "base64");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const data = buf.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", cipherKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

async function createToken(clientId: string, purpose: AccessPurpose): Promise<string> {
  const raw = randomBytes(32).toString("base64url");
  await prisma.clientAccessToken.create({
    data: {
      clientId,
      purpose,
      tokenHash: hashToken(raw),
      tokenCipher: encryptToken(raw),
      // Stable link: never expires unless explicitly revoked/regenerated.
      expiresAt: null,
    },
  });
  return raw;
}

/**
 * Get the stable access link token for a client + purpose, creating it on
 * first use and reusing the same one afterward. The URL stays identical no
 * matter how many times links are requested.
 *
 * Legacy Phase 1 rows stored only a hash (no recoverable raw token). When such
 * a row is encountered it is revoked and a fresh stable token issued — the raw
 * value was never stored, so the old URL cannot be re-displayed.
 */
export async function getOrCreateAccessToken(
  clientId: string,
  purpose: AccessPurpose
): Promise<string> {
  const existing = await prisma.clientAccessToken.findFirst({
    where: { clientId, purpose, revokedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, tokenCipher: true },
  });

  if (existing) {
    if (existing.tokenCipher) {
      const raw = decryptToken(existing.tokenCipher);
      if (raw) return raw;
    }
    // Legacy / undecryptable token: cannot recover the raw value — revoke it
    // and issue a fresh stable one.
    await prisma.clientAccessToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });
  }

  return createToken(clientId, purpose);
}

/**
 * Intentional security action: revoke the current link for a client + purpose
 * and issue a brand-new one. Old URLs stop working immediately.
 */
export async function regenerateAccessToken(
  clientId: string,
  purpose: AccessPurpose
): Promise<string> {
  await prisma.clientAccessToken.updateMany({
    where: { clientId, purpose, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return createToken(clientId, purpose);
}

/**
 * Resolve a raw token to a client id if it is valid (not revoked, not
 * expired, purpose matches). Touches lastUsedAt on success. Returns null
 * when invalid — callers must treat null as "not found".
 *
 * Security checks are unchanged from Phase 1. expiresAt = null means the
 * link never expires; legacy tokens with a concrete expiry are still denied
 * once past that date.
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
  if (found.expiresAt && found.expiresAt < new Date()) return null;

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

// Retained so the LEGACY_TOKEN_TTL_DAYS constant is available to any code
// that still needs an explicit expiry (e.g. future revocable-token flows).
export function legacyTokenExpiry(from = new Date()): Date {
  return addDays(from, LEGACY_TOKEN_TTL_DAYS);
}