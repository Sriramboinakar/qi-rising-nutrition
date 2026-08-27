"use client";

import { useActionState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { loginAction } from "@/lib/actions/auth";
import { Lock, Mail } from "lucide-react";
import { Button, Input, Label } from "@/components/ui";
import { BrandLogo } from "@/components/brand-logo";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, {});
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="w-full max-w-sm"
      initial={reduced ? false : { opacity: 0, y: 16, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="mb-8 text-center"
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/30">
          <BrandLogo className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Qi Rising Nutrition
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Private coaching management platform
        </p>
      </motion.div>

      <motion.form
        action={formAction}
        className="space-y-4"
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
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
          <motion.p
            initial={reduced ? false : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {state.error}
          </motion.p>
        ) : null}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </motion.form>
    </motion.div>
  );
}