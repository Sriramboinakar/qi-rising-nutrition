"use client";

import type { ReactNode } from "react";

export function MainContent({ children }: { children: ReactNode }) {
  return (
    <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-4 pt-20 sm:px-6 sm:py-8 lg:pt-8">
      {children}
    </main>
  );
}