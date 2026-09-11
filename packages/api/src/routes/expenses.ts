import { Router } from "express";
import moment from "moment";
import { formatDate, sumMoney } from "@expense/shared";
import { expenses } from "../data.js";

export const expensesRouter = Router();

// GET /expenses?month=2026-09
expensesRouter.get("/", (req, res) => {
  const month: any = req.query.month;
  let rows = expenses;
  if (month) {
    rows = rows.filter((e) => moment(e.date).format("YYYY-MM") === month);
  }
  res.json({
    count: rows.length,
    total: sumMoney(rows.map((r) => r.amount)),
    items: rows.map((r) => ({ ...r, date: formatDate(r.date) }))
  });
});

// POST /expenses  { description, amount, category, date }
expensesRouter.post("/", (req, res) => {
  const body: any = req.body;
  const expense: any = {
    id: "e" + (expenses.length + 1),
    description: body.description,
    amount: parseFloat(body.amount),
    category: body.category,
    date: moment(body.date || undefined).toISOString()
  };
  expenses.push(expense);
  res.status(201).json(expense);
});

// GET /expenses/:id
expensesRouter.get("/:id", (req, res) => {
  const found = expenses.find((e) => e.id === req.params.id);
  if (!found) return res.status(404).json({ error: "not found" });
  res.json({ ...found, date: moment(found.date).format("dddd, MMMM Do YYYY") });
});
