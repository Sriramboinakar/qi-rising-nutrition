"use client";

import { useState } from "react";
import { getClientAccessLinks, regenerateClientAccessLink } from "@/lib/actions/intake";
import { Button, Badge } from "@/components/ui";
import { Link2, Copy, Check, RefreshCw } from "lucide-react";
import type { AccessPurpose } from "@/lib/access-token";

type LinksState = Awaited<ReturnType<typeof getClientAccessLinks>>;

type Row = {
  purpose: AccessPurpose;
  label: string;
  hint: string;
  url: string | null;
  status: { label: string; tone: "green" | "amber" | "neutral" };
  lockedNote?: string;
};

export function ClientAccessLinks({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState<LinksState | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadLinks() {
    setLoading(true);
    setError(null);
    try {
      setLinks(await getClientAccessLinks(clientId));
    } catch (e) {
      setError("Could not load links. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }

  async function rotate(purpose: AccessPurpose) {
    const name = purpose === "INTAKE" ? "intake" : purpose === "CHECKIN" ? "check-in" : "plan";
    if (!window.confirm(`Regenerate the ${name} link? The old URL will stop working.`)) return;
    setError(null);
    try {
      await regenerateClientAccessLink(clientId, purpose);
      await loadLinks();
    } catch (e) {
      setError("Could not regenerate the link.");
      console.error(e);
    }
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const rows: Row[] = links
    ? [
        {
          purpose: "INTAKE",
          label: "Intake form",
          hint: "One-time onboarding form",
          url: `${origin}/intake/${links.intake}`,
          status: links.intakeSubmitted
            ? { label: "✓ Completed", tone: "green" }
            : { label: "Pending", tone: "amber" },
        },
        {
          purpose: "CHECKIN",
          label: "Weekly check-in",
          hint: "Same link every week",
          url: links.checkin ? `${origin}/checkin/${links.checkin}` : null,
          status: links.checkin
            ? { label: "Ready", tone: "green" }
            : { label: "Locked", tone: "neutral" },
          lockedNote: "Available once the intake is completed.",
        },
        {
          purpose: "PLAN",
          label: "Nutrition plan",
          hint: links.activePlanName ? `Plan: ${links.activePlanName}` : "Shows your current plan",
          url: links.plan ? `${origin}/plan/${links.plan}` : null,
          status: links.plan
            ? { label: "Active", tone: "green" }
            : { label: "Waiting", tone: "amber" },
          lockedNote: "Available once your coach publishes an active plan.",
        },
      ]
    : [];

  function copyMessage() {
    const lines: string[] = [];
    for (const row of rows) {
      if (!row.url) continue;
      lines.push(`${row.label}: ${row.url}`);
    }
    if (lines.length === 0) return;
    copy(lines.join("\n"), "message");
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setOpen((v) => !v);
          if (!links && !loading) loadLinks();
        }}
      >
        <Link2 className="h-4 w-4" /> Client links
      </Button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] rounded-xl border border-stone-200 bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-stone-900">Share with client</p>
            <Badge tone="green">Stable links</Badge>
          </div>
          <p className="mt-0.5 text-xs text-stone-500">
            Each link stays the same — copy it any time. Revoke &amp; regenerate if it&apos;s ever shared
            publicly.
          </p>

          {loading ? (
            <p className="mt-3 text-sm text-stone-500">Loading links...</p>
          ) : error ? (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          ) : links ? (
            <div className="mt-3 space-y-2">
              {rows.map((row) => (
                <div
                  key={row.purpose}
                  className="flex items-center justify-between gap-2 rounded-lg border border-stone-100 bg-stone-50 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-stone-800">{row.label}</p>
                      <Badge tone={row.status.tone}>{row.status.label}</Badge>
                    </div>
                    <p className="truncate text-xs text-stone-400">{row.hint}</p>
                    {!row.url && row.lockedNote ? (
                      <p className="text-xs text-stone-400">{row.lockedNote}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {row.url ? (
                      <>
                        <button
                          type="button"
                          onClick={() => copy(row.url!, row.purpose)}
                          className="rounded-md p-1.5 text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-900"
                          aria-label={`Copy ${row.label} link`}
                          title={`Copy ${row.label} link`}
                          data-clipboard-text={row.url!}
                        >
                          {copied === row.purpose ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => rotate(row.purpose)}
                          className="rounded-md p-1.5 text-stone-400 transition-colors hover:bg-stone-200 hover:text-stone-900"
                          aria-label={`Regenerate ${row.label} link`}
                          title="Regenerate (old link stops working)"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={copyMessage}>
                  Copy all links
                </Button>
                <p className="text-xs text-stone-400">Paste into WhatsApp or email</p>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}