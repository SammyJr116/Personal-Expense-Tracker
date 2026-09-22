import { describe, it, expect } from "vitest";
import {
  isCounted, isUpcoming, inPeriod, periodTotals, totalBalance,
  spendingByCategory, spendingTrend, recentTransactions,
} from "../calc";

const TODAY = "2026-09-22";

const tx = (over = {}) => ({
  id: "t1", type: "expense", amount: 1000, categoryId: "c1",
  date: "2026-09-01", note: "", createdAt: 1, updatedAt: 1, ...over,
});

describe("isCounted / isUpcoming", () => {
  it("counts transactions dated today or earlier", () => {
    expect(isCounted(tx({ date: TODAY }), TODAY)).toBe(true);
    expect(isCounted(tx({ date: "2026-09-21" }), TODAY)).toBe(true);
  });
  it("treats future dates as upcoming", () => {
    expect(isCounted(tx({ date: "2026-09-23" }), TODAY)).toBe(false);
    expect(isUpcoming(tx({ date: "2026-09-23" }), TODAY)).toBe(true);
    expect(isUpcoming(tx({ date: TODAY }), TODAY)).toBe(false);
  });
  it("defaults today to the real date", () => {
    expect(typeof isCounted(tx())).toBe("boolean");
  });
});

describe("periodTotals", () => {
  const list = [
    tx({ id: "a", type: "income", amount: 5000, date: "2026-09-05" }),
    tx({ id: "b", type: "expense", amount: 2000, date: "2026-09-10" }),
    tx({ id: "c", type: "expense", amount: 1000, date: "2026-08-10" }),
    tx({ id: "d", type: "expense", amount: 500, date: "2026-09-25" }), // upcoming
  ];
  it("sums income/expense/net for a month, counting only non-upcoming", () => {
    expect(periodTotals(list, { type: "month", year: 2026, month: 9 }, TODAY)).toEqual({ income: 5000, expense: 2000, net: 3000 });
  });
  it("excludes other months", () => {
    expect(periodTotals(list, { type: "month", year: 2026, month: 8 }, TODAY)).toEqual({ income: 0, expense: 1000, net: -1000 });
  });
  it("handles year periods", () => {
    expect(periodTotals(list, { type: "year", year: 2026 }, TODAY)).toEqual({ income: 5000, expense: 3000, net: 2000 });
  });
  it("handles all time", () => {
    expect(periodTotals(list, { type: "all" }, TODAY)).toEqual({ income: 5000, expense: 3000, net: 2000 });
  });
});

describe("totalBalance", () => {
  const list = [
    tx({ id: "a", type: "income", amount: 10000 }),
    tx({ id: "b", type: "expense", amount: 4000 }),
    tx({ id: "c", type: "expense", amount: 700, date: "2026-09-25" }), // upcoming
  ];
  it("subtracts expenses from income across all dates", () => {
    expect(totalBalance(list, TODAY)).toEqual({ income: 10000, expense: 4000, balance: 6000 });
  });
});

describe("spendingByCategory", () => {
  const cats = [
    { id: "c1", name: "Food", type: "expense" },
    { id: "c2", name: "Transport", type: "expense" },
  ];
  const list = [
    tx({ id: "a", categoryId: "c1", amount: 3000, date: "2026-09-05" }),
    tx({ id: "b", categoryId: "c2", amount: 1000, date: "2026-09-06" }),
    tx({ id: "c", categoryId: "c1", amount: 2000, date: "2026-08-05" }),
    tx({ id: "d", categoryId: "c1", amount: 1000, date: "2026-09-25" }), // upcoming
  ];
  it("is expense-only and counted-only", () => {
    const { rows, total } = spendingByCategory(list, { type: "month", year: 2026, month: 9 }, cats, TODAY);
    expect(total).toBe(4000);
    expect(rows).toHaveLength(2);
  });
  it("sorts rows by amount descending with a share", () => {
    const { rows } = spendingByCategory(list, { type: "month", year: 2026, month: 9 }, cats, TODAY);
    expect(rows[0]).toEqual({ id: "c1", name: "Food", amount: 3000, share: 0.75 });
    expect(rows[1]).toEqual({ id: "c2", name: "Transport", amount: 1000, share: 0.25 });
  });
  it("labels unknown categories as Uncategorised", () => {
    const { rows } = spendingByCategory([tx({ id: "a", categoryId: "zz", amount: 500 })], { type: "all" }, cats, TODAY);
    expect(rows[0].name).toBe("Uncategorised");
    expect(rows[0].share).toBe(1);
  });
});

describe("spendingTrend", () => {
  const list = [
    tx({ id: "a", type: "income", amount: 2000, date: "2026-09-03" }),
    tx({ id: "b", type: "expense", amount: 700, date: "2026-09-03" }),
    tx({ id: "c", type: "expense", amount: 300, date: "2026-09-21" }),
    tx({ id: "d", type: "expense", amount: 900, date: "2026-03-15" }),
  ];
  it("buckets a month period by day", () => {
    const points = spendingTrend(list, { type: "month", year: 2026, month: 9 }, TODAY);
    expect(points).toHaveLength(30);
    const day3 = points.find((p) => p.key === "2026-09-03");
    expect(day3.income).toBe(2000);
    expect(day3.expense).toBe(700);
  });
  it("buckets a year period by month", () => {
    const points = spendingTrend(list, { type: "year", year: 2026 }, TODAY);
    expect(points).toHaveLength(12);
    expect(points[0]).toMatchObject({ income: 0, expense: 0 });
    expect(points[2].expense).toBe(900);
    expect(points[8].income).toBe(2000);
    expect(points[8].expense).toBe(1000);
  });
});

describe("recentTransactions", () => {
  const list = [
    tx({ id: "a", date: "2026-09-10", createdAt: 20 }),
    tx({ id: "b", date: "2026-09-10", createdAt: 10 }),
    tx({ id: "c", date: "2026-09-21", createdAt: 30 }),
    tx({ id: "d", date: "2026-09-25", createdAt: 40 }), // upcoming
  ];
  it("returns only counted, newest first, ties broken by createdAt desc", () => {
    expect(recentTransactions(list, 5, TODAY).map((t) => t.id)).toEqual(["c", "a", "b"]);
  });
  it("respects the n limit", () => {
    expect(recentTransactions(list, 2, TODAY).map((t) => t.id)).toEqual(["c", "a"]);
  });
});

describe("inPeriod", () => {
  const t = tx({ date: "2026-07-14" });
  it("matches month, year, and all", () => {
    expect(inPeriod(t, { type: "month", year: 2026, month: 7 })).toBe(true);
    expect(inPeriod(t, { type: "month", year: 2026, month: 6 })).toBe(false);
    expect(inPeriod(t, { type: "year", year: 2026 })).toBe(true);
    expect(inPeriod(t, { type: "all" })).toBe(true);
  });
});