import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  const clients = await prisma.client.findMany({
    where: { email: { contains: "test" } },
    select: { id: true, firstName: true, lastName: true, email: true },
  });
  console.log(JSON.stringify(clients, null, 2));
  await prisma.$disconnect();
}

main();