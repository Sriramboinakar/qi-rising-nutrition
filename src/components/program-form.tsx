"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createProgram, updateProgram } from "@/lib/actions/programs";
import { Button, Input, Label, Textarea } from "@/components/ui";
import type { ProgramModel } from "@/generated/prisma/models";

type State = { error?: string };

export function ProgramForm({ mode, program }: { mode: "create" | "edit"; program?: ProgramModel }) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState<State, FormData>(async (_prev, fd) => {
    const res = program ? await updateProgram(program.id, fd) : await createProgram(fd);
    if (mode === "create") router.refresh();
    return res ?? {};
  }, {});

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}

      {mode === "create" ? (
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" placeholder="auto-generated if empty" defaultValue={program?.slug} />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required defaultValue={program?.name} placeholder="e.g. 6-Month Nutrition Coaching" />
        </div>
        <div>
          <Label htmlFor="durationMonths">Duration (months)</Label>
          <Input id="durationMonths" name="durationMonths" type="number" min={1} defaultValue={program?.durationMonths ?? 6} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={3} defaultValue={program?.description ?? ""} />
        </div>
        <div>
          <Label htmlFor="price">Price (optional)</Label>
          <Input id="price" name="price" type="number" step="0.01" defaultValue={program?.price?.toString() ?? ""} placeholder="0.00" />
        </div>
      </div>

      {mode === "edit" && program ? (
        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-stone-600">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={program.isActive}
            className="h-5 w-5 rounded border-stone-300 accent-brand-600"
          />
          Active (available for new clients)
        </label>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : mode === "create" ? "Create program" : "Save changes"}
        </Button>
        {mode === "edit" ? (
          <Button type="button" variant="ghost" onClick={() => router.refresh()}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}