import { Router } from "express";
import { endOfMonth, format, isWithinInterval, parseISO, startOfDay, startOfMonth, subDays } from "date-fns";
import { TZDate } from "@date-fns/tz";
import { daysBetween, splitCentsEvenly, sumCents, type Category } from "@expense/shared";
import { expenses } from "../data.js";

export const reportsRouter = Router();

// Reports are computed in the business time zone, not the server's.
const BUSINESS_TZ = "America/Los_Angeles";

// Build a date in the business time zone from an ISO date string ("2026-09-02").
function businessDate(iso: string, hour = 12): TZDate {
  const [y, m, d] = iso.split("-").map(Number);
  return new TZDate(y, m - 1, d ?? 1, hour, BUSINESS_TZ);
}

// GET /reports/monthly?month=2026-09
reportsRouter.get("/monthly", (req, res) => {
  const now = TZDate.tz(BUSINESS_TZ);
  const month = typeof req.query.month === "string" ? req.query.month : format(now, "yyyy-MM");
  const anchor = businessDate(`${month}-01`, 0);
  const from = startOfMonth(anchor);
  const to = endOfMonth(anchor);

  const rows = expenses.filter((e) => isWithinInterval(businessDate(e.date), { start: from, end: to }));
  const byCategory: Partial<Record<Category, number>> = {};
  for (const r of rows) {
    byCategory[r.category] = (byCategory[r.category] ?? 0) + r.amount;
  }

  const days = daysBetween(from, to) + 1;
  const total = sumCents(rows.map((r) => r.amount));
  res.json({
    from: format(from, "yyyy-MM-dd"),
    to: format(to, "yyyy-MM-dd"),
    days,
    total,
    perDay: splitCentsEvenly(total, days),
    byCategory
  });
});

// GET /reports/last-n-days?n=7
reportsRouter.get("/last-n-days", (req, res) => {
  const n = typeof req.query.n === "string" ? parseInt(req.query.n, 10) : 7;
  const cutoff = startOfDay(subDays(TZDate.tz(BUSINESS_TZ), n));
  const rows = expenses.filter((e) => businessDate(e.date) >= cutoff);
  res.json({ since: format(cutoff, "yyyy-MM-dd"), count: rows.length, total: sumCents(rows.map((r) => r.amount)) });
});
