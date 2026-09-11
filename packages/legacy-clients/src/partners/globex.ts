import moment from "moment";
import { PartnerExpense } from "../models/partnerExpense.js";

const BASE_URL = "https://api.globex.example/v2";

export async function fetchGlobexExpenses(since: any): Promise<PartnerExpense[]> {
  const from = moment(since).startOf("day").toISOString();
  const res = await fetch(`${BASE_URL}/expenses?since=${encodeURIComponent(from)}`);
  const rows: any[] = await res.json();
  return rows.map((r) => ({
    id: `globex-${r.id}`,
    partner: "globex",
    description: r.memo,
    amount: parseFloat(r.amount),
    postedAt: moment(r.posted_at).format("YYYY-MM-DD"),
  }));
}

export function globexCutoff(days: number) {
  return moment().subtract(days, "days").format("YYYY-MM-DD");
}
