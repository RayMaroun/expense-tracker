import {
  differenceInMilliseconds,
  endOfMonth as dateFnsEndOfMonth,
  format,
  isSameMonth as dateFnsIsSameMonth,
  startOfMonth as dateFnsStartOfMonth,
} from "date-fns";

// Date helpers.

type DateInput = Date | string | number;

const MS_PER_DAY = 86_400_000;

export function formatDate(d: DateInput) {
  return format(d, "yyyy-MM-dd");
}

export function formatDateLong(d: DateInput) {
  return format(d, "MMMM d, yyyy");
}

export function daysBetween(a: DateInput, b: DateInput) {
  const ms = differenceInMilliseconds(b, a);
  return ms < 0 ? Math.ceil(ms / MS_PER_DAY) || 0 : Math.floor(ms / MS_PER_DAY);
}

export function startOfMonth(d: DateInput) {
  return dateFnsStartOfMonth(d);
}

export function endOfMonth(d: DateInput) {
  return dateFnsEndOfMonth(d);
}

export function isSameMonth(a: DateInput, b: DateInput) {
  return dateFnsIsSameMonth(a, b);
}

export function today() {
  return new Date();
}
