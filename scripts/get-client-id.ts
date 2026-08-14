import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  const client = await prisma.client.findUnique({ where: { email: "demo@client.com" } });
  console.log(client?.id);
  await prisma.$disconnect();
}

main();