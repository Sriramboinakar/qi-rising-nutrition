"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleUserActive, resetUserPassword } from "@/lib/actions/users";
import { Badge, Button, Input, Label } from "@/components/ui";
import { ROLE_LABELS } from "@/lib/labels";
import { KeyRound, UserX, UserCheck } from "lucide-react";

export function UserRow({
  user,
  isSelf,
}: {
  user: { id: string; name: string; email: string; role: string; isActive: boolean };
  isSelf: boolean;
}) {
  const router = useRouter();
  const [showReset, setShowReset] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      await toggleUserActive(user.id);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function reset(formData: FormData) {
    setBusy(true);
    setError(null);
    try {
      const res = await resetUserPassword(user.id, formData);
      if (res?.error) setError(res.error);
      setShowReset(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-b border-stone-100 px-5 py-4 last:border-0">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm font-semibold text-stone-600">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-stone-900">
              {user.name}
              {isSelf ? <span className="ml-2 text-xs text-stone-400">(you)</span> : null}
            </p>
            <p className="truncate text-xs text-stone-500">{user.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={user.role === "SUPER_ADMIN" ? "violet" : "blue"}>
            {ROLE_LABELS[user.role] ?? user.role}
          </Badge>
          <Badge tone={user.isActive ? "green" : "neutral"}>
            {user.isActive ? "Active" : "Disabled"}
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => setShowReset((v) => !v)} disabled={isSelf}>
            <KeyRound className="h-3.5 w-3.5" /> Reset password
          </Button>
          {!isSelf ? (
            <Button variant="ghost" size="sm" onClick={toggle} disabled={busy}>
              {user.isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
              {user.isActive ? "Disable" : "Enable"}
            </Button>
          ) : null}
        </div>
      </div>

      {showReset ? (
        <form action={reset} className="mt-3 flex items-end gap-3 rounded-lg bg-stone-50 p-3">
          <div className="flex-1">
            <Label htmlFor={`pw-${user.id}`}>New password</Label>
            <Input id={`pw-${user.id}`} name="password" type="password" required minLength={8} />
          </div>
          <Button type="submit" size="sm" disabled={busy}>
            Save
          </Button>
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
        </form>
      ) : null}
    </div>
  );
}