import moment from "moment";
import { formatMoney } from "@expense/shared";
const API = "http://localhost:3000";
const monthInput = document.getElementById("month");
const rowsEl = document.getElementById("rows");
const totalEl = document.getElementById("total");
async function load() {
    const res = await fetch(`${API}/expenses?month=${monthInput.value}`);
    const data = await res.json();
    rowsEl.innerHTML = "";
    let runningTotal = 0;
    for (const item of data.items) {
        runningTotal = runningTotal + item.amount;
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td>${moment(item.date).format("ddd, MMM D")}</td>
      <td>${item.description}</td>
      <td>${item.category}</td>
      <td class="num">${formatMoney(item.amount)}</td>`;
        rowsEl.appendChild(tr);
    }
    totalEl.textContent = formatMoney(runningTotal);
}
monthInput.addEventListener("change", load);
load();
