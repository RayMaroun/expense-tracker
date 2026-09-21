import { Router } from "express";
import { format, parseISO } from "date-fns";
import { dollarsToCents, formatDate, formatDateLong, sumCents, type Category, type Expense } from "@expense/shared";
import { expenses } from "../data.js";

export const expensesRouter = Router();

// GET /expenses?month=2026-09
expensesRouter.get("/", (req, res) => {
  const month = typeof req.query.month === "string" ? req.query.month : undefined;
  let rows = expenses;
  if (month) {
    rows = rows.filter((e) => format(parseISO(e.date), "yyyy-MM") === month);
  }
  res.json({
    count: rows.length,
    total: sumCents(rows.map((r) => r.amount)),
    items: rows.map((r) => ({ ...r, date: formatDate(r.date) }))
  });
});

type NewExpenseBody = { description: string; amount: string | number; category: Category; date?: string };

// POST /expenses  { description, amount (dollars), category, date }
expensesRouter.post("/", (req, res) => {
  const body = req.body as NewExpenseBody;
  const expense: Expense = {
    id: "e" + (expenses.length + 1),
    description: body.description,
    amount: dollarsToCents(body.amount),
    category: body.category,
    date: body.date ? formatDate(body.date) : formatDate(new Date())
  };
  expenses.push(expense);
  res.status(201).json(expense);
});

// GET /expenses/:id
expensesRouter.get("/:id", (req, res) => {
  const found = expenses.find((e) => e.id === req.params.id);
  if (!found) return res.status(404).json({ error: "not found" });
  res.json({ ...found, dateLong: formatDateLong(found.date) });
});
