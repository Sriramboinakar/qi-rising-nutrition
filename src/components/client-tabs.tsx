"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export const CLIENT_TABS = [
  { href: "", label: "Overview" },
  { href: "/assessment", label: "Assessment" },
  { href: "/plan", label: "Nutrition Plan" },
  { href: "/checkins", label: "Check-ins" },
  { href: "/progress", label: "Progress" },
  { href: "/habits", label: "Habits" },
  { href: "/notes", label: "Notes" },
  { href: "/followups", label: "Follow-ups" },
];

export function ClientTabs({ clientId }: { clientId: string }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const base = `/clients/${clientId}`;

  return (
    <nav className="sticky top-14 z-30 -mx-4 flex gap-1 overflow-x-auto border-b border-stone-100 bg-white/95 px-4 pb-1 pt-2 backdrop-blur [-ms-overflow-style:none] [scrollbar-width:none] md:static md:mx-0 md:rounded-xl md:border md:border-stone-200 md:p-1 md:pt-1 [&::-webkit-scrollbar]:hidden">
      {CLIENT_TABS.map((tab) => {
        const active = pathname === `${base}${tab.href}` || (tab.href && pathname.startsWith(`${base}${tab.href}`));
        return (
          <Link
            key={tab.href}
            href={`${base}${tab.href}`}
            prefetch
            className={cn(
              "relative flex min-h-11 items-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active ? "text-white" : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            )}
          >
            {active && !reduced ? (
              <motion.span
                layoutId={`client-tab-${clientId}`}
                className="absolute inset-0 rounded-lg bg-stone-900"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            ) : null}
            <span className="relative z-10">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}