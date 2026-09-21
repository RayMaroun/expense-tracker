import { format, parseISO } from "date-fns";
import { formatCents, sumCents, type Expense } from "@expense/shared";

const API = "http://localhost:3000";

const monthInput = document.getElementById("month") as HTMLInputElement;
const rowsEl = document.getElementById("rows") as HTMLElement;
const totalEl = document.getElementById("total") as HTMLElement;

type ExpensesResponse = { count: number; total: number; items: Expense[] };

async function load(): Promise<void> {
  const res = await fetch(`${API}/expenses?month=${monthInput.value}`);
  const data = (await res.json()) as ExpensesResponse;

  rowsEl.innerHTML = "";
  for (const item of data.items) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${format(parseISO(item.date), "EEE, MMM d")}</td>
      <td>${item.description}</td>
      <td>${item.category}</td>
      <td class="num">${formatCents(item.amount)}</td>`;
    rowsEl.appendChild(tr);
  }
  totalEl.textContent = formatCents(sumCents(data.items.map((i) => i.amount)));
}

monthInput.addEventListener("change", () => void load());
void load();
