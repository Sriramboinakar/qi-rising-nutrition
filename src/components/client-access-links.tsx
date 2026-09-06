"use client";

import { useState, useEffect } from "react";
import { getClientAccessLinks, regenerateClientAccessLink } from "@/lib/actions/intake";
import { getMessageTemplates } from "@/lib/actions/messages";
import { whatsappShareUrl } from "@/lib/messages";
import { Button, Badge } from "@/components/ui";
import { PortalModal } from "@/components/portal-modal";
import { Link2, Copy, Check, RefreshCw, MessageCircle } from "lucide-react";
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
  const [intakeTemplate, setIntakeTemplate] = useState("");

  useEffect(() => {
    getMessageTemplates()
      .then((t) => setIntakeTemplate(t.intake))
      .catch(() => {});
  }, []);

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
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setOpen(true);
          if (!links && !loading) loadLinks();
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Link2 className="h-4 w-4" /> Client links
      </Button>

      <PortalModal
        open={open}
        onClose={() => setOpen(false)}
        title="Share with client"
        subtitle="Each link stays the same — copy it any time. Revoke &amp; regenerate if it&apos;s ever shared publicly."
      >
        {loading ? (
          <p className="py-6 text-center text-sm text-stone-500">Loading links...</p>
        ) : error ? (
          <p className="py-6 text-center text-sm text-red-600">{error}</p>
        ) : links ? (
          <div className="space-y-2">
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
                        className="flex h-11 w-11 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-900"
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
                        className="flex h-11 w-11 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-200 hover:text-stone-900"
                        aria-label={`Regenerate ${row.label} link`}
                        title="Regenerate (old link stops working)"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="ghost" size="sm" onClick={copyMessage}>
                  Copy all links
                </Button>
                {rows.find((r) => r.purpose === "INTAKE")?.url ? (
                  <a
                    href={whatsappShareUrl(
                      intakeTemplate,
                      rows.find((r) => r.purpose === "INTAKE")?.url ?? ""
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-[#25D366] px-3 text-xs font-semibold text-white transition-opacity hover:opacity-90 sm:h-8 sm:min-h-0"
                  >
                    <MessageCircle className="h-4 w-4" /> Share on WhatsApp
                  </a>
                ) : null}
              </div>
              <p className="text-xs text-stone-400">Paste into WhatsApp or email</p>
            </div>
          </div>
        ) : null}
      </PortalModal>
    </>
  );
}