import { Router } from "express";
import { recurring } from "../data.js";
import { parseRecurringBody, type RecurringTemplate } from "../recurring.js";

export const recurringRouter = Router();

// GET /recurring
recurringRouter.get("/", (_req, res) => {
  res.json({ items: recurring });
});

// POST /recurring  { description, amountCents, category, dayOfMonth, startDate, endDate? }
recurringRouter.post("/", (req, res) => {
  const parsed = parseRecurringBody(req.body);
  if (parsed.ok === false) {
    return res.status(400).json({ error: parsed.error });
  }
  const template: RecurringTemplate = {
    id: "r" + (recurring.length + 1),
    ...parsed.value
  };
  recurring.push(template);
  res.status(201).json(template);
});
