"use client";

import { useActionState } from "react";
import { createProgressEntry, createProgressPhoto } from "@/lib/actions/progress";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";
import { PHOTO_TYPE_LABELS } from "@/lib/labels";

type State = { error?: string };

export function ProgressEntryForm({ clientId }: { clientId: string }) {
  const [state, formAction, pending] = useActionState<State, FormData>(async (_prev, fd) => {
    const res = await createProgressEntry(clientId, fd);
    return res ?? {};
  }, {});

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>
        <div>
          <Label htmlFor="weightKg">Weight (kg)</Label>
          <Input id="weightKg" name="weightKg" type="number" step="0.1" />
        </div>
        <div>
          <Label htmlFor="bodyFatPct">Body fat (%)</Label>
          <Input id="bodyFatPct" name="bodyFatPct" type="number" step="0.1" />
        </div>
        <div>
          <Label htmlFor="waistCm">Waist (cm)</Label>
          <Input id="waistCm" name="waistCm" type="number" step="0.1" />
        </div>
        <div>
          <Label htmlFor="chestCm">Chest (cm)</Label>
          <Input id="chestCm" name="chestCm" type="number" step="0.1" />
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
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Record measurements"}
      </Button>
    </form>
  );
}

export function PhotoForm({ clientId }: { clientId: string }) {
  const [state, formAction, pending] = useActionState<State, FormData>(async (_prev, fd) => {
    const res = await createProgressPhoto(clientId, fd);
    return res ?? {};
  }, {});

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="url">Photo URL</Label>
          <Input id="url" name="url" type="url" placeholder="https://..." required />
        </div>
        <div>
          <Label htmlFor="type">Angle</Label>
          <Select id="type" name="type" defaultValue="FRONT">
            {Object.entries(PHOTO_TYPE_LABELS).map(([value, label]) => (
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
      </div>
      <div>
        <Label htmlFor="note">Note</Label>
        <Input id="note" name="note" placeholder="e.g. Week 8 front" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Add photo"}
      </Button>
    </form>
  );
}