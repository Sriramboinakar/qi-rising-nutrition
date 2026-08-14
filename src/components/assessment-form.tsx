"use client";

import { useActionState } from "react";
import { createAssessment } from "@/lib/actions/assessment";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";
import { ASSESSMENT_TYPE_LABELS } from "@/lib/labels";

type State = { error?: string };

export function AssessmentForm({ clientId }: { clientId: string }) {
  const [state, formAction, pending] = useActionState<State, FormData>(async (_prev, fd) => {
    const res = await createAssessment(clientId, fd);
    return res ?? {};
  }, {});

  return (
    <form action={formAction} className="space-y-5">
      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="type">Type</Label>
          <Select id="type" name="type" defaultValue="INITIAL">
            {Object.entries(ASSESSMENT_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>
        <div>
          <Label htmlFor="activityLevel">Activity level</Label>
          <Select id="activityLevel" name="activityLevel" defaultValue="">
            <option value="">Not specified</option>
            <option value="sedentary">Sedentary</option>
            <option value="light">Lightly active</option>
            <option value="moderate">Moderately active</option>
            <option value="active">Very active</option>
            <option value="very_active">Athlete</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <Label htmlFor="weightKg">Weight (kg)</Label>
          <Input id="weightKg" name="weightKg" type="number" step="0.1" />
        </div>
        <div>
          <Label htmlFor="goalWeightKg">Goal weight (kg)</Label>
          <Input id="goalWeightKg" name="goalWeightKg" type="number" step="0.1" />
        </div>
        <div>
          <Label htmlFor="heightCm">Height (cm)</Label>
          <Input id="heightCm" name="heightCm" type="number" step="0.1" />
        </div>
        <div>
          <Label htmlFor="bodyFatPct">Body fat (%)</Label>
          <Input id="bodyFatPct" name="bodyFatPct" type="number" step="0.1" />
        </div>
        <div>
          <Label htmlFor="chestCm">Chest (cm)</Label>
          <Input id="chestCm" name="chestCm" type="number" step="0.1" />
        </div>
        <div>
          <Label htmlFor="waistCm">Waist (cm)</Label>
          <Input id="waistCm" name="waistCm" type="number" step="0.1" />
        </div>
        <div>
          <Label htmlFor="hipsCm">Hips (cm)</Label>
          <Input id="hipsCm" name="hipsCm" type="number" step="0.1" />
        </div>
        <div>
          <Label htmlFor="armCm">Arm (cm)</Label>
          <Input id="armCm" name="armCm" type="number" step="0.1" />
        </div>
        <div>
          <Label htmlFor="thighCm">Thigh (cm)</Label>
          <Input id="thighCm" name="thighCm" type="number" step="0.1" />
        </div>
      </div>

      <div>
        <Label htmlFor="goalSummary">Goal summary</Label>
        <Textarea id="goalSummary" name="goalSummary" rows={2} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="medicalNotes">Medical notes</Label>
          <Textarea id="medicalNotes" name="medicalNotes" rows={2} />
        </div>
        <div>
          <Label htmlFor="allergies">Allergies</Label>
          <Textarea id="allergies" name="allergies" rows={2} />
        </div>
        <div>
          <Label htmlFor="medications">Medications</Label>
          <Textarea id="medications" name="medications" rows={2} />
        </div>
        <div>
          <Label htmlFor="lifestyleNotes">Lifestyle notes</Label>
          <Textarea id="lifestyleNotes" name="lifestyleNotes" rows={2} />
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save assessment"}
      </Button>
    </form>
  );
}