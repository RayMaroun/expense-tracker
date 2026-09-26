import assert from "node:assert/strict";
import { once } from "node:events";
import type { AddressInfo } from "node:net";
import { describe, it } from "node:test";
import express from "express";
import { recurring } from "../data.js";
import { occurrencesForMonth, parseRecurringBody, type RecurringTemplate } from "../recurring.js";
import { expensesRouter } from "./expenses.js";
import { recurringRouter } from "./recurring.js";
import { reportsRouter } from "./reports.js";

function template(overrides: Partial<RecurringTemplate> = {}): RecurringTemplate {
  return {
    id: "r7",
    description: "Rent",
    amountCents: 199,
    category: "housing",
    dayOfMonth: 31,
    startDate: "2020-01-01",
    ...overrides
  };
}

describe("parseRecurringBody", () => {
  const valid = {
    description: " Rent ",
    amountCents: 2500,
    category: " housing ",
    dayOfMonth: 15,
    startDate: "2026-10-01"
  };

  it("accepts a template and trims text", () => {
    const parsed = parseRecurringBody(valid);
    if (parsed.ok === false) assert.fail(parsed.error.message);
    assert.deepEqual(parsed.value, {
      description: "Rent",
      amountCents: 2500,
      category: "housing",
      dayOfMonth: 15,
      startDate: "2026-10-01"
    });
    assert.equal("endDate" in parsed.value, false);
  });

  it("accepts an endDate on or after the start", () => {
    const parsed = parseRecurringBody({ ...valid, endDate: "2026-12-15" });
    if (parsed.ok === false) assert.fail(parsed.error.message);
    assert.equal(parsed.value.endDate, "2026-12-15");
  });

  it("rejects bad input", () => {
    const cases: unknown[] = [
      null,
      [],
      { ...valid, description: "  " },
      { ...valid, category: "" },
      { ...valid, amountCents: 0 },
      { ...valid, amountCents: 1.5 },
      { ...valid, amountCents: -100 },
      { ...valid, dayOfMonth: 0 },
      { ...valid, dayOfMonth: 32 },
      { ...valid, dayOfMonth: 15.5 },
      { ...valid, startDate: "2026-02-31" },
      { ...valid, startDate: "09/01/2026" },
      { ...valid, endDate: "2026-02-31" },
      { ...valid, endDate: "2026-09-30" },
      { ...valid, endDate: null }
    ];
    for (const body of cases) {
      const parsed = parseRecurringBody(body);
      if (parsed.ok === true) assert.fail("expected invalid input");
      assert.equal(parsed.error.code, "invalid_input");
      assert.equal(typeof parsed.error.message, "string");
    }
  });
});

describe("occurrencesForMonth", () => {
  it("clamps the day to the last day of the month, including leap years", () => {
    const rent = template();
    assert.equal(occurrencesForMonth([rent], "2026-01")[0]?.date, "2026-01-31");
    assert.equal(occurrencesForMonth([rent], "2026-04")[0]?.date, "2026-04-30");
    assert.equal(occurrencesForMonth([rent], "2025-02")[0]?.date, "2025-02-28");
    assert.equal(occurrencesForMonth([rent], "2024-02")[0]?.date, "2024-02-29");
  });

  it("skips months before startDate and after endDate", () => {
    const rent = template({
      dayOfMonth: 5,
      startDate: "2026-03-10",
      endDate: "2026-06-15"
    });
    assert.deepEqual(occurrencesForMonth([rent], "2026-03"), []);
    const april = occurrencesForMonth([rent], "2026-04");
    assert.equal(april.length, 1);
    assert.equal(april[0]?.date, "2026-04-05");
    assert.equal(april[0]?.id, "r7-2026-04");
    assert.equal(april[0]?.recurring, true);
    assert.equal(april[0]?.amount, 1.99);

    const throughEnd = template({ dayOfMonth: 15, endDate: "2026-06-15" });
    assert.equal(occurrencesForMonth([throughEnd], "2026-06")[0]?.date, "2026-06-15");
    assert.deepEqual(occurrencesForMonth([throughEnd], "2026-07"), []);

    const clampedPastEnd = template({ dayOfMonth: 31, endDate: "2026-02-27" });
    assert.deepEqual(occurrencesForMonth([clampedPastEnd], "2026-02"), []);
  });

  it("keeps going when endDate is absent", () => {
    const rent = template({ dayOfMonth: 1, endDate: undefined });
    const far = occurrencesForMonth([rent], "2035-11");
    assert.equal(far[0]?.id, "r7-2035-11");
    assert.equal(far[0]?.date, "2035-11-01");
  });
});

