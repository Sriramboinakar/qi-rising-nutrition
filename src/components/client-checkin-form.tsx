"use client";

import { useActionState, useState } from "react";
import { submitClientCheckIn } from "@/lib/actions/client-checkin";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";
import { goalCheckinFocus } from "@/lib/questionnaire";
import { Camera, X } from "lucide-react";
import type { GoalCategory } from "@/generated/prisma/enums";

const MAX_PHOTOS = 3;
const MAX_EDGE = 1600;
const MAX_PHOTO_BYTES = 600 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(file);
  });
}

/** Resize to ≤1600px longest edge, JPEG, retrying lower quality until ≤600KB. */
async function resizeToJpeg(file: File): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Could not read image"));
    el.src = dataUrl;
  });

  const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(img, 0, 0, w, h);

  const prefix = "data:image/jpeg;base64,";
  for (const quality of [0.8, 0.6, 0.5]) {
    const out = canvas.toDataURL("image/jpeg", quality);
    const bytes = Math.round((out.length - prefix.length) * 0.75);
    if (bytes <= MAX_PHOTO_BYTES) return out;
  }
  throw new Error("Photo is too large even after resizing.");
}

export function ClientCheckInForm({
  token,
  clientName,
  clientGoal,
}: {
  token: string;
  clientName: string;
  clientGoal?: GoalCategory;
}) {
  const [state, action, pending] = useActionState(
    (_prev: { error?: string } | null, formData: FormData) => submitClientCheckIn(token, formData),
    null
  );

  const focusLabel = clientGoal ? goalCheckinFocus(clientGoal) : null;
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);

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

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS - photos.length);
    setPhotoError(null);
    for (const file of files) {
      try {
        const resized = await resizeToJpeg(file);
        setPhotos((prev) => (prev.length >= MAX_PHOTOS ? prev : [...prev, resized]));
      } catch {
        setPhotoError("This photo is too large. Please try a smaller photo.");
      }
    }
    e.target.value = "";
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

      {focusLabel ? (
        <div className="rounded-xl bg-brand-50 px-4 py-3">
          <Label htmlFor="goalFocus">This week&apos;s focus</Label>
          <p className="mb-1.5 text-xs text-brand-700">{focusLabel}</p>
          <Textarea id="goalFocus" name="goalFocus" placeholder="A quick line or two is perfect" rows={2} />
        </div>
      ) : null}

      <div className="rounded-xl border border-stone-200 p-4">
        <p className="text-sm font-semibold text-stone-800">Progress photos (optional)</p>
        <p className="mt-0.5 text-xs text-stone-500">
          Share only what you&apos;re comfortable with — Shevvy sees these privately.
        </p>
        <div className="mt-3 flex flex-wrap items-start gap-3">
          {photos.map((photo, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt={`Progress photo ${i + 1}`} className="h-20 w-20 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                className="absolute -right-3 -top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-stone-900 text-white shadow-sm transition-colors hover:bg-stone-700"
                aria-label={`Remove photo ${i + 1}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS ? (
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 text-stone-400 transition-colors hover:border-brand-400 hover:text-brand-500">
              <Camera className="h-6 w-6" />
              <span className="mt-1 text-[10px] font-medium">Add</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                className="sr-only"
                onChange={onFiles}
              />
            </label>
          ) : null}
        </div>
        <p className="mt-2 text-xs text-stone-400">
          {photos.length}/{MAX_PHOTOS} photos added
        </p>
        {photoError ? <p className="mt-2 text-sm text-red-600">{photoError}</p> : null}
        {photos.map((photo, i) => (
          <input key={i} type="hidden" name={`photo${i}`} value={photo} />
        ))}
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