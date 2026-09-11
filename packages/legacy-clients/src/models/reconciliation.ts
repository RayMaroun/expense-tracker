import moment from "moment";
import { PartnerExpense } from "./partnerExpense.js";

export type ReconciliationRow = { partner: string; month: string; total: any; count: number };

export function reconcile(rows: PartnerExpense[]): ReconciliationRow[] {
  const byKey: Record<string, ReconciliationRow> = {};
  for (const r of rows) {
    const month = moment(r.postedAt).format("YYYY-MM");
    const key = `${r.partner}:${month}`;
    byKey[key] ??= { partner: r.partner, month, total: 0, count: 0 };
    byKey[key].total = byKey[key].total + r.amount;
    byKey[key].count += 1;
  }
  return Object.values(byKey);
}