function asRecord(value: unknown, label: string): Record<string, unknown> {
  assert.equal(typeof value, "object");
  assert.notEqual(value, null);
  assert.equal(Array.isArray(value), false, label);
  return value as Record<string, unknown>;
}

describe("recurring routes", () => {
  it("creates a template and merges its occurrence into the month list and report", async () => {
    recurring.length = 0;
    const app = express();
    app.use(express.json());
    app.use("/expenses", expensesRouter);
    app.use("/recurring", recurringRouter);
    app.use("/reports", reportsRouter);
    const server = app.listen(0);
    await once(server, "listening");
    const address = server.address();
    if (address === null || typeof address === "string") {
      throw new Error("expected a TCP port");
    }
    const base = `http://127.0.0.1:${(address as AddressInfo).port}`;

    try {
      const bad = await fetch(base + "/recurring", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ description: "Rent" })
      });
      const badBody = asRecord(await bad.json(), "error response");
      assert.equal(bad.status, 400);
      const error = asRecord(badBody.error, "error");
      assert.equal(error.code, "invalid_input");

      const createdRes = await fetch(base + "/recurring", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          description: "Rent",
          amountCents: 2500,
          category: "housing",
          dayOfMonth: 1,
          startDate: "2026-10-01"
        })
      });
      const created = asRecord(await createdRes.json(), "created");
      assert.equal(createdRes.status, 201);
      assert.equal(created.id, "r1");
      assert.equal(created.amountCents, 2500);
      assert.equal("endDate" in created, false);

      const listed = asRecord(await (await fetch(base + "/recurring")).json(), "list");
      const items = listed.items;
      assert.equal(Array.isArray(items), true);
      if (!Array.isArray(items)) return;
      assert.equal(items.length, 1);

      const september = asRecord(await (await fetch(base + "/expenses?month=2026-09")).json(), "september");
      assert.equal(september.count, 5);
      const septemberItems = september.items;
      assert.equal(Array.isArray(septemberItems), true);
      if (!Array.isArray(septemberItems)) return;
      assert.equal(septemberItems.some((item) => asRecord(item, "row").recurring === true), false);

      const october = asRecord(await (await fetch(base + "/expenses?month=2026-10")).json(), "october");
      assert.equal(october.count, 1);
      assert.equal(october.total, 25);
      const octoberItems = october.items;
      assert.equal(Array.isArray(octoberItems), true);
      if (!Array.isArray(octoberItems)) return;
      const occurrence = asRecord(octoberItems[0], "occurrence");
      assert.equal(occurrence.id, "r1-2026-10");
      assert.equal(occurrence.date, "2026-10-01");
      assert.equal(occurrence.amount, 25);
      assert.equal(occurrence.recurring, true);

      const unfiltered = asRecord(await (await fetch(base + "/expenses")).json(), "all");
      const allItems = unfiltered.items;
      assert.equal(Array.isArray(allItems), true);
      if (!Array.isArray(allItems)) return;
      assert.equal(allItems.some((item) => asRecord(item, "row").id === "r1-2026-10"), false);

      const report = asRecord(await (await fetch(base + "/reports/monthly?month=2026-10")).json(), "report");
      assert.equal(report.total, 25);
      const byCategory = asRecord(report.byCategory, "byCategory");
      assert.equal(byCategory.housing, 25);
    } finally {
      server.close();
      recurring.length = 0;
    }
  });
});
