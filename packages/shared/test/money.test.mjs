import { test } from "node:test";
import assert from "node:assert/strict";
import { dollarsToCents, formatCents, sumCents, splitCentsEvenly } from "../dist/index.js";

test("dollarsToCents rounds to integer cents", () => {
  assert.equal(dollarsToCents("12.50"), 1250);
  assert.equal(dollarsToCents(0.1), 10);
  assert.equal(dollarsToCents("84.1"), 8410);
});

test("sumCents of 0.1 and 0.2 in cents is exactly 30", () => {
  assert.equal(sumCents([dollarsToCents(0.1), dollarsToCents(0.2)]), 30);
});

test("formatCents pads and signs", () => {
  assert.equal(formatCents(1250), "$12.50");
  assert.equal(formatCents(5), "$0.05");
  assert.equal(formatCents(-199), "-$1.99");
});

test("splitCentsEvenly rounds", () => {
  assert.equal(splitCentsEvenly(100, 3), 33);
});
