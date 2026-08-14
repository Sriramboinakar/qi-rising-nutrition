"use client";

import { useState } from "react";
import { CheckInForm } from "@/components/checkin-form";
import { Badge, Button } from "@/components/ui";
import { CHECKIN_STATUS_LABELS, CHECKIN_STATUS_TONES } from "@/lib/labels";
import { formatDate, formatNumber } from "@/lib/utils";
import { Pencil, X } from "lucide-react";
import type { SerializableCheckIn } from "@/components/checkin-form";

type SerializedCheckIn = SerializableCheckIn;

export function CheckInRow({
  clientId,
  checkIn,
}: {
  clientId: string;
  checkIn: SerializedCheckIn;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="border-b border-stone-100 px-5 py-4 last:border-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-sm font-semibold text-white">
            #{checkIn.weekNumber}
          </div>
          <div>
            <p className="text-sm font-medium text-stone-900">{formatDate(checkIn.checkInDate)}</p>
            <p className="text-xs text-stone-500">
              {checkIn.weightKg ? `${formatNumber(Number(checkIn.weightKg))} kg` : ""}
              {checkIn.adherencePct !== null ? ` · ${checkIn.adherencePct}% adherence` : ""}
              {checkIn.energyLevel !== null ? ` · energy ${checkIn.energyLevel}/10` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={CHECKIN_STATUS_TONES[checkIn.status]}>
            {CHECKIN_STATUS_LABELS[checkIn.status]}
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => setEditing((v) => !v)}>
            {editing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
            {editing ? "Close" : "Edit"}
          </Button>
        </div>
      </div>

      {checkIn.notes ? (
        <p className="mt-2 rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-600">
          <span className="font-medium text-stone-700">Client:</span> {checkIn.notes}
        </p>
      ) : null}
      {checkIn.response ? (
        <p className="mt-1 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
          <span className="font-medium">Coach:</span> {checkIn.response}
        </p>
      ) : null}

      {editing ? (
        <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
          <CheckInForm clientId={clientId} checkIn={checkIn} />
        </div>
      ) : null}
    </div>
  );
}