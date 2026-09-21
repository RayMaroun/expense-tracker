import {
  differenceInCalendarDays,
  endOfMonth as dfEndOfMonth,
  format,
  isSameMonth as dfIsSameMonth,
  parseISO,
  startOfMonth as dfStartOfMonth,
} from "date-fns";

// Date helpers. Inputs are ISO date strings ("2026-09-02").
// Formatting helpers return strings; math helpers return Dates.

export function formatDate(iso: string): string {
  return format(parseISO(iso), "yyyy-MM-dd");
}

export function formatDateLong(iso: string): string {
  return format(parseISO(iso), "MMMM d, yyyy");
}

export function daysBetween(fromIso: string, toIso: string): number {
  return differenceInCalendarDays(parseISO(toIso), parseISO(fromIso));
}

export function startOfMonth(iso: string): Date {
  return dfStartOfMonth(parseISO(iso));
}

export function endOfMonth(iso: string): Date {
  return dfEndOfMonth(parseISO(iso));
}

export function isSameMonth(aIso: string, bIso: string): boolean {
  return dfIsSameMonth(parseISO(aIso), parseISO(bIso));
}

export function todayIso(): string {
  return format(new Date(), "yyyy-MM-dd");
}
