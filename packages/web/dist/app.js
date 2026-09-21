import { format, parseISO } from "date-fns";
import { formatCents, sumCents } from "@expense/shared";
const API = "http://localhost:3000";
const monthInput = document.getElementById("month");
const rowsEl = document.getElementById("rows");
const totalEl = document.getElementById("total");
async function load() {
    const res = await fetch(`${API}/expenses?month=${monthInput.value}`);
    const data = (await res.json());
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
