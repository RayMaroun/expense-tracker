import type { Expense } from "@expense/shared";
import type { RecurringTemplate } from "./recurring.js";

// In-memory "database".
export const recurring: RecurringTemplate[] = [];

export const expenses: Expense[] = [
  { id: "e1", description: "Team lunch",        amount: 84.1,  category: "food",   date: "2026-09-02" },
  { id: "e2", description: "Taxi to airport",   amount: 37.25, category: "travel", date: "2026-09-03" },
  { id: "e3", description: "Conference ticket", amount: 499.0, category: "events", date: "2026-09-05" },
  { id: "e4", description: "Coffee",            amount: 0.1,   category: "food",   date: "2026-09-08" },
  { id: "e5", description: "Snacks",            amount: 0.2,   category: "food",   date: "2026-09-08" },
  { id: "e6", description: "Hotel",             amount: 312.4, category: "travel", date: "2026-08-28" }
];
