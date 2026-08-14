import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { subWeeks, subDays } from "date-fns";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: "admin@qirising.com" } });
  if (!admin) throw new Error("Admin not found");
  const program = await prisma.program.findFirst({ where: { slug: "6-month-nutrition-coaching" } });
  if (!program) throw new Error("Program not found");

  const existing = await prisma.client.findFirst({ where: { email: "demo@client.com" } });
  if (existing) {
    console.log("Demo client exists, skipping.");
    return;
  }

  const client = await prisma.client.create({
    data: {
      firstName: "Sarah",
      lastName: "Demo",
      email: "demo@client.com",
      phone: "+1 555 0100",
      sex: "female",
      category: "FAT_LOSS",
      coachId: admin.id,
      programId: program.id,
      programStartDate: subWeeks(new Date(), 8),
      programEndDate: subWeeks(new Date(), -16),
      notes: "Demo client for testing. Goal: fat loss with muscle preservation.",
    },
  });

  await prisma.assessment.create({
    data: {
      clientId: client.id,
      type: "INITIAL",
      date: subWeeks(new Date(), 8),
      weightKg: 74,
      goalWeightKg: 65,
      heightCm: 168,
      bodyFatPct: 28,
      waistCm: 82,
      chestCm: 92,
      hipsCm: 100,
      activityLevel: "moderate",
      goalSummary: "Lose 9kg over 6 months while building lean muscle.",
      allergies: "None",
    },
  });

  const plan = await prisma.nutritionPlan.create({
    data: {
      clientId: client.id,
      name: "Phase 1 — Cut",
      status: "ACTIVE",
      calories: 1800,
      proteinG: 130,
      carbsG: 150,
      fatG: 60,
      waterLiters: 2.5,
      startDate: subWeeks(new Date(), 8),
      endDate: subWeeks(new Date(), -4),
      meals: {
        create: [
          {
            mealOrder: 1,
            mealName: "Breakfast",
            timeOfDay: "7:30 AM",
            foods: "Oats, whey protein, banana, almond milk",
            calories: 420,
            proteinG: 35,
            carbsG: 55,
            fatG: 8,
          },
          {
            mealOrder: 2,
            mealName: "Lunch",
            timeOfDay: "12:30 PM",
            foods: "Chicken breast, brown rice, roasted vegetables",
            calories: 520,
            proteinG: 45,
            carbsG: 55,
            fatG: 14,
          },
          {
            mealOrder: 3,
            mealName: "Dinner",
            timeOfDay: "7:00 PM",
            foods: "Salmon, sweet potato, green salad",
            calories: 560,
            proteinG: 40,
            carbsG: 40,
            fatG: 25,
          },
        ],
      },
    },
  });

  for (let w = 8; w >= 1; w--) {
    await prisma.checkIn.create({
      data: {
        clientId: client.id,
        weekNumber: 9 - w,
        checkInDate: subWeeks(new Date(), w),
        status: "COMPLETED",
        weightKg: 74 - (8 - w) * 0.7,
        waistCm: 82 - (8 - w) * 0.4,
        adherencePct: w % 3 === 0 ? 72 : 90,
        sleepHours: 7.2,
        energyLevel: 7,
        mood: 8,
        notes: "Good week, energy consistent.",
        response: "Keep it up, macros looking great.",
      },
    });
  }

  for (let p = 0; p < 5; p++) {
    await prisma.progressEntry.create({
      data: {
        clientId: client.id,
        date: subWeeks(new Date(), 8 - p * 2),
        weightKg: 74 - p * 1.2,
        waistCm: 82 - p * 0.8,
        bodyFatPct: 28 - p * 1.1,
        chestCm: 92,
        hipsCm: 100 - p * 0.5,
      },
    });
  }

  const habits = await Promise.all(
    ["10k steps daily", "Meal prep on Sunday", "150g protein daily"].map((name) =>
      prisma.habit.create({ data: { clientId: client.id, name, frequency: "DAILY" } })
    )
  );
  for (const habit of habits) {
    for (let d = 0; d < 5; d++) {
      await prisma.habitLog.create({
        data: { habitId: habit.id, date: subDays(new Date(), d) },
      });
    }
  }

  await prisma.coachNote.create({
    data: {
      clientId: client.id,
      authorId: admin.id,
      title: "Meal prep concerns",
      body: "Sarah struggles with lunch prep on busy workdays. Discussed batch-cooking strategies.",
      pinned: true,
    },
  });

  await prisma.followUp.create({
    data: {
      clientId: client.id,
      authorId: admin.id,
      title: "Check meal prep progress",
      description: "Follow up on batch cooking habit",
      dueDate: subDays(new Date(), -1),
      priority: "HIGH",
    },
  });

  await prisma.followUp.create({
    data: {
      clientId: client.id,
      authorId: admin.id,
      title: "Review phase 2 plan",
      dueDate: subDays(new Date(), -6),
      priority: "MEDIUM",
    },
  });

  await prisma.activity.create({
    data: {
      clientId: client.id,
      userId: admin.id,
      type: "client.created",
      message: "Created client Sarah Demo",
    },
  });

  console.log("Demo client created with full dataset.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());