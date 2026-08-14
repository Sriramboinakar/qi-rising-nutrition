"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "@/lib/actions/users";
import { Button, Input, Label, Select } from "@/components/ui";
import { ROLE_LABELS } from "@/lib/labels";

type State = { error?: string };

export function UserForm() {
  const router = useRouter();

  const [state, formAction, pending] = useActionState<State, FormData>(async (_prev, fd) => {
    const res = await createUser(fd);
    if (!res?.error) router.refresh();
    return res ?? {};
  }, {});

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required minLength={8} />
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <Select id="role" name="role" defaultValue="COACH">
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create user"}
      </Button>
    </form>
  );
}