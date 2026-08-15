import type { GoalCategory } from "@/generated/prisma/enums";

/**
 * Centralized nutrition calculations.
 *
 * All functions are pure and reusable across the client profile, dashboard,
 * meal-plan generation, and progress tracking. Values are ESTIMATES based on
 * standard population formulas (Mifflin-St Jeor for BMR) — never medical
 * diagnoses. Callers should clearly label them as calculated.
 */

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/** Goal-based calorie adjustment applied to TDEE. */
const GOAL_CALORIE_ADJUSTMENT: Record<GoalCategory, number> = {
  FAT_LOSS: -400,
  MUSCLE_BUILDING: 300,
  BODY_RECOMPOSITION: -100,
  WEIGHT_MAINTENANCE: 0,
  PERFORMANCE: 100,
  LIFESTYLE_OPTIMIZATION: -50,
  LONGEVITY: -50,
  POSTPARTUM_SUPPORT: 100,
  SUSTAINABLE_HABITS: -100,
};

/** Protein grams per kg of bodyweight by goal. */
const GOAL_PROTEIN_PER_KG: Record<GoalCategory, number> = {
  FAT_LOSS: 2.0,
  MUSCLE_BUILDING: 2.0,
  BODY_RECOMPOSITION: 2.0,
  WEIGHT_MAINTENANCE: 1.6,
  PERFORMANCE: 1.8,
  LIFESTYLE_OPTIMIZATION: 1.6,
  LONGEVITY: 1.6,
  POSTPARTUM_SUPPORT: 1.6,
  SUSTAINABLE_HABITS: 1.6,
};

/** Fat calories as a fraction of total calories. */
const FAT_CALORIE_RATIO = 0.25;

const round = (n: number) => Math.round(n);
const safeNum = (v: unknown): number | null => {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/** Body Mass Index (kg/m²). */
export function calculateBmi(weightKg: number | null, heightCm: number | null): number | null {
  const w = safeNum(weightKg);
  const h = safeNum(heightCm);
  if (w === null || h === null || h <= 0) return null;
  const m = h / 100;
  return round((w / (m * m)) * 10) / 10;
}

/**
 * Basal Metabolic Rate via Mifflin-St Jeor (kcal/day).
 * Requires sex + age; returns null when data is missing.
 */
export function calculateBmr(
  weightKg: number | null,
  heightCm: number | null,
  ageYears: number | null,
  sex: string | null | undefined
): number | null {
  const w = safeNum(weightKg);
  const h = safeNum(heightCm);
  if (w === null || h === null || ageYears === null || !sex) return null;

  const base = 10 * w + 6.25 * h - 5 * ageYears;
  if (sex === "male") return round(base + 5);
  if (sex === "female") return round(base - 161);
  // Other / unspecified: average of the two formulas rather than guessing.
  return round(base + (5 - 161) / 2);
}

/** Estimated Total Daily Energy Expenditure (kcal/day). */
export function calculateTdee(
  bmr: number | null,
  activityLevel: string | null | undefined
): number | null {
  if (bmr === null) return null;
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel as ActivityLevel];
  if (!multiplier) return null;
  return round(bmr * multiplier);
}

/** Suggested calorie target for a goal, based on TDEE. */
export function suggestCalories(
  tdee: number | null,
  goal: GoalCategory
): number | null {
  if (tdee === null) return null;
  return round(tdee + GOAL_CALORIE_ADJUSTMENT[goal]);
}

/**
 * Suggested macro targets (grams). Protein from bodyweight + goal, fat as a
 * fixed fraction of calories, carbs as the remainder of calories.
 */
export function suggestMacros(
  calories: number | null,
  weightKg: number | null,
  goal: GoalCategory
): { proteinG: number | null; carbsG: number | null; fatG: number | null } {
  const w = safeNum(weightKg);
  if (calories === null || w === null) {
    return { proteinG: null, carbsG: null, fatG: null };
  }

  const proteinG = round(w * GOAL_PROTEIN_PER_KG[goal]);
  const fatG = round((calories * FAT_CALORIE_RATIO) / 9);
  const carbCalories = calories - proteinG * 4 - fatG * 9;
  const carbsG = round(Math.max(0, carbCalories / 4));

  return { proteinG, carbsG, fatG };
}

/** Weight change in kg + percentage change relative to the previous value. */
export function calculateWeightChange(
  currentKg: number | null,
  previousKg: number | null
): { changeKg: number | null; changePct: number | null } {
  const cur = safeNum(currentKg);
  const prev = safeNum(previousKg);
  if (cur === null || prev === null || prev === 0) {
    return { changeKg: null, changePct: null };
  }
  const changeKg = round((cur - prev) * 10) / 10;
  const changePct = round(((cur - prev) / prev) * 1000) / 10;
  return { changeKg, changePct };
}

// ---------------------------------------------------------------------------
// Aggregated profile
// ---------------------------------------------------------------------------

export type NutritionProfile = {
  bmi: number | null;
  bmr: number | null;
  tdee: number | null;
  calorieTarget: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  /** True when any required input is missing. */
  incomplete: boolean;
  /** Human-readable list of missing inputs (for the "not enough data" state). */
  missing: string[];
};

type NutritionInput = {
  weightKg: number | null;
  heightCm: number | null;
  dateOfBirth: Date | string | null;
  sex: string | null | undefined;
  activityLevel: string | null | undefined;
  goal: GoalCategory;
};

function ageInYears(dob: Date | string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age >= 0 ? age : null;
}

/**
 * Compute the full nutrition profile for a client from their base profile +
 * latest assessment. Returns null fields + missing[] when data is insufficient
 * rather than guessing.
 */
export function buildNutritionProfile(input: NutritionInput): NutritionProfile {
  const missing: string[] = [];
  if (safeNum(input.weightKg) === null) missing.push("weight");
  if (safeNum(input.heightCm) === null) missing.push("height");
  if (!input.activityLevel) missing.push("activity level");
  const age = ageInYears(input.dateOfBirth);
  if (age === null) missing.push("date of birth");
  if (!input.sex) missing.push("sex");

  const bmi = calculateBmi(input.weightKg, input.heightCm);
  const bmr = calculateBmr(input.weightKg, input.heightCm, age, input.sex);
  const tdee = calculateTdee(bmr, input.activityLevel);
  const calorieTarget = suggestCalories(tdee, input.goal);
  const macros = suggestMacros(calorieTarget, input.weightKg, input.goal);

  const incomplete = missing.length > 0 || bmr === null || calorieTarget === null;

  return {
    bmi,
    bmr,
    tdee,
    calorieTarget,
    proteinG: macros.proteinG,
    carbsG: macros.carbsG,
    fatG: macros.fatG,
    incomplete,
    missing,
  };
}