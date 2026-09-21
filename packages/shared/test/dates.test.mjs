import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDate, daysBetween, isSameMonth, startOfMonth } from "../dist/index.js";

test("formatDate returns ISO date", () => {
  assert.equal(formatDate("2026-09-02"), "2026-09-02");
});

test("daysBetween counts calendar days", () => {
  assert.equal(daysBetween("2026-09-01", "2026-09-30"), 29);
});

test("isSameMonth", () => {
  assert.equal(isSameMonth("2026-09-02", "2026-09-28"), true);
  assert.equal(isSameMonth("2026-09-02", "2026-10-01"), false);
});

test("startOfMonth is the first", () => {
  assert.equal(formatDate(startOfMonth("2026-09-17")), "2026-09-01");
});
