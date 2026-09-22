import { todayStr } from "./format";

// All calculations operate on integer hundredths (DAT-02).
// BR-03 / UPC-02: only counted transactions (date <= today) affect totals/charts.

export function isCounted(txn, today = todayStr()) {
  return txn.date <= today;
}

export function isUpcoming(txn, today = todayStr()) {
  return txn.date > today;
}

// Period helpers
export function inMonth(txn, year, month) {
  const [y, m] = txn.date.split("-").map(Number);
  return y === year && m === month;
}
export function inYear(txn, year) {
  return Number(txn.date.split("-")[0]) === year;
}

export function inPeriod(txn, period) {
  if (period.type === "all") return true;
  if (period.type === "year") return inYear(txn, period.year);
  return inMonth(txn, period.year, period.month);
}

// Totals for a period — counted only
export function periodTotals(transactions, period, today = todayStr()) {
  let income = 0, expense = 0;
  for (const t of transactions) {
    if (!isCounted(t, today)) continue;
    if (!inPeriod(t, period)) continue;
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, net: income - expense };
}

// Total balance across all dates — counted only (BR-01, DSH-02)
export function totalBalance(transactions, today = todayStr()) {
  let income = 0, expense = 0;
  for (const t of transactions) {
    if (!isCounted(t, today)) continue;
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, balance: income - expense };
}

// Spending by category for a period (RPT-03 — expenses only, counted only)
export function spendingByCategory(transactions, period, categories, today = todayStr()) {
  const map = new Map();
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    if (!isCounted(t, today)) continue;
    if (!inPeriod(t, period)) continue;
    map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
  }
  const total = [...map.values()].reduce((a, b) => a + b, 0);
  const rows = [...map.entries()]
    .map(([catId, amount]) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        id: catId,
        name: cat ? cat.name : "Uncategorised",
        amount,
        share: total > 0 ? amount / total : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount);
  return { rows, total };
}

// Spending trend — by day in Month view, by month in Year view (RPT-05)
export function spendingTrend(transactions, period, today = todayStr()) {
  const buckets = new Map();
  const add = (key, type, amount) => {
    if (!buckets.has(key)) buckets.set(key, { key, income: 0, expense: 0 });
    const b = buckets.get(key);
    if (type === "income") b.income += amount;
    else b.expense += amount;
  };
  for (const t of transactions) {
    if (!isCounted(t, today)) continue;
    if (!inPeriod(t, period)) continue;
    if (period.type === "year") {
      const m = Number(t.date.split("-")[1]);
      add(m, t.type, t.amount);
    } else {
      add(t.date, t.type, t.amount);
    }
  }
  let points;
  if (period.type === "year") {
    points = Array.from({ length: 12 }, (_, i) => ({
      key: i + 1,
      label: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
      income: 0, expense: 0,
    }));
    for (const b of buckets.values()) {
      points[b.key - 1].income = b.income;
      points[b.key - 1].expense = b.expense;
    }
  } else {
    const [y, m] = [period.year, period.month];
    const days = new Date(y, m, 0).getDate();
    points = Array.from({ length: days }, (_, i) => {
      const day = String(i + 1).padStart(2, "0");
      return {
        key: `${y}-${String(m).padStart(2, "0")}-${day}`,
        label: String(i + 1),
        income: 0, expense: 0,
      };
    });
    for (const b of buckets.values()) {
      const idx = Number(b.key.split("-")[2]) - 1;
      if (points[idx]) {
        points[idx].income = b.income;
        points[idx].expense = b.expense;
      }
    }
  }
  return points;
}

// Recent counted transactions for dashboard (DSH-05)
export function recentTransactions(transactions, n = 5, today = todayStr()) {
  return [...transactions]
    .filter((t) => isCounted(t, today))
    .sort((a, b) => (b.date < a.date ? -1 : b.date > a.date ? 1 : b.createdAt - a.createdAt))
    .slice(0, n);
}

export function countForCategory(transactions, categoryId) {
  return transactions.filter((t) => t.categoryId === categoryId).length;
}