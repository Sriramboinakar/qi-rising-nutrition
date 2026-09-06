"use client";

import { useActionState } from "react";
import { setNutritionTargets } from "@/lib/actions/clients";
import { Button, Input, Label } from "@/components/ui";
import { Calculator } from "lucide-react";

export function NutritionTargetOverride({
  clientId,
  current,
  calculated,
}: {
  clientId: string;
  current: { calories: number | null; protein: number | null; carbs: number | null; fat: number | null };
  calculated: { calories: number | null; protein: number | null; carbs: number | null; fat: number | null };
}) {
  const [state, action, pending] = useActionState(
    (_prev: { error?: string } | null, fd: FormData) => setNutritionTargets(clientId, fd),
    null
  );

  const fields = [
    {
      id: "calorieTarget",
      label: "Calories (kcal)",
      current: current.calories,
      suggested: calculated.calories,
    },
    {
      id: "proteinTargetG",
      label: "Protein (g)",
      current: current.protein,
      suggested: calculated.protein,
    },
    {
      id: "carbsTargetG",
      label: "Carbs (g)",
      current: current.carbs,
      suggested: calculated.carbs,
    },
    {
      id: "fatTargetG",
      label: "Fat (g)",
      current: current.fat,
      suggested: calculated.fat,
    },
  ];

  return (
    <form action={action} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Calculator className="h-4 w-4 text-stone-400" />
        <p className="text-sm font-medium text-stone-800">Set custom targets</p>
        <span className="text-xs text-stone-400">only what you save counts</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {fields.map((f) => (
          <div key={f.id}>
            <Label htmlFor={f.id}>{f.label}</Label>
            <Input id={f.id} name={f.id} type="number" defaultValue={f.current ?? ""} placeholder="—" />
            {f.suggested != null ? (
              <p className="mt-1 text-[11px] text-stone-400">
                Suggested based on intake: {f.suggested} — you decide
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {state?.error ? (
        <p className="mt-2 text-sm text-red-600">{state.error}</p>
      ) : null}

      <div className="mt-3">
        <Button type="submit" variant="secondary" size="sm" disabled={pending}>
          {pending ? "Saving..." : "Save targets"}
        </Button>
      </div>
    </form>
  );
}