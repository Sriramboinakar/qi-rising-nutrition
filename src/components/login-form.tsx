"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { Leaf, Lock, Mail } from "lucide-react";
import { Button, Input, Label } from "@/components/ui";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, {});

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600">
          <Leaf className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Qi Rising Nutrition
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Private coaching management platform
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input id="email" name="email" type="email" required autoComplete="email" className="pl-9" />
          </div>
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <Input id="password" name="password" type="password" required autoComplete="current-password" className="pl-9" />
          </div>
        </div>

        {state?.error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        ) : null}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
}