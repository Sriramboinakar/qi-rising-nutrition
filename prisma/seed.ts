import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const programs = [
    {
      name: "6-Month Nutrition Coaching",
      slug: "6-month-nutrition-coaching",
      description:
        "Structured transformation with nutrition consistency, habit development, body composition goals and ongoing accountability.",
      durationMonths: 6,
    },
    {
      name: "12-Month Nutrition Coaching",
      slug: "12-month-nutrition-coaching",
      description:
        "Long-term transformation with sustainable lifestyle changes, performance, body composition and continuous coaching.",
      durationMonths: 12,
    },
  ];

  for (const program of programs) {
    await prisma.program.upsert({
      where: { slug: program.slug },
      update: {},
      create: program,
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@qirising.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Qirising@2026";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.user.create({
      data: {
        name: "Sriram",
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 12),
        role: "SUPER_ADMIN",
      },
    });
  }

  console.log("Seed complete.");
  console.log(`Programs: ${programs.length} created/verified.`);
  console.log(`Admin login: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });