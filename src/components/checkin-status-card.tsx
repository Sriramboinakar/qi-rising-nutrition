import { Card, Badge } from "@/components/ui";
import { getCheckInStatus, CHECK_IN_STATUS_LABEL } from "@/lib/checkin-status";
import { formatDate } from "@/lib/utils";
import type { ClientStatus } from "@/generated/prisma/enums";

const STATUS_TONE = {
  UP_TO_DATE: "green",
  DUE: "amber",
  OVERDUE: "red",
  NOT_REQUIRED: "neutral",
} as const;

export function CheckInStatusCard({
  clientStatus,
  intakeSubmittedAt,
  programStartDate,
  createdAt,
  latestCheckIn,
  latestSummary,
}: {
  clientStatus: ClientStatus;
  intakeSubmittedAt: Date | null;
  programStartDate: Date | null;
  createdAt: Date;
  latestCheckIn: { checkInDate: Date; weekNumber: number } | null;
  latestSummary: string | null;
}) {
  const info = getCheckInStatus({
    clientStatus,
    intakeSubmittedAt,
    programStartDate,
    createdAt,
    lastCheckIn: latestCheckIn,
  });

  return (
    <Card>
      <div className="border-b border-stone-100 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold tracking-tight text-stone-900">Check-in status</h3>
          <Badge tone={STATUS_TONE[info.status]}>{CHECK_IN_STATUS_LABEL[info.status]}</Badge>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-4 px-5 py-4">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Last check-in</dt>
          <dd className="mt-0.5 text-sm text-stone-800">
            {latestCheckIn ? (
              <>
                {formatDate(latestCheckIn.checkInDate)}
                <span className="ml-1 text-xs text-stone-400">(week #{latestCheckIn.weekNumber})</span>
              </>
            ) : (
              "None yet"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-stone-400">Next check-in</dt>
          <dd className="mt-0.5 text-sm text-stone-800">
            {info.nextCheckInAt ? formatDate(info.nextCheckInAt) : "—"}
          </dd>
        </div>
      </dl>
      {latestSummary ? (
        <div className="border-t border-stone-100 px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-400">Latest summary</p>
          <p className="mt-1 text-sm whitespace-pre-wrap text-stone-700">{latestSummary}</p>
        </div>
      ) : null}
    </Card>
  );
}