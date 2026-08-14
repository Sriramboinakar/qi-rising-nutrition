"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const base = `/clients/${clientId}`;

  return (
    <nav className="flex flex-wrap gap-1 rounded-xl border border-stone-200 bg-white p-1">
      {CLIENT_TABS.map((tab) => {
        const active = pathname === `${base}${tab.href}` || (tab.href && pathname.startsWith(`${base}${tab.href}`));
        return (
          <Link
            key={tab.href}
            href={`${base}${tab.href}`}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active ? "bg-stone-900 text-white" : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}