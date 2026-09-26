import { Router } from "express";
import { TZDate, tz } from "@date-fns/tz";
import {
  endOfMonth,
  format,
  isAfter,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  subDays,
} from "date-fns";
import { daysBetween, sumMoney, splitEvenly } from "@expense/shared";
import { expenses } from "../data.js";

// Reports are computed in the business time zone, not the server's.
const BUSINESS_TZ = "America/Los_Angeles";
const businessZone = tz(BUSINESS_TZ);

export const reportsRouter = Router();

function boundsForMonth(month: string) {
  const [year, monthNumber] = month.split("-");
  const anchor = new TZDate(Number(year), Number(monthNumber) - 1, 1, BUSINESS_TZ);
  return { from: startOfMonth(anchor), to: endOfMonth(anchor) };
}

// GET /reports/monthly?month=2026-09
reportsRouter.get("/monthly", (req, res) => {
  const month =
    (req.query.month as string | undefined) ||
    format(new Date(), "yyyy-MM", { in: businessZone });
  const { from, to } = boundsForMonth(month);

  const rows = expenses.filter((e) =>
    isWithinInterval(parseISO(e.date), { start: from, end: to })
  );
  const byCategory: any = {};
  for (const r of rows) {
    byCategory[r.category] = (byCategory[r.category] || 0) + r.amount;
  }

  const days = daysBetween(from, to) + 1;
  res.json({
    from: format(new Date(from.getTime()), "yyyy-MM-dd"),
    to: format(new Date(to.getTime()), "yyyy-MM-dd"),
    days,
    total: sumMoney(rows.map((r) => r.amount)),
    perDay: splitEvenly(sumMoney(rows.map((r) => r.amount)), days),
    byCategory
  });
});

// GET /reports/last-n-days?n=7
reportsRouter.get("/last-n-days", (req, res) => {
  const n = parseInt((req.query.n as string | undefined) || "7", 10);
  const cutoff = startOfDay(subDays(new Date(), n, { in: businessZone }), {
    in: businessZone,
  });
  const rows = expenses.filter((e) => isAfter(parseISO(e.date), cutoff));
  res.json({
    since: format(cutoff, "yyyy-MM-dd"),
    count: rows.length,
    total: sumMoney(rows.map((r) => r.amount)),
  });
});
