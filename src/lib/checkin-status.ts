import { startOfDay, addDays, differenceInCalendarDays } from "date-fns";
import type { ClientStatus } from "@/generated/prisma/enums";

export type CheckInStatusLevel = "UP_TO_DATE" | "DUE" | "OVERDUE" | "NOT_REQUIRED";

export type CheckInStatusInfo = {
  status: CheckInStatusLevel;
  /** Date of the most recent completed check-in (null when none). */
  lastCheckInAt: Date | null;
  /** Start of the day the next weekly check-in becomes due. */
  nextCheckInAt: Date | null;
  /** Days past the due date, > 0 when overdue. */
  daysOverdue: number;
};

export const CHECK_IN_CADENCE_DAYS = 7;

export type CheckInStatusInput = {
  clientStatus: ClientStatus;
  intakeSubmittedAt: Date | null;
  programStartDate: Date | null;
  createdAt: Date;
  lastCheckIn: { checkInDate: Date } | null;
  now?: Date;
};

/**
 * Single source of truth for a client's weekly check-in status. Used by the
 * coach dashboard, the client profile and the reminder engine so every view
 * agrees on "due" vs "overdue" vs "no requirement yet".
 *
 * Rules:
 * - Non-active clients never require a check-in.
 * - A client with no check-in history and no onboarding anchor (intake or
 *   program start) has no requirement yet.
 * - The next check-in is due 7 days after the last check-in, or 7 days after
 *   onboarding when none has been recorded.
 */
export function getCheckInStatus(input: CheckInStatusInput): CheckInStatusInfo {
  const now = input.now ?? new Date();
  const today = startOfDay(now);

  if (input.clientStatus !== "ACTIVE") {
    return { status: "NOT_REQUIRED", lastCheckInAt: null, nextCheckInAt: null, daysOverdue: 0 };
  }

  const anchor =
    input.lastCheckIn?.checkInDate ??
    input.intakeSubmittedAt ??
    input.programStartDate ??
    null;

  if (!anchor) {
    return { status: "NOT_REQUIRED", lastCheckInAt: null, nextCheckInAt: null, daysOverdue: 0 };
  }

  const nextCheckInAt = startOfDay(addDays(anchor, CHECK_IN_CADENCE_DAYS));
  const daysUntilDue = differenceInCalendarDays(nextCheckInAt, today);

  let status: CheckInStatusLevel;
  let daysOverdue = 0;
  if (daysUntilDue > 0) {
    status = "UP_TO_DATE";
  } else if (daysUntilDue === 0) {
    status = "DUE";
  } else {
    status = "OVERDUE";
    daysOverdue = -daysUntilDue;
  }

  return {
    status,
    lastCheckInAt: input.lastCheckIn?.checkInDate ?? null,
    nextCheckInAt,
    daysOverdue,
  };
}

export const CHECK_IN_STATUS_LABEL: Record<CheckInStatusLevel, string> = {
  UP_TO_DATE: "Up to date",
  DUE: "Check-in due",
  OVERDUE: "Check-in overdue",
  NOT_REQUIRED: "No check-in required",
};