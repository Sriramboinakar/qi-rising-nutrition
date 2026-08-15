import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma 7's PostgreSQL adapter and the pg driver do not bundle correctly
  // inside Next.js server-action bundles in dev; keep them external.
  serverExternalPackages: ["@prisma/adapter-pg", "pg"],
};

export default nextConfig;
