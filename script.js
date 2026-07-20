// ---------- Storage ----------
const STORAGE_KEY = "ledger-entries";

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Could not load entries:", e);
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

let entries = loadEntries();

// ---------- Category colors ----------
const CATEGORY_COLORS = {
  Food: "#b8863b",
  Transport: "#4a7c68",
  Housing: "#8c3d2c",
  Fun: "#d9a54c",
  Health: "#2f4d43",
  Other: "#7a6c58",
};

// ---------- DOM refs ----------
const form = document.getElementById("entryForm");
const tape = document.getElementById("tape");
const tapeEmpty = document.getElementById("tapeEmpty");
const monthTotalEl = document.getElementById("monthTotal");
document.getElementById("date").valueAsDate = new Date();

// ---------- Rendering ----------
function formatMoney(n) {
  return "$" + n.toFixed(2);
}

function isThisMonth(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function renderTape() {
  tape.querySelectorAll(".tape-entry").forEach(el => el.remove());

  if (entries.length === 0) {
    tapeEmpty.style.display = "block";
    return;
  }
  tapeEmpty.style.display = "none";

  const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));

  sorted.forEach(entry => {
    const el = document.createElement("div");
    el.className = "tape-entry";
    el.innerHTML = `
      <div class="tape-entry__row">
        <span class="tape-entry__desc">${escapeHtml(entry.desc)}</span>
        <span class="tape-entry__amount">${formatMoney(entry.amount)}</span>
      </div>
      <div class="tape-entry__meta">
        <span>${entry.category} · ${entry.date}</span>
        <button class="tape-entry__delete" data-id="${entry.id}">remove</button>
      </div>
    `;
    tape.appendChild(el);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderTotal() {
  const total = entries
    .filter(e => isThisMonth(e.date))
    .reduce((sum, e) => sum + e.amount, 0);
  monthTotalEl.textContent = formatMoney(total);
}

// ---------- Charts ----------
let categoryChart, trendChart;

function renderCategoryChart() {
  const totals = {};
  entries.forEach(e => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });

  const labels = Object.keys(totals);
  const data = Object.values(totals);
  const colors = labels.map(l => CATEGORY_COLORS[l] || "#7a6c58");

  const ctx = document.getElementById("categoryChart");

  if (categoryChart) categoryChart.destroy();

  if (labels.length === 0) return;

  categoryChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{ data, backgroundColor: colors, borderColor: "#ece4cf", borderWidth: 2 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: { font: { family: "IBM Plex Mono", size: 11 }, color: "#16302a", boxWidth: 12 }
        }
      }
    }
  });
}

function renderTrendChart() {
  const byDay = {};
  entries.forEach(e => {
    byDay[e.date] = (byDay[e.date] || 0) + e.amount;
  });

  const labels = Object.keys(byDay).sort();
  const data = labels.map(d => byDay[d]);

  const ctx = document.getElementById("trendChart");

  if (trendChart) trendChart.destroy();

  if (labels.length === 0) return;

  trendChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels.map(d => d.slice(5)), // MM-DD
      datasets: [{ data, backgroundColor: "#b8863b", borderRadius: 2, maxBarThickness: 28 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { font: { family: "IBM Plex Mono", size: 10 }, color: "#2f4d43" }, grid: { display: false } },
        y: { ticks: { font: { family: "IBM Plex Mono", size: 10 }, color: "#2f4d43" }, grid: { color: "#e3dac4" } }
      }
    }
  });
}

function renderAll() {
  renderTape();
  renderTotal();
  renderCategoryChart();
  renderTrendChart();
}

// ---------- Events ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const desc = document.getElementById("desc").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;

  if (!desc || !amount || !category || !date) return;

  entries.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    desc,
    amount,
    category,
    date
  });

  saveEntries(entries);
  renderAll();

  form.reset();
  document.getElementById("date").valueAsDate = new Date();
  document.getElementById("desc").focus();
});

tape.addEventListener("click", (e) => {
  if (e.target.matches(".tape-entry__delete")) {
    const id = e.target.dataset.id;
    entries = entries.filter(entry => entry.id !== id);
    saveEntries(entries);
    renderAll();
  }
});

// ---------- Init ----------
renderAll();
