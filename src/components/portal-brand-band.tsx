import { BrandLogo } from "@/components/brand-logo";

/** Forest-green brand band shown at the top of every client-facing portal. */
export function PortalBrandBand() {
  return (
    <header className="flex items-center gap-3 bg-[#2E5A44] px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
        <BrandLogo className="h-6 w-6 text-white" />
      </div>
      <span className="text-base font-bold tracking-wide text-[#F5F1E6]">QI RISING NUTRITION</span>
    </header>
  );
}