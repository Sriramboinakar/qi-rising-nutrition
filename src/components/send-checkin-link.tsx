"use client";

import { useState } from "react";
import { getClientCheckInLink } from "@/lib/actions/intake";
import { Link2, Check } from "lucide-react";

export function SendCheckInLinkButton({ clientId }: { clientId: string }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setLoading(true);
    setError(null);
    try {
      const token = await getClientCheckInLink(clientId);
      const url = `${window.location.origin}/checkin/${token}`;
      await navigator.clipboard.writeText(url);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      setError("Could not get a link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
      <button
        type="button"
        onClick={send}
        disabled={loading}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-brand-50 px-3 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 disabled:opacity-50 cursor-pointer"
      >
        {done ? (
          <>
            <Check className="h-3.5 w-3.5" /> Copied!
          </>
        ) : (
          <>
            <Link2 className="h-3.5 w-3.5" /> {loading ? "Loading..." : "Copy check-in link"}
          </>
        )}
      </button>
    </span>
  );
}