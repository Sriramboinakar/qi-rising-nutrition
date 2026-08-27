/** Reserved test/demo email domains used by seeded and E2E clients. */
export const TEST_EMAIL_DOMAINS = ["@qirising.test", "@example.com", "@test.local"];

/** True when a client looks like obvious test/demo data (reserved domains). */
export function isTestClientEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const lower = email.toLowerCase();
  return TEST_EMAIL_DOMAINS.some((d) => lower.endsWith(d));
}