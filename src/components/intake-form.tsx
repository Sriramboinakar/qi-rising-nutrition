"use client";

import { useActionState } from "react";
import { submitIntake } from "@/lib/actions/intake";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";
import { GOAL_CATEGORY_LABELS } from "@/lib/labels";

export function IntakeForm({ token, clientName }: { token: string; clientName: string }) {
  const [state, action, pending] = useActionState(
    (_prev: { error?: string } | null, formData: FormData) => submitIntake(token, formData),
    null
  );

  if (state && "ok" in state) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-6 w-6">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Intake submitted</h2>
          <p className="mt-1 text-sm text-stone-500">
            Thanks, {clientName}! Your coach has been notified and will review your information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" name="firstName" required autoComplete="given-name" />
        </div>
        <div>
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" name="lastName" required autoComplete="family-name" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="dateOfBirth">Date of birth</Label>
          <Input id="dateOfBirth" name="dateOfBirth" type="date" />
        </div>
        <div>
          <Label htmlFor="sex">Sex</Label>
          <Select id="sex" name="sex" defaultValue="">
            <option value="">Prefer not to say</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="goal">Primary goal</Label>
          <Select id="goal" name="goal" defaultValue="FAT_LOSS">
            {Object.entries(GOAL_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="heightCm">Height (cm)</Label>
          <Input id="heightCm" name="heightCm" type="number" step="0.1" inputMode="decimal" required />
        </div>
        <div>
          <Label htmlFor="weightKg">Current weight (kg)</Label>
          <Input id="weightKg" name="weightKg" type="number" step="0.1" inputMode="decimal" required />
        </div>
        <div>
          <Label htmlFor="goalWeightKg">Goal weight (kg)</Label>
          <Input id="goalWeightKg" name="goalWeightKg" type="number" step="0.1" inputMode="decimal" />
        </div>
      </div>

      <div>
        <Label htmlFor="activityLevel">Activity level</Label>
        <Select id="activityLevel" name="activityLevel" defaultValue="">
          <option value="">Select...</option>
          <option value="sedentary">Sedentary (little or no exercise)</option>
          <option value="light">Light (1-3 workouts / week)</option>
          <option value="moderate">Moderate (3-5 workouts / week)</option>
          <option value="active">Active (6-7 workouts / week)</option>
          <option value="very_active">Very active (hard training / physical job)</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="dietaryPreference">Dietary preference</Label>
        <Select id="dietaryPreference" name="dietaryPreference" defaultValue="">
          <option value="">Select...</option>
          <option value="no_preference">No preference</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
          <option value="eggetarian">Eggetarian</option>
          <option value="pescatarian">Pescatarian</option>
          <option value="keto">Low carb / Keto</option>
          <option value="gluten_free">Gluten-free</option>
          <option value="dairy_free">Dairy-free</option>
          <option value="halal">Halal</option>
          <option value="jain">Jain</option>
        </Select>
      </div>

      <div>
        <Label htmlFor="foodRestrictions">Foods to avoid</Label>
        <Input id="foodRestrictions" name="foodRestrictions" placeholder="e.g. peanuts, shellfish" />
      </div>

      <div>
        <Label htmlFor="mealTiming">Meal timing preference</Label>
        <Select id="mealTiming" name="mealTiming" defaultValue="">
          <option value="">Select...</option>
          <option value="3_meals">3 meals a day</option>
          <option value="3_meals_2_snacks">3 meals + 2 snacks</option>
          <option value="5_meals">5 small meals</option>
          <option value="intermittent_fasting">Intermittent fasting</option>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="sleepHours">Avg sleep (hours/night)</Label>
          <Input id="sleepHours" name="sleepHours" type="number" step="0.5" inputMode="decimal" />
        </div>
        <div>
          <Label htmlFor="waterLiters">Daily water (liters)</Label>
          <Input id="waterLiters" name="waterLiters" type="number" step="0.1" inputMode="decimal" />
        </div>
      </div>

      <div>
        <Label htmlFor="goalSummary">Your goals</Label>
        <Textarea id="goalSummary" name="goalSummary" placeholder="What would you like to achieve?" />
      </div>

      <div>
        <Label htmlFor="medicalNotes">Medical information</Label>
        <Textarea
          id="medicalNotes"
          name="medicalNotes"
          placeholder="Any medical conditions your coach should know about"
        />
      </div>

      <div>
        <Label htmlFor="allergies">Allergies</Label>
        <Input id="allergies" name="allergies" placeholder="e.g. nuts, dairy, gluten" />
      </div>

      <div>
        <Label htmlFor="medications">Medications / supplements</Label>
        <Input id="medications" name="medications" />
      </div>

      <div>
        <Label htmlFor="lifestyleNotes">Lifestyle</Label>
        <Textarea
          id="lifestyleNotes"
          name="lifestyleNotes"
          placeholder="Work schedule, stress, cooking habits, anything relevant"
        />
      </div>

      <div>
        <Label htmlFor="notes">Anything else?</Label>
        <Textarea id="notes" name="notes" />
      </div>

      {state && "error" in state ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Submitting..." : "Submit my intake"}
      </Button>
    </form>
  );
}