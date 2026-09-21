import {
  differenceInCalendarDays,
  endOfMonth as dfEndOfMonth,
  format,
  isSameMonth as dfIsSameMonth,
  parseISO,
  startOfMonth as dfStartOfMonth,
} from "date-fns";

// Date helpers. Inputs are ISO strings or Date objects; outputs are ISO strings or Dates.

function toDate(d: string | Date): Date {
  return typeof d === "string" ? parseISO(d) : d;
}

export function formatDate(d: string | Date): string {
  return format(toDate(d), "yyyy-MM-dd");
}

export function formatDateLong(d: string | Date): string {
  return format(toDate(d), "MMMM d, yyyy");
}

export function daysBetween(a: string | Date, b: string | Date): number {
  return differenceInCalendarDays(toDate(b), toDate(a));
}

export function startOfMonth(d: string | Date): Date {
  return dfStartOfMonth(toDate(d));
}

export function endOfMonth(d: string | Date): Date {
  return dfEndOfMonth(toDate(d));
}

export function isSameMonth(a: string | Date, b: string | Date): boolean {
  return dfIsSameMonth(toDate(a), toDate(b));
}

export function today(): Date {
  return new Date();
}
