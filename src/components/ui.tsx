import type { ReactNode, SelectHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// --- Button ---
export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md";
}) {
  const variants = {
    primary:
      "bg-brand-600 text-white shadow-sm shadow-brand-600/20 hover:bg-brand-700 hover:shadow-md hover:shadow-brand-600/25 focus-visible:ring-brand-600 active:scale-[0.98]",
    secondary:
      "bg-stone-900 text-white shadow-sm hover:bg-stone-800 focus-visible:ring-stone-900 active:scale-[0.98]",
    ghost: "bg-transparent text-stone-600 hover:bg-stone-100 hover:text-stone-900",
    danger:
      "bg-red-600 text-white shadow-sm shadow-red-600/20 hover:bg-red-700 focus-visible:ring-red-600 active:scale-[0.98]",
    outline:
      "bg-white text-stone-700 border border-stone-300 hover:border-stone-400 hover:bg-stone-50 focus-visible:ring-stone-400 active:scale-[0.98]",
  };
  const sizes = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-10 px-4 text-sm gap-2",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer min-h-11 sm:min-h-0",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

// --- Form controls ---
export function Label({ children, htmlFor, className }: { children: ReactNode; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn("block text-xs font-medium text-stone-500 mb-1.5", className)}>
      {children}
    </label>
  );
}

const inputBase =
  "h-10 w-full scroll-mt-28 rounded-lg border bg-white px-3 text-base text-stone-900 placeholder:text-stone-400 shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        inputBase,
        "border-stone-300 focus:border-brand-600 focus:ring-brand-600/20 hover:border-stone-400",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        inputBase,
        "h-auto min-h-[96px] py-2 border-stone-300 focus:border-brand-600 focus:ring-brand-600/20 hover:border-stone-400",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        inputBase,
        "cursor-pointer border-stone-300 focus:border-brand-600 focus:ring-brand-600/20 hover:border-stone-400",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

// --- Card ---
export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("rounded-xl border border-stone-200 bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-stone-100 px-5 py-4">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold tracking-tight text-stone-900">{title}</h3>
        {subtitle ? <p className="mt-0.5 text-xs text-stone-500">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

// --- Badge ---
export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "amber" | "red" | "blue" | "violet";
  className?: string;
}) {
  const tones = {
    neutral: "bg-stone-100 text-stone-600",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
  };
  const dots = {
    neutral: "bg-stone-400",
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
    violet: "bg-violet-500",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dots[tone])} aria-hidden="true" />
      {children}
    </span>
  );
}

// --- Page header ---
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-stone-500">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

// --- Empty state ---
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
      {icon ? <div className="mb-3 text-stone-300">{icon}</div> : null}
      <h3 className="text-sm font-semibold text-stone-900">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-sm text-stone-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}