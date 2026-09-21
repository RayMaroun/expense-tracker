import type { Expense } from "@expense/shared";

// In-memory "database". Amounts are integer cents.
export const expenses: Expense[] = [
  { id: "e1", description: "Team lunch",        amount: 8410,  category: "food",   date: "2026-09-02" },
  { id: "e2", description: "Taxi to airport",   amount: 3725,  category: "travel", date: "2026-09-03" },
  { id: "e3", description: "Conference ticket", amount: 49900, category: "events", date: "2026-09-05" },
  { id: "e4", description: "Coffee",            amount: 10,    category: "food",   date: "2026-09-08" },
  { id: "e5", description: "Snacks",            amount: 20,    category: "food",   date: "2026-09-08" },
  { id: "e6", description: "Hotel",             amount: 31240, category: "travel", date: "2026-08-28" }
];
