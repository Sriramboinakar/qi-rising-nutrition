import type { Metadata } from "next";
import LoginForm from "@/components/login-form";

export const metadata: Metadata = {
  title: "Sign in — Qi Rising Nutrition",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <LoginForm />
    </div>
  );
}