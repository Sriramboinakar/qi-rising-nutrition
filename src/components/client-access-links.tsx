"use client";

import { useState } from "react";
import { createClientAccessLinks } from "@/lib/actions/intake";
import { Button } from "@/components/ui";
import { Link2, Copy, Check } from "lucide-react";

type LinkRow = { label: string; url: string };

export function ClientAccessLinks({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState<LinkRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadLinks() {
    setLoading(true);
    setError(null);
    try {
      const { intake, checkin, plan } = await createClientAccessLinks(clientId);
      const origin = window.location.origin;
      setLinks([
        { label: "Intake form", url: `${origin}/intake/${intake}` },
        { label: "Weekly check-in", url: `${origin}/checkin/${checkin}` },
        { label: "Nutrition plan", url: `${origin}/plan/${plan}` },
      ]);
    } catch (e) {
      setError("Could not generate links. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function copy(row: LinkRow) {
    try {
      await navigator.clipboard.writeText(row.url);
      setCopied(row.label);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setError("Could not copy to clipboard.");
    }
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
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-stone-200 bg-white p-4 shadow-lg">
          <p className="text-sm font-medium text-stone-900">Share with client</p>
          <p className="mt-0.5 text-xs text-stone-500">
            New links are generated each time and old ones stop working.
          </p>

          {loading ? (
            <p className="mt-3 text-sm text-stone-500">Generating links...</p>
          ) : error ? (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          ) : links ? (
            <div className="mt-3 space-y-2">
              {links.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-2 rounded-lg bg-stone-50 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-stone-800">{row.label}</p>
                    <p className="truncate text-xs text-stone-400">{row.url}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copy(row)}
                    className="shrink-0 rounded-md p-1.5 text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-900"
                    aria-label={`Copy ${row.label} link`}
                  >
                    {copied === row.label ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
              <p className="text-xs text-stone-400">
                Send via any channel — WhatsApp, email, or your own message.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}