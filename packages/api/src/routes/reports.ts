import { Router } from "express";
import moment from "moment-timezone";

// Reports are computed in the business time zone, not the server's.
const BUSINESS_TZ = "America/Los_Angeles";
import { daysBetween, sumMoney, splitEvenly } from "@expense/shared";
import { expenses, recurring } from "../data.js";
import { occurrencesForMonth } from "../recurring.js";

// Date-only strings are calendar dates in the business zone. An offset timestamp stays an absolute instant.
function inBusinessRange(date: string, from: Date, to: Date) {
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? moment.tz(date, "YYYY-MM-DD", BUSINESS_TZ)
    : moment(date);
  return parsed.isBetween(from, to, undefined, "[]");
}

export const reportsRouter = Router();

// GET /reports/monthly?month=2026-09
reportsRouter.get("/monthly", (req, res) => {
  const month: any = req.query.month || moment().tz(BUSINESS_TZ).format("YYYY-MM");
  const from = moment.tz(month + "-01", BUSINESS_TZ).startOf("month").toDate();
  const to = moment.tz(month + "-01", BUSINESS_TZ).endOf("month").toDate();

  const stored = expenses.filter((e) => inBusinessRange(e.date, from, to));
  const occ = typeof month === "string" ? occurrencesForMonth(recurring, month) : [];
  const rows = stored.concat(occ);
  const byCategory: any = {};
  for (const r of rows) {
    byCategory[r.category] = (byCategory[r.category] || 0) + r.amount;
  }

  const days = daysBetween(from, to) + 1;
  res.json({
    from: moment(from).format("YYYY-MM-DD"),
    to: moment(to).format("YYYY-MM-DD"),
    days,
    total: sumMoney(rows.map((r) => r.amount)),
    perDay: splitEvenly(sumMoney(rows.map((r) => r.amount)), days),
    byCategory
  });
});

// GET /reports/last-n-days?n=7
reportsRouter.get("/last-n-days", (req, res) => {
  const n = parseInt((req.query.n as any) || "7", 10);
  const cutoff = moment().tz(BUSINESS_TZ).subtract(n, "days").startOf("day");
  const rows = expenses.filter((e) => moment(e.date).isAfter(cutoff));
  res.json({ since: cutoff.format("YYYY-MM-DD"), count: rows.length, total: sumMoney(rows.map((r) => r.amount)) });
});
