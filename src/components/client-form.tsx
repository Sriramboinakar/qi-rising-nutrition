"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createClient, updateClient } from "@/lib/actions/clients";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";
import { GOAL_CATEGORY_LABELS, CLIENT_STATUS_LABELS, SEX_LABELS } from "@/lib/labels";
import type { ClientModel } from "@/generated/prisma/models";
import type { ProgramModel } from "@/generated/prisma/models";

type Props = {
  mode: "create" | "edit";
  client?: ClientModel;
  programs: ProgramModel[];
};

type State = { error?: string };

function toInputDate(value: Date | null | undefined): string {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export function ClientForm({ mode, client, programs }: Props) {
  const router = useRouter();
  const boundAction = async (_prev: State, fd: FormData): Promise<State> => {
    const res =
      mode === "edit" && client ? await updateClient(client.id, fd) : await createClient(fd);
    if (res && "id" in res && res.id) {
      router.push(`/clients/${res.id}`);
      return {};
    }
    return res ?? {};
  };

  const [state, formAction, pending] = useActionState(boundAction, {});

  return (
    <form action={formAction} className="space-y-6">
      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName">First name *</Label>
          <Input id="firstName" name="firstName" required defaultValue={client?.firstName} />
        </div>
        <div>
          <Label htmlFor="lastName">Last name *</Label>
          <Input id="lastName" name="lastName" required defaultValue={client?.lastName} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={client?.email ?? ""} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={client?.phone ?? ""} />
        </div>
        <div>
          <Label htmlFor="sex">Sex</Label>
          <Select id="sex" name="sex" defaultValue={client?.sex ?? ""}>
            <option value="">Not specified</option>
            {Object.entries(SEX_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="category">Goal category</Label>
          <Select id="category" name="category" defaultValue={client?.category ?? "FAT_LOSS"}>
            {Object.entries(GOAL_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        {mode === "edit" && client ? (
          <div>
            <Label htmlFor="status">Status</Label>
            <Select id="status" name="status" defaultValue={client.status}>
              {Object.entries(CLIENT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        ) : null}
        <div>
          <Label htmlFor="programId">Program</Label>
          <Select id="programId" name="programId" defaultValue={client?.programId ?? ""}>
            <option value="">No program</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="programStartDate">Program start date</Label>
          <Input
            id="programStartDate"
            name="programStartDate"
            type="date"
            defaultValue={toInputDate(client?.programStartDate)}
          />
        </div>
        <div>
          <Label htmlFor="programEndDate">Program end date</Label>
          <Input
            id="programEndDate"
            name="programEndDate"
            type="date"
            defaultValue={toInputDate(client?.programEndDate)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={3} defaultValue={client?.notes ?? ""} />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : mode === "create" ? "Create client" : "Save changes"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}