"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientQuickLink } from "@/lib/actions/clients";
import { Button, Input, Label } from "@/components/ui";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ clientId: string; url: string } | null>(null);
  const [created, setCreated] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (created) {
          router.refresh();
          setCreated(false);
        }
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [created, router]);

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await createClientQuickLink(name);
      setResult({ clientId: res.clientId, url: `${window.location.origin}/intake/${res.intakeToken}` });
      setCreated(true);
    } catch {
      setError("Could not create the client. Please try again.");
    } finally {
      setLoading(false);
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
    <div ref={rootRef} className="relative">
      <Button onClick={() => setOpen((v) => !v)} className={className} aria-haspopup="dialog" aria-expanded={open}>
        <Plus className="h-4 w-4" /> {label}
      </Button>

      {open ? (
        <div
          role="dialog"
          className="absolute right-0 z-30 mt-2 w-[24rem] max-w-[calc(100vw-2rem)] rounded-xl border border-stone-200 bg-white p-4 shadow-lg"
        >
          <p className="text-sm font-medium text-stone-900">Add a new client</p>

          {!result ? (
            <>
              <div className="mt-3">
                <Label htmlFor="quick-client-name">Client name (optional)</Label>
                <Input
                  id="quick-client-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                />
              </div>
              {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
              <Button className="mt-3 w-full" onClick={generate} disabled={loading}>
                <Link2 className="h-4 w-4" /> {loading ? "Creating..." : "Generate intake link"}
              </Button>
              <p className="mt-2 text-xs text-stone-500">
                Creates the client and gives you a link to send on WhatsApp — no typing first.
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-xs text-green-700">
                Done! Their answers will save automatically to their profile.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <input
                  readOnly
                  value={result.url}
                  onFocus={(e) => e.currentTarget.select()}
                  className="h-9 w-full rounded-lg border border-stone-300 bg-stone-50 px-3 text-xs text-stone-600 focus:outline-none"
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
            className={cn(
              "mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50"
            )}
          >
            <UserRoundPlus className="h-3.5 w-3.5" /> Add details manually
          </Link>
        </div>
      ) : null}
    </div>
  );
}