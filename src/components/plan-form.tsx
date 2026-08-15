"use client";

import { useActionState, useState } from "react";
import { createPlan } from "@/lib/actions/plans";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";
import { PLAN_STATUS_LABELS } from "@/lib/labels";
import { Plus, Trash2 } from "lucide-react";

type State = { error?: string };

type MealRow = {
  name: string;
  time: string;
  foods: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  notes: string;
};

const EMPTY_MEAL: MealRow = {
  name: "",
  time: "",
  foods: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  notes: "",
};

export function PlanForm({
  clientId,
  prefill,
}: {
  clientId: string;
  prefill?: {
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
  };
}) {
  const [meals, setMeals] = useState<MealRow[]>([EMPTY_MEAL]);
  const [calories, setCalories] = useState(prefill?.calories?.toString() ?? "");
  const [protein, setProtein] = useState(prefill?.protein?.toString() ?? "");
  const [carbs, setCarbs] = useState(prefill?.carbs?.toString() ?? "");
  const [fat, setFat] = useState(prefill?.fat?.toString() ?? "");

  const [state, formAction, pending] = useActionState<State, FormData>(async (_prev, fd) => {
    const res = await createPlan(clientId, fd);
    return res ?? {};
  }, {});

  const updateMeal = (index: number, field: keyof MealRow, value: string) => {
    setMeals((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  return (
    <form action={formAction} className="space-y-6">
      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="name">Plan name *</Label>
          <Input id="name" name="name" required placeholder="e.g. Phase 1 — Cut" />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue="DRAFT">
            {Object.entries(PLAN_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="waterLiters">Water target (L)</Label>
          <Input id="waterLiters" name="waterLiters" type="number" step="0.1" placeholder="2.5" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <Label htmlFor="calories">Calories (kcal)</Label>
          <Input
            id="calories"
            name="calories"
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="proteinG">Protein (g)</Label>
          <Input
            id="proteinG"
            name="proteinG"
            type="number"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="carbsG">Carbs (g)</Label>
          <Input
            id="carbsG"
            name="carbsG"
            type="number"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="fatG">Fat (g)</Label>
          <Input
            id="fatG"
            name="fatG"
            type="number"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
          />
        </div>
      </div>
      {prefill ? (
        <p className="-mt-2 text-xs text-stone-400">
          Prefilled from the client&apos;s calculated targets — adjust freely before saving.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="startDate">Start date</Label>
          <Input id="startDate" name="startDate" type="date" />
        </div>
        <div>
          <Label htmlFor="endDate">End date</Label>
          <Input id="endDate" name="endDate" type="date" />
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label className="mb-0">Meals</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMeals((prev) => [...prev, EMPTY_MEAL])}
          >
            <Plus className="h-3.5 w-3.5" /> Add meal
          </Button>
        </div>
        <input type="hidden" name="mealCount" value={meals.length} />
        <div className="space-y-4">
          {meals.map((meal, index) => (
            <div key={index} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Meal {index + 1}
                </p>
                <button
                  type="button"
                  onClick={() => setMeals((prev) => prev.filter((_, i) => i !== index))}
                  className="text-stone-400 transition-colors hover:text-red-600 cursor-pointer"
                  aria-label="Remove meal"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label htmlFor={`meal_${index}_name`}>Meal name</Label>
                  <Input
                    id={`meal_${index}_name`}
                    name={`meal_${index}_name`}
                    placeholder="Breakfast"
                    value={meal.name}
                    onChange={(e) => updateMeal(index, "name", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`meal_${index}_time`}>Time</Label>
                  <Input
                    id={`meal_${index}_time`}
                    name={`meal_${index}_time`}
                    placeholder="7:30 AM"
                    value={meal.time}
                    onChange={(e) => updateMeal(index, "time", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor={`meal_${index}_foods`}>Foods</Label>
                  <Input
                    id={`meal_${index}_foods`}
                    name={`meal_${index}_foods`}
                    placeholder="Oats, whey, banana, almond milk"
                    value={meal.foods}
                    onChange={(e) => updateMeal(index, "foods", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`meal_${index}_calories`}>Calories</Label>
                  <Input
                    id={`meal_${index}_calories`}
                    name={`meal_${index}_calories`}
                    type="number"
                    value={meal.calories}
                    onChange={(e) => updateMeal(index, "calories", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`meal_${index}_protein`}>Protein (g)</Label>
                  <Input
                    id={`meal_${index}_protein`}
                    name={`meal_${index}_protein`}
                    type="number"
                    value={meal.protein}
                    onChange={(e) => updateMeal(index, "protein", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`meal_${index}_carbs`}>Carbs (g)</Label>
                  <Input
                    id={`meal_${index}_carbs`}
                    name={`meal_${index}_carbs`}
                    type="number"
                    value={meal.carbs}
                    onChange={(e) => updateMeal(index, "carbs", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor={`meal_${index}_fat`}>Fat (g)</Label>
                  <Input
                    id={`meal_${index}_fat`}
                    name={`meal_${index}_fat`}
                    type="number"
                    value={meal.fat}
                    onChange={(e) => updateMeal(index, "fat", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-4">
                  <Label htmlFor={`meal_${index}_notes`}>Notes</Label>
                  <Textarea
                    id={`meal_${index}_notes`}
                    name={`meal_${index}_notes`}
                    rows={1}
                    value={meal.notes}
                    onChange={(e) => updateMeal(index, "notes", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="supplements">Supplements</Label>
        <Textarea id="supplements" name="supplements" rows={2} placeholder="Creatine, whey, omega-3, ..." />
      </div>
      <div>
        <Label htmlFor="notes">Plan notes</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Create plan"}
      </Button>
    </form>
  );
}