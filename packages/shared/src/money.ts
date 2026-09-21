// Money helpers. All amounts are integer cents.

export function dollarsToCents(dollars: string | number): number {
  const value = typeof dollars === "string" ? Number(dollars) : dollars;
  if (!Number.isFinite(value)) throw new Error(`Not a money amount: ${dollars}`);
  return Math.round(value * 100);
}

export function formatCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const rest = abs % 100;
  return `${sign}$${dollars}.${rest.toString().padStart(2, "0")}`;
}

export function addCents(a: number, b: number): number {
  return a + b;
}

export function sumCents(values: number[]): number {
  let total = 0;
  for (const v of values) total += v;
  return total;
}

export function splitCentsEvenly(totalCents: number, ways: number): number {
  if (ways <= 0) throw new Error("ways must be positive");
  return Math.round(totalCents / ways);
}

