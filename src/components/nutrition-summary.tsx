import { Card, CardHeader, Badge } from "@/components/ui";
import { buildNutritionProfile } from "@/lib/nutrition";
import type { GoalCategory } from "@/generated/prisma/enums";

export type NutritionSummarySource = {
  weightKg: number | null;
  heightCm: number | null;
  dateOfBirth: Date | null;
  sex: string | null;
  activityLevel: string | null;
  goal: GoalCategory;
  calorieTarget: number | null;
  proteinTargetG: number | null;
  carbsTargetG: number | null;
  fatTargetG: number | null;
};

function Row({ label, value, source }: { label: string; value: string; source: "calc" | "override" | "none" }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">{label}</dt>
      <dd className="mt-0.5 flex items-center gap-1.5 text-sm text-stone-800">
        {value}
        {source === "calc" ? (
          <span className="rounded bg-brand-50 px-1 text-[10px] font-medium text-brand-700">calc</span>
        ) : source === "override" ? (
          <span className="rounded bg-amber-50 px-1 text-[10px] font-medium text-amber-700">override</span>
        ) : null}
      </dd>
    </div>
  );
}

export function NutritionSummary({ source }: { source: NutritionSummarySource }) {
  const profile = buildNutritionProfile({
    weightKg: source.weightKg,
    heightCm: source.heightCm,
    dateOfBirth: source.dateOfBirth,
    sex: source.sex,
    activityLevel: source.activityLevel,
    goal: source.goal,
  });

  const hasOverride = source.calorieTarget !== null;

  // When incomplete, still show BMI if possible, but show "Not enough data"
  // for the energy/macro block.
  return (
    <Card>
      <CardHeader
        title="Nutrition summary"
        action={
          <span className="text-xs text-stone-400">Estimates — review before use</span>
        }
      />
      {profile.incomplete ? (
        <div className="px-5 py-6">
          <Badge tone="amber">Not enough data</Badge>
          <p className="mt-2 text-sm text-stone-500">
            Add height, weight, activity level{!source.sex ? ", sex" : ""}
            {!source.dateOfBirth ? ", date of birth" : ""} to calculate nutrition targets.
          </p>
        </div>
      ) : (
        <dl className="grid grid-cols-2 gap-x-8 gap-y-4 px-5 py-4 sm:grid-cols-4">
          <Row label="BMI" value={profile.bmi !== null ? String(profile.bmi) : "—"} source="calc" />
          <Row label="BMR" value={profile.bmr !== null ? `${profile.bmr} kcal` : "—"} source="calc" />
          <Row label="TDEE" value={profile.tdee !== null ? `${profile.tdee} kcal` : "—"} source="calc" />
          <Row
            label="Calorie target"
            value={hasOverride ? `${source.calorieTarget} kcal` : "—"}
            source={hasOverride ? "override" : "none"}
          />
          <Row
            label="Protein"
            value={hasOverride ? `${source.proteinTargetG ?? "—"} g` : "—"}
            source={hasOverride ? "override" : "none"}
          />
          <Row
            label="Carbs"
            value={hasOverride ? `${source.carbsTargetG ?? "—"} g` : "—"}
            source={hasOverride ? "override" : "none"}
          />
          <Row
            label="Fat"
            value={hasOverride ? `${source.fatTargetG ?? "—"} g` : "—"}
            source={hasOverride ? "override" : "none"}
          />
        </dl>
      )}
    </Card>
  );
}