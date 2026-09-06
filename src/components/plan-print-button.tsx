"use client";

import { Printer } from "lucide-react";

export function PlanPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-50 print:hidden sm:h-8 sm:min-h-0"
    >
      <Printer className="h-4 w-4" /> Print / Save as PDF
    </button>
  );
}