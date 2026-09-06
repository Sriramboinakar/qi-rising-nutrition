import { PortalBrandBand } from "@/components/portal-brand-band";

export function ClientPortalShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-stone-50">
      <PortalBrandBand />
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <div className="mb-5 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-stone-900">{title}</h1>
            <p className="mt-1 text-sm text-stone-500">{subtitle}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ClientPortalBanner({
  message,
  tone,
}: {
  message: string;
  tone: "success" | "error";
}) {
  return (
    <div
      className={
        tone === "success"
          ? "rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800"
          : "rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
      }
    >
      {message}
    </div>
  );
}