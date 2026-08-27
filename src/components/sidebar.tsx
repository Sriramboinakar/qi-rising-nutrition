"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  CalendarRange,
  Settings,
  UserCog,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { BrandLogo } from "@/components/brand-logo";
import type { Role } from "@/generated/prisma/enums";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/programs", label: "Programs", icon: CalendarRange },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings, adminOnly: true },
  { href: "/users", label: "Users", icon: UserCog, adminOnly: true },
];

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const reduced = useReducedMotion();

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
        active ? "text-white" : "text-sidebar-fg hover:text-white"
      )}
    >
      {active && !reduced ? (
        <motion.span
          layoutId="sidebar-active-pill"
          className="absolute inset-0 rounded-lg bg-brand-600/20 ring-1 ring-inset ring-brand-500/30"
          transition={{ type: "spring", stiffness: 450, damping: 34 }}
        />
      ) : null}

      <motion.span
        className="relative z-10 flex items-center gap-3"
        whileTap={reduced ? undefined : { scale: 0.96 }}
      >
        <item.icon
          className={cn(
            "h-4 w-4 shrink-0 transition-all duration-200",
            active
              ? "text-brand-400"
              : "text-sidebar-fg group-hover:text-white group-hover:scale-110"
          )}
        />
        <span className="relative">
          {item.label}
          {active ? (
            <motion.span
              layoutId="sidebar-active-dot"
              className="absolute -right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-brand-400"
              transition={{ type: "spring", stiffness: 450, damping: 34 }}
            />
          ) : null}
        </span>
      </motion.span>
    </Link>
  );
}

function SidebarContent({
  name,
  email,
  role,
  onNavigate,
}: {
  name: string;
  email: string;
  role: Role;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || role === "SUPER_ADMIN");

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <motion.div
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 shadow-md shadow-brand-600/30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <BrandLogo className="h-5 w-5 text-white" />
        </motion.div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">Qi Rising</p>
          <p className="text-[11px] text-sidebar-fg">Nutrition</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <NavLink key={item.href} item={item} active={active} onNavigate={onNavigate} />
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-4">
        <div className="mb-2 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600/20 text-xs font-semibold text-brand-300">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium text-white">{name}</p>
            <p className="truncate text-[11px] text-sidebar-fg">{email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-fg transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function Sidebar({ name, email, role }: { name: string; email: string; role: Role }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("popstate", close);
    return () => window.removeEventListener("popstate", close);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-64 bg-sidebar-bg">
          <SidebarContent name={name} email={email} role={role} />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-stone-200 bg-white/95 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 transition-colors hover:bg-stone-100"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-600">
            <BrandLogo className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-stone-900">Qi Rising</span>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
          {name.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-black/50"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduced ? undefined : { opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-sidebar-bg shadow-2xl"
              initial={reduced ? false : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={reduced ? undefined : { x: "-100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-fg transition-colors hover:bg-white/5 hover:text-white cursor-pointer"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent name={name} email={email} role={role} onNavigate={() => setOpen(false)} />
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}