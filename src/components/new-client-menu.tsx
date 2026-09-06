"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientQuickLink } from "@/lib/actions/clients";
import { Button, Input, Label } from "@/components/ui";
import { PortalModal } from "@/components/portal-modal";
import { QUICK_GOALS } from "@/lib/questionnaire";
import type { GoalCategory } from "@/generated/prisma/enums";
import { Plus, Link2, Copy, Check, UserRoundPlus, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function NewClientMenu({
  label = "Add new client",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState<GoalCategory>("FAT_LOSS");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ clientId: string; url: string } | null>(null);
  const [created, setCreated] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await createClientQuickLink(name, goal);
      setResult({ clientId: res.clientId, url: `${window.location.origin}/intake/${res.intakeToken}` });
      setCreated(true);
    } catch {
      setError("Could not create the client. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function close() {
    setOpen(false);
    if (created) {
      router.refresh();
      setCreated(false);
    }
  }

  async function copy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy the link.");
    }
  }

  const whatsappUrl = result
    ? `https://wa.me/?text=${encodeURIComponent(
        `Hi! Please complete your Qi Rising Nutrition intake here — it takes a few minutes: ${result.url}`
      )}`
    : "";

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className={className}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Plus className="h-4 w-4" /> {label}
      </Button>

      <PortalModal
        open={open}
        onClose={close}
        title="Add a new client"
        subtitle="Generate an intake link to share on WhatsApp — no typing first."
      >
        {!result ? (
          <>
            <p className="text-xs font-medium text-stone-500">1 · Pick a goal</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {QUICK_GOALS.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setGoal(g.key)}
                  className={cn(
                    "rounded-xl border p-2.5 text-left transition-colors cursor-pointer",
                    goal === g.key
                      ? "border-brand-500 bg-brand-50"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  )}
                >
                  <span className="block text-sm font-semibold text-stone-900">{g.label}</span>
                  <span className="block text-[11px] leading-snug text-stone-500">{g.tagline}</span>
                </button>
              ))}
            </div>

            <div className="mt-4">
              <Label htmlFor="quick-client-name">Client name (optional)</Label>
              <Input
                id="quick-client-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    generate();
                  }
                }}
              />
            </div>
            {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
            <Button className="mt-3 w-full" onClick={generate} disabled={loading}>
              <Link2 className="h-4 w-4" /> {loading ? "Creating..." : "Generate intake link"}
            </Button>
            <p className="mt-2 text-xs text-stone-500">
              Creates the client and gives you a link to send on WhatsApp — the form auto-fits their goal.
            </p>
          </>
        ) : (
          <>
            <p className="text-xs text-green-700">
              Done! Their answers will save automatically to their profile.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <input
                readOnly
                value={result.url}
                onFocus={(e) => e.currentTarget.select()}
                className="h-9 w-full rounded-lg border border-stone-300 bg-stone-50 px-3 text-sm text-stone-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={copy}
                className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-stone-900 px-3 text-xs font-medium text-white transition-colors hover:bg-stone-800"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </>
                )}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#25D366] text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <Link
                href={`/clients/${result.clientId}`}
                onClick={close}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-white text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50"
              >
                Open profile
              </Link>
            </div>
          </>
        )}

        <div className="my-3 border-t border-stone-100" />
        <p className="text-xs font-medium text-stone-500">Prefer to fill in the details now?</p>
        <Link
          href="/clients/new"
          onClick={close}
          className={cn(
            "mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50"
          )}
        >
          <UserRoundPlus className="h-3.5 w-3.5" /> Add details manually
        </Link>
      </PortalModal>
    </>
  );
}