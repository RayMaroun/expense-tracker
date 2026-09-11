import { Router } from "express";
import moment from "moment-timezone";

// Reports are computed in the business time zone, not the server's.
const BUSINESS_TZ = "America/Los_Angeles";
import { daysBetween, sumMoney, splitEvenly } from "@expense/shared";
import { expenses } from "../data.js";

export const reportsRouter = Router();

// GET /reports/monthly?month=2026-09
reportsRouter.get("/monthly", (req, res) => {
  const month: any = req.query.month || moment().tz(BUSINESS_TZ).format("YYYY-MM");
  const from = moment.tz(month + "-01", BUSINESS_TZ).startOf("month").toDate();
  const to = moment.tz(month + "-01", BUSINESS_TZ).endOf("month").toDate();

  const rows = expenses.filter((e) => moment(e.date).isBetween(from, to, undefined, "[]"));
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
