"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { activatePlan, archivePlan, deletePlan } from "@/lib/actions/plans";
import { Button } from "@/components/ui";
import { Archive, CheckCircle2, Trash2 } from "lucide-react";
import type { PlanStatus } from "@/generated/prisma/enums";

export function PlanActions({
  clientId,
  planId,
  status,
}: {
  clientId: string;
  planId: string;
  status: PlanStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    try {
      await fn();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {status === "DRAFT" || status === "ARCHIVED" ? (
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => run(() => activatePlan(clientId, planId))}
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> Activate
        </Button>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          onClick={() => run(() => archivePlan(clientId, planId))}
        >
          <Archive className="h-3.5 w-3.5" /> Archive
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        disabled={busy}
        className="text-red-600 hover:bg-red-50"
        onClick={() => run(() => deletePlan(clientId, planId))}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}