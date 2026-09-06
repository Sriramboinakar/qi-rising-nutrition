"use client";

import { useActionState, useState } from "react";
import { createCheckIn, updateCheckIn } from "@/lib/actions/checkins";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";
import { CHECKIN_STATUS_LABELS } from "@/lib/labels";
import type { CheckInStatus } from "@/generated/prisma/enums";

type State = { error?: string };

export type SerializableCheckIn = {
  id: string;
  weekNumber: number;
  checkInDate: string;
  status: CheckInStatus;
  weightKg: string | null;
  waistCm: string | null;
  sleepHours: string | null;
  energyLevel: number | null;
  mood: number | null;
  adherencePct: number | null;
  waterLiters: string | null;
  notes: string | null;
  response: string | null;
  summary: string | null;
  reviewedAt: string | null;
  followUpDate: string | null;
};

function toInputDate(value: Date | string | null | undefined): string {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function CheckInForm({
  clientId,
  checkIn,
  nextWeek,
}: {
  clientId: string;
  checkIn?: SerializableCheckIn;
  nextWeek?: number;
}) {
  const [showFollowUp, setShowFollowUp] = useState(Boolean(checkIn?.followUpDate));

  const [state, formAction, pending] = useActionState<State, FormData>(async (_prev, fd) => {
    const res = checkIn
      ? await updateCheckIn(clientId, checkIn.id, fd)
      : await createCheckIn(clientId, fd);
    return res ?? {};
  }, {});

  const field = (value: number | null | undefined | { toString: () => string }) =>
    value === null || value === undefined ? "" : String(value);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="weekNumber">Week number</Label>
          <Input
            id="weekNumber"
            name="weekNumber"
            type="number"
            min={1}
            required
            defaultValue={checkIn?.weekNumber ?? nextWeek ?? 1}
            disabled={Boolean(checkIn)}
          />
        </div>
        <div>
          <Label htmlFor="date">Check-in date</Label>
          <Input id="date" name="date" type="date" defaultValue={toInputDate(checkIn?.checkInDate)} />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue={checkIn?.status ?? "COMPLETED"}>
            {Object.entries(CHECKIN_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <Label htmlFor="weightKg">Weight (kg)</Label>
          <Input id="weightKg" name="weightKg" type="number" step="0.1" defaultValue={field(checkIn?.weightKg)} />
        </div>
        <div>
          <Label htmlFor="waistCm">Waist (cm)</Label>
          <Input id="waistCm" name="waistCm" type="number" step="0.1" defaultValue={field(checkIn?.waistCm)} />
        </div>
        <div>
          <Label htmlFor="sleepHours">Sleep (hours)</Label>
          <Input id="sleepHours" name="sleepHours" type="number" step="0.1" defaultValue={field(checkIn?.sleepHours)} />
        </div>
        <div>
          <Label htmlFor="waterLiters">Water (L)</Label>
          <Input id="waterLiters" name="waterLiters" type="number" step="0.1" defaultValue={field(checkIn?.waterLiters)} />
        </div>
        <div>
          <Label htmlFor="energyLevel">Energy (1-10)</Label>
          <Input id="energyLevel" name="energyLevel" type="number" min={1} max={10} defaultValue={field(checkIn?.energyLevel)} />
        </div>
        <div>
          <Label htmlFor="mood">Mood (1-10)</Label>
          <Input id="mood" name="mood" type="number" min={1} max={10} defaultValue={field(checkIn?.mood)} />
        </div>
        <div>
          <Label htmlFor="adherencePct">Adherence (%)</Label>
          <Input id="adherencePct" name="adherencePct" type="number" min={0} max={100} defaultValue={field(checkIn?.adherencePct)} />
        </div>
        <div>
          <Label htmlFor="followUpToggle">Follow-up</Label>
          <div className="flex min-h-11 items-center gap-2 py-1">
            <input
              id="followUpToggle"
              type="checkbox"
              checked={showFollowUp}
              onChange={(e) => setShowFollowUp(e.target.checked)}
              className="h-5 w-5 cursor-pointer rounded border-stone-300 accent-brand-600"
            />
            <label htmlFor="followUpToggle" className="text-sm text-stone-600">
              Schedule follow-up
            </label>
          </div>
        </div>
      </div>

      {showFollowUp ? (
        <div className="max-w-xs">
          <Label htmlFor="followUpDate">Follow-up date</Label>
          <Input
            id="followUpDate"
            name="followUpDate"
            type="date"
            defaultValue={toInputDate(checkIn?.followUpDate)}
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="notes">Client notes</Label>
          <Textarea id="notes" name="notes" rows={3} defaultValue={checkIn?.notes ?? ""} placeholder="How is the week going?" />
        </div>
        <div>
          <Label htmlFor="response">Coach response</Label>
          <Textarea id="response" name="response" rows={3} defaultValue={checkIn?.response ?? ""} placeholder="Feedback to share with the client" />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : checkIn ? "Save changes" : "Record check-in"}
      </Button>
    </form>
  );
}