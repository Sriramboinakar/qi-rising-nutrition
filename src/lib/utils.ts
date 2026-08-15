import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  const parsed = parseSafeDate(date);
  if (!parsed) return "—";
  return format(parsed, "MMM d, yyyy");
}

export function formatDateTime(date: Date | string | null | undefined): string {
  const parsed = parseSafeDate(date);
  if (!parsed) return "—";
  return format(parsed, "MMM d, yyyy h:mm a");
}

/** Parse a date defensively — invalid values return null instead of an Invalid Date. */
function parseSafeDate(date: Date | string | null | undefined): Date | null {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Parse a user-supplied date string (e.g. from a form field) for persistence.
 * Returns null for empty or unparseable input so an Invalid Date is never
 * written to the database (which would crash date rendering downstream).
 */
export function parseDateInput(value: FormDataEntryValue | string | null | undefined): Date | null {
  if (!value) return null;
  const str = String(value).trim();
  if (!str) return null;
  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return Number(value).toLocaleString("en-US", {
    maximumFractionDigits: 1,
  });
}

export function initials(firstName: string, lastName?: string | null): string {
  return `${firstName.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase();
}

export function fullName(firstName: string, lastName?: string | null): string {
  return lastName ? `${firstName} ${lastName}` : firstName;
}