"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const KEYS = ["whatsapp_intake", "whatsapp_checkin", "whatsapp_greeting"] as const;

const DEFAULTS: Record<(typeof KEYS)[number], string> = {
  whatsapp_intake: "Hi! Please complete your Qi Rising Nutrition intake here — it takes a few minutes: {link}",
  whatsapp_checkin: "Hi! Here's your weekly check-in link: {link}",
  whatsapp_greeting: "Hi {name}! Quick check-in from Qi Rising Nutrition.",
};

export type MessageTemplates = { intake: string; checkin: string; greeting: string };

export async function getMessageTemplates(): Promise<MessageTemplates> {
  const session = await auth();
  if (!session?.user) return { intake: DEFAULTS.whatsapp_intake, checkin: DEFAULTS.whatsapp_checkin, greeting: DEFAULTS.whatsapp_greeting };

  const rows = await prisma.setting.findMany({ where: { key: { in: [...KEYS] } } });
  const map = new Map(rows.map((r) => [r.key, r.value]));

  return {
    intake: map.get("whatsapp_intake") ?? DEFAULTS.whatsapp_intake,
    checkin: map.get("whatsapp_checkin") ?? DEFAULTS.whatsapp_checkin,
    greeting: map.get("whatsapp_greeting") ?? DEFAULTS.whatsapp_greeting,
  };
}

export async function saveMessageTemplates(formData: FormData): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const values: Record<(typeof KEYS)[number], string> = {
    whatsapp_intake: String(formData.get("intake") ?? "").trim() || DEFAULTS.whatsapp_intake,
    whatsapp_checkin: String(formData.get("checkin") ?? "").trim() || DEFAULTS.whatsapp_checkin,
    whatsapp_greeting: String(formData.get("greeting") ?? "").trim() || DEFAULTS.whatsapp_greeting,
  };

  for (const key of KEYS) {
    await prisma.setting.upsert({
      where: { key },
      update: { value: values[key] },
      create: { key, value: values[key] },
    });
  }

  revalidatePath("/settings");
  return {};
}