import type { Metadata } from "next";
import LoginForm from "@/components/login-form";

export const metadata: Metadata = {
  title: "Sign in — Qi Rising Nutrition",
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-stone-50 px-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brand-100/60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-emerald-100/50 blur-3xl"
      />
      <LoginForm />
    </div>
  );
}