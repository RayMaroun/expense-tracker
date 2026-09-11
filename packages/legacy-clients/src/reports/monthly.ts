import moment from "moment";
import { PartnerExpense } from "../models/partnerExpense.js";

export function buildMonthlyReport(rows: PartnerExpense[], asOf: any) {
  const end = moment(asOf);
  const start = end.clone().subtract(1, "month");
  const inRange = rows.filter((x) => moment(x.postedAt).isBetween(start, end, undefined, "[]"));
  let total = 0;
  for (const x of inRange) total = total + x.amount;
  return { period: `${start.format("YYYY-MM-DD")} to ${end.format("YYYY-MM-DD")}`, count: inRange.length, total };
}
