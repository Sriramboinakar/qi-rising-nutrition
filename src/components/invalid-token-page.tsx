import { PortalBrandBand } from "@/components/portal-brand-band";
import { Link2 } from "lucide-react";

/** Branded, friendly page for invalid / expired portal links. */
export function InvalidTokenPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-stone-50">
      <PortalBrandBand />
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
        <div className="w-full max-w-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-400">
            <Link2 className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-stone-900">
            This link is no longer valid
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Please ask Shevvy for a fresh link — she&apos;ll send it to you on WhatsApp.
          </p>
        </div>
      </div>
    </div>
  );
}