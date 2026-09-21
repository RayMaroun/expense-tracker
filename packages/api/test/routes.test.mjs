import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const PORT = 3999;
let child;

before(async () => {
  child = spawn(process.execPath, ["dist/server.js"], { env: { ...process.env, PORT: String(PORT) }, stdio: "ignore" });
  for (let i = 0; i < 40; i++) {
    try { await fetch(`http://localhost:${PORT}/expenses`); return; } catch { await new Promise((r) => setTimeout(r, 100)); }
  }
  throw new Error("api did not start");
});

after(() => child?.kill());

test("september total is exact cents", async () => {
  const res = await fetch(`http://localhost:${PORT}/expenses?month=2026-09`);
  const body = await res.json();
  assert.equal(body.count, 5);
  assert.equal(body.total, 62065);
});

test("monthly report is computed in the business time zone", async () => {
  const res = await fetch(`http://localhost:${PORT}/reports/monthly?month=2026-09`);
  const body = await res.json();
  assert.equal(body.from, "2026-09-01");
  assert.equal(body.to, "2026-09-30");
  assert.equal(body.total, 62065);
  assert.equal(body.byCategory.food, 8440);
});

test("posting converts dollars to cents at the edge", async () => {
  const res = await fetch(`http://localhost:${PORT}/expenses`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ description: "Test", amount: "0.30", category: "other", date: "2026-09-10" })
  });
  const body = await res.json();
  assert.equal(body.amount, 30);
  assert.equal(body.date, "2026-09-10");
});
