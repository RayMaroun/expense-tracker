// Money helpers.

export function addMoney(a: number, b: number) {
  return a + b;
}

export function sumMoney(values: any[]) {
  let total = 0;
  for (const v of values) total = total + v;
  return total;
}

export function formatMoney(value: number) {
  return "$" + value.toFixed(2);
}

export function splitEvenly(total: number, ways: number) {
  return total / ways;
}
