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

  return (
    <form action={action} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Calculator className="h-4 w-4 text-stone-400" />
        <p className="text-sm font-medium text-stone-800">Set custom targets</p>
        <span className="text-xs text-stone-400">overrides calculated values</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <Label htmlFor="calorieTarget">Calories (kcal)</Label>
          <Input
            id="calorieTarget"
            name="calorieTarget"
            type="number"
            defaultValue={current.calories ?? calculated.calories ?? ""}
            placeholder={calculated.calories ? `Calc: ${calculated.calories}` : "—"}
          />
        </div>
        <div>
          <Label htmlFor="proteinTargetG">Protein (g)</Label>
          <Input
            id="proteinTargetG"
            name="proteinTargetG"
            type="number"
            defaultValue={current.protein ?? calculated.protein ?? ""}
            placeholder={calculated.protein ? `Calc: ${calculated.protein}` : "—"}
          />
        </div>
        <div>
          <Label htmlFor="carbsTargetG">Carbs (g)</Label>
          <Input
            id="carbsTargetG"
            name="carbsTargetG"
            type="number"
            defaultValue={current.carbs ?? calculated.carbs ?? ""}
            placeholder={calculated.carbs ? `Calc: ${calculated.carbs}` : "—"}
          />
        </div>
        <div>
          <Label htmlFor="fatTargetG">Fat (g)</Label>
          <Input
            id="fatTargetG"
            name="fatTargetG"
            type="number"
            defaultValue={current.fat ?? calculated.fat ?? ""}
            placeholder={calculated.fat ? `Calc: ${calculated.fat}` : "—"}
          />
        </div>
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