// Shared shapes used by the api and the web page.

export type Category = "food" | "travel" | "events" | "other";

export type Expense = {
  id: string;
  description: string;
  /** Integer cents. 1250 means $12.50. */
  amount: number;
  category: Category;
  /** ISO date string, e.g. "2026-09-02". */
  date: string;
  tags?: string[];
};

export type Report = {
  from: string;
  to: string;
  days: number;
  totalCents: number;
  perDayCents: number;
  byCategoryCents: Partial<Record<Category, number>>;
};
