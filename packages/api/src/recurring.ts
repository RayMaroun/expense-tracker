import moment from "moment-timezone";

// Same business zone the monthly report already uses.
const BUSINESS_TZ = "America/Los_Angeles";

export type RecurringTemplate = {
  id: string;
  description: string;
  amountCents: number;
  category: string;
  dayOfMonth: number;
  startDate: string;
  endDate?: string;
};

export type RecurringDraft = Omit<RecurringTemplate, "id">;

export type Occurrence = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  recurring: true;
};

export type InputError = {
  code: "invalid_input";
  message: string;
};

export type ParseResult =
  | { ok: true; value: RecurringDraft }
  | { ok: false; error: InputError };

function invalid(message: string): ParseResult {
  return { ok: false, error: { code: "invalid_input", message } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCalendarDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return moment.tz(value, "YYYY-MM-DD", true, BUSINESS_TZ).isValid();
}

export function parseRecurringBody(body: unknown): ParseResult {
  if (!isRecord(body)) return invalid("Request body must be an object");

  const description = body.description;
  if (typeof description !== "string" || description.trim() === "") {
    return invalid("description is required");
  }

  const category = body.category;
  if (typeof category !== "string" || category.trim() === "") {
    return invalid("category is required");
  }

  const amountCents = body.amountCents;
  if (typeof amountCents !== "number" || !Number.isSafeInteger(amountCents) || amountCents <= 0) {
    return invalid("amountCents must be a positive integer");
  }

  const dayOfMonth = body.dayOfMonth;
  if (typeof dayOfMonth !== "number" || !Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
    return invalid("dayOfMonth must be an integer from 1 to 31");
  }

  if (!isCalendarDate(body.startDate)) {
    return invalid("startDate must be a real YYYY-MM-DD date");
  }

  const draft: RecurringDraft = {
    description: description.trim(),
    amountCents,
    category: category.trim(),
    dayOfMonth,
    startDate: body.startDate
  };

  if (body.endDate !== undefined) {
    if (!isCalendarDate(body.endDate)) {
      return invalid("endDate must be a real YYYY-MM-DD date");
    }
    if (body.endDate < body.startDate) {
      return invalid("endDate must be on or after startDate");
    }
    draft.endDate = body.endDate;
  }

  return { ok: true, value: draft };
}

// One occurrence per template for the given YYYY-MM, or none when the clamped day falls outside the template range.
export function occurrencesForMonth(templates: RecurringTemplate[], month: string): Occurrence[] {
  if (!/^\d{4}-\d{2}$/.test(month)) return [];
  const monthStart = moment.tz(month + "-01", "YYYY-MM-DD", true, BUSINESS_TZ);
  if (!monthStart.isValid()) return [];

  const lastDay = monthStart.daysInMonth();
  const occurrences: Occurrence[] = [];
  for (const template of templates) {
    const day = Math.min(template.dayOfMonth, lastDay);
    const date = month + "-" + String(day).padStart(2, "0");
    if (date < template.startDate) continue;
    if (template.endDate !== undefined && date > template.endDate) continue;
    occurrences.push({
      id: template.id + "-" + month,
      description: template.description,
      amount: Number((template.amountCents / 100).toFixed(2)),
      category: template.category,
      date,
      recurring: true
    });
  }
  return occurrences;
}
