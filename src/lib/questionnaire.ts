import type { GoalCategory } from "@/generated/prisma/enums";

/**
 * Shevvy-friendly zero-config goal presets.
 *
 * The four most common coaching goals are surfaced as one-tap options when
 * adding a client. Everything downstream (intake guidance, check-in focus,
 * plan targets) adapts automatically from the client's goal — no manual
 * questionnaire edits required.
 */
export type QuickGoal = {
  key: GoalCategory;
  label: string;
  tagline: string;
};

export const QUICK_GOALS: QuickGoal[] = [
  { key: "FAT_LOSS", label: "Fat Loss", tagline: "Satiety-first, high-protein" },
  { key: "MUSCLE_BUILDING", label: "Muscle Gain", tagline: "Clean surplus & recovery" },
  { key: "LIFESTYLE_OPTIMIZATION", label: "General Wellness", tagline: "Balanced, sustainable habits" },
  { key: "POSTPARTUM_SUPPORT", label: "Postpartum", tagline: "Recovery, supply & energy" },
];

/** Friendly headline shown at the top of the client intake form. */
export function goalIntakeGuidance(goal: GoalCategory): string | null {
  switch (goal) {
    case "FAT_LOSS":
      return "We'll focus on keeping you full and energetic while your body uses stored fat for fuel. Protein is your best friend.";
    case "MUSCLE_BUILDING":
      return "We'll focus on eating just above maintenance with quality protein around each workout so you can build lean muscle.";
    case "POSTPARTUM_SUPPORT":
      return "We'll prioritise iron, calcium, healthy fats and gentle, steady energy. Recovery and your little one come first.";
    case "LIFESTYLE_OPTIMIZATION":
      return "We'll build simple, repeatable habits that feel easy and actually stick — small wins every week.";
    default:
      return null;
  }
}

/** Goal-specific focus question shown on the weekly check-in form. */
export function goalCheckinFocus(goal: GoalCategory): string | null {
  switch (goal) {
    case "FAT_LOSS":
      return "Satiety & cravings — how full did meals keep you, and what triggered cravings this week?";
    case "MUSCLE_BUILDING":
      return "Recovery & appetite — did you hit your food targets and recover well from training?";
    case "POSTPARTUM_SUPPORT":
      return "Energy, supply & rest — how are your energy levels, milk supply and sleep this week?";
    case "LIFESTYLE_OPTIMIZATION":
      return "Habit check — which healthy habits felt easy this week, and which slipped?";
    default:
      return "Anything you want your coach to know this week?";
  }
}

/** True when the intake form should show the extra postpartum questions. */
export function needsPostpartumQuestions(goal: GoalCategory): boolean {
  return goal === "POSTPARTUM_SUPPORT";
}

/** Compose the intake `notes` value, merging postpartum answers when present. */
export function composeIntakeNotes(formData: FormData): string | null {
  const postpartumAnswers = [
    String(formData.get("postpartumBreastfeeding") ?? "").trim(),
    String(formData.get("postpartumNutrients") ?? "").trim(),
    String(formData.get("postpartumPelvic") ?? "").trim(),
  ].filter(Boolean);

  const notes = String(formData.get("notes") ?? "").trim();
  const parts: string[] = [];
  if (postpartumAnswers.length > 0) {
    parts.push(
      "POSTPARTUM CHECK-IN\n" +
        postpartumAnswers
          .map((a, i) => {
            const label = ["Breastfeeding", "Iron / calcium / fats", "Pelvic recovery"][i] ?? "";
            return `${label}: ${a}`;
          })
          .join("\n")
    );
  }
  if (notes) parts.push(notes);
  return parts.join("\n\n") || null;
}