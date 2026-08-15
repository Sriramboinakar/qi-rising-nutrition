import { Leaf } from "lucide-react";

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
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-white">
            <Leaf className="h-5 w-5" />
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">{title}</h1>
          <p className="mt-1 text-sm text-stone-500">{subtitle}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          {children}
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