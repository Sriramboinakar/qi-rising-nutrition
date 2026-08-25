"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getClientAccessLinks } from "@/lib/actions/intake";
import { Share2, Copy, Check, ExternalLink, ClipboardEdit } from "lucide-react";

export function ShareClientLink({ clientId }: { clientId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const links = await getClientAccessLinks(clientId);
      setUrl(`${window.location.origin}/intake/${links.intake}`);
    } catch {
      setError("Could not load the link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function toggle() {
    setOpen((prev) => {
      const next = !prev;
      if (next && !url && !loading) load();
      return next;
    });
  }

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy the link.");
    }
  }

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={toggle}
        className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-brand-50 px-3 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Share2 className="h-3.5 w-3.5" /> Share intake link
      </button>

      {open ? (
        <div
          role="dialog"
          className="absolute right-0 z-30 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] rounded-xl border border-stone-200 bg-white p-4 shadow-lg"
        >
          <p className="text-sm font-medium text-stone-900">Share intake link</p>
          <p className="mt-0.5 text-xs text-stone-500">
            Send this to the client. They fill the link and their answers save automatically to their
            profile.
          </p>

          {loading ? (
            <p className="mt-3 text-sm text-stone-500">Loading link...</p>
          ) : error ? (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          ) : url ? (
            <>
              <div className="mt-3 flex items-center gap-2">
                <input
                  readOnly
                  value={url}
                  onFocus={(e) => e.currentTarget.select()}
                  className="h-9 w-full rounded-lg border border-stone-300 bg-stone-50 px-3 text-xs text-stone-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-xs font-medium text-white transition-colors hover:bg-brand-700"
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
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline"
              >
                Open intake form <ExternalLink className="h-3 w-3" />
              </a>

              <div className="my-3 border-t border-stone-100" />

              <p className="text-xs font-medium text-stone-500">Client cannot fill it online?</p>
              <Link
                href={`/clients/${clientId}/intake-manual`}
                className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50"
              >
                <ClipboardEdit className="h-3.5 w-3.5" /> Enter data manually
              </Link>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}