"use client";

import { useActionState } from "react";
import { submitClientCheckIn } from "@/lib/actions/client-checkin";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";

export function ClientCheckInForm({ token, clientName }: { token: string; clientName: string }) {
  const [state, action, pending] = useActionState(
    (_prev: { error?: string } | null, formData: FormData) => submitClientCheckIn(token, formData),
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
          <h2 className="text-lg font-semibold text-stone-900">Check-in submitted</h2>
          <p className="mt-1 text-sm text-stone-500">
            Thanks, {clientName}! Your coach will review your check-in and respond if needed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="weightKg">Current weight (kg)</Label>
          <Input id="weightKg" name="weightKg" type="number" step="0.1" inputMode="decimal" />
        </div>
        <div>
          <Label htmlFor="waterLiters">Water today (liters)</Label>
          <Input id="waterLiters" name="waterLiters" type="number" step="0.1" inputMode="decimal" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="adherencePct">Meal plan adherence (%)</Label>
          <Input id="adherencePct" name="adherencePct" type="number" min={0} max={100} inputMode="numeric" />
        </div>
        <div>
          <Label htmlFor="sleepHours">Avg sleep (hours)</Label>
          <Input id="sleepHours" name="sleepHours" type="number" step="0.5" inputMode="decimal" />
        </div>
        <div>
          <Label htmlFor="energyLevel">Energy (1-10)</Label>
          <Select id="energyLevel" name="energyLevel" defaultValue="">
            <option value="">Select...</option>
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="mood">Mood (1-10)</Label>
          <Select id="mood" name="mood" defaultValue="">
            <option value="">Select...</option>
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes for your coach</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Challenges, wins, questions, cravings, anything you want to share"
        />
      </div>

      {state && "error" in state ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Submitting..." : "Submit weekly check-in"}
      </Button>
    </form>
  );
}