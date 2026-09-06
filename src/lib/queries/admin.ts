import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";

// Platform-level data changes rarely — cache across requests so repeat visits
// are instant. Client-specific data is NEVER cached here (always fresh).
const REVALIDATE = 300; // 5 minutes

export const getProgramsForAdmin = unstable_cache(
  async () =>
    prisma.program.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { clients: true } } },
    }),
  ["admin", "programs"],
  { revalidate: REVALIDATE }
);

export const getUsersForAdmin = unstable_cache(
  async () =>
    prisma.user.findMany({
      orderBy: [{ role: "desc" }, { name: "asc" }],
      select: { id: true, name: true, email: true, role: true, isActive: true },
    }),
  ["admin", "users"],
  { revalidate: REVALIDATE }
);

export const getSettingsForAdmin = unstable_cache(
  async () => prisma.setting.findMany(),
  ["admin", "settings"],
  { revalidate: REVALIDATE }
);