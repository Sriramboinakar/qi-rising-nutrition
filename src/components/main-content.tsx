"use client";

import type { ReactNode } from "react";

export function MainContent({ children }: { children: ReactNode }) {
  return (
    <main className="min-w-0 flex-1 px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-20 sm:px-6 md:px-8 md:py-8">
      {children}
    </main>
  );
}