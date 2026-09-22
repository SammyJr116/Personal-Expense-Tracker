import { describe, it, expect } from "vitest";
import { mergeTransactions, mergeCategories, remapCategoryIds } from "../restore-merge";

describe("mergeTransactions", () => {
  const existing = [
    { id: "a", amount: 1000, updatedAt: 100 },
    { id: "b", amount: 2000, updatedAt: 200 },
  ];
  it("adds ids that only exist in the incoming list", () => {
    const { transactions, added, skipped, updated } = mergeTransactions(existing, [
      { id: "c", amount: 3000, updatedAt: 300 },
    ]);
    expect(added).toBe(1);
    expect(skipped).toBe(0);
    expect(updated).toBe(0);
    expect(transactions).toHaveLength(3);
  });
  it("keeps the existing row when incoming is older or equal", () => {
    const { transactions, skipped } = mergeTransactions(existing, [
      { id: "a", amount: 1, updatedAt: 50 },
      { id: "b", amount: 2, updatedAt: 200 },
    ]);
    expect(skipped).toBe(2);
    expect(transactions.find((t) => t.id === "a").amount).toBe(1000);
    expect(transactions.find((t) => t.id === "b").amount).toBe(2000);
  });
  it("lets a newer incoming updatedAt win", () => {
    const { transactions, updated } = mergeTransactions(existing, [
      { id: "a", amount: 9999, updatedAt: 101 },
    ]);
    expect(updated).toBe(1);
    expect(transactions.find((t) => t.id === "a").amount).toBe(9999);
  });
});

describe("mergeCategories", () => {
  const existing = [
    { id: "c1", name: "Food", type: "expense", isPredefined: true },
    { id: "c2", name: "Travel", type: "expense", isPredefined: true },
  ];
  it("remaps matched categories by name (case-insensitive)", () => {
    const { categories, catIdMap } = mergeCategories(existing, [
      { id: "x1", name: "FOOD", type: "expense" },
    ]);
    expect(catIdMap.get("x1")).toBe("c1");
    expect(categories).toHaveLength(2);
  });
  it("appends unmatched categories as non-predefined with a new id", () => {
    const { categories, catIdMap } = mergeCategories(existing, [
      { id: "x2", name: "Pets", type: "expense" },
    ]);
    expect(catIdMap.get("x2")).toBeDefined();
    expect(catIdMap.get("x2")).not.toBe("x2");
    const added = categories.find((c) => c.id === catIdMap.get("x2"));
    expect(added.name).toBe("Pets");
    expect(added.isPredefined).toBe(false);
    expect(categories).toHaveLength(3);
  });
  it("distinguishes categories by type", () => {
    const { categories, catIdMap } = mergeCategories(
      [{ id: "i1", name: "Other", type: "income", isPredefined: true }],
      [{ id: "y1", name: "Other", type: "expense" }]
    );
    expect(catIdMap.get("y1")).not.toBe("i1");
    expect(categories).toHaveLength(2);
  });
});

describe("remapCategoryIds", () => {
  it("rewrites ids present in the map and leaves the rest alone", () => {
    const map = new Map([["x1", "c1"]]);
    const out = remapCategoryIds(
      [{ id: "t1", categoryId: "x1" }, { id: "t2", categoryId: "keepme" }],
      map
    );
    expect(out[0].categoryId).toBe("c1");
    expect(out[1].categoryId).toBe("keepme");
  });
});