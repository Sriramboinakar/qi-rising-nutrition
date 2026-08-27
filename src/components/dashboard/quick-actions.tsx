"use client";

import { Button } from "@/components/ui";
import { NewClientMenu } from "@/components/new-client-menu";
import { ClipboardCheck } from "lucide-react";

export function QuickActions() {
  const scrollToCheckins = () => {
    document.getElementById("needs-attention")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-[0_1px_2px_rgb(0,0,0,0.04),0_12px_32px_-16px_rgb(0,0,0,0.14)] backdrop-blur-xl">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <NewClientMenu
          label="Add New Client"
          className="h-12 w-full bg-brand-600 text-sm font-semibold shadow-md shadow-brand-600/20 hover:bg-brand-700"
        />
        <Button
          variant="outline"
          onClick={scrollToCheckins}
          className="h-12 w-full text-sm font-semibold"
        >
          <ClipboardCheck className="h-5 w-5 text-brand-600" /> Client Check-ins
        </Button>
      </div>
      <p className="mt-3 text-center text-xs text-stone-400">
        Share a WhatsApp intake link in seconds — clients&apos; answers save automatically.
      </p>
    </section>
  );
}