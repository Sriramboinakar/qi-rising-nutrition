import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-stone-200/70",
        className
      )}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent"
        style={{ animationTimingFunction: "cubic-bezier(0.4, 0, 0.6, 1)" }}
      />
    </div>
  );
}