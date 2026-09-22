import { describe, it, expect } from "vitest";
import { applyCategoryDelete } from "../category-delete";

const categories = [
  { id: "c1", name: "Food", type: "expense", isPredefined: true },
  { id: "c2", name: "Other", type: "expense", isPredefined: true },
  { id: "c3", name: "Pets", type: "expense", isPredefined: false },
  { id: "inc", name: "Salary", type: "income", isPredefined: true },
];

const transactions = [
  { id: "t1", categoryId: "c3", amount: 1000 },
  { id: "t2", categoryId: "c1", amount: 2000 },
  { id: "t3", categoryId: "c3", amount: 3000 },
  { id: "t4", categoryId: "c2", amount: 4000 },
];

describe("applyCategoryDelete", () => {
  it("moves affected transactions to the built-in Other category", () => {
    const now = 42;
    const { transactions: next } = applyCategoryDelete(categories, transactions, "c3", now);
    const moved = next.filter((t) => t.id === "t1" || t.id === "t3");
    expect(moved.every((t) => t.categoryId === "c2")).toBe(true);
    expect(moved.every((t) => t.updatedAt === now)).toBe(true);
    expect(next.find((t) => t.id === "t2").categoryId).toBe("c1");
    expect(next.find((t) => t.id === "t4").categoryId).toBe("c2");
  });
  it("removes the deleted category from the list", () => {
    const { categories: next } = applyCategoryDelete(categories, transactions, "c3");
    expect(next.some((c) => c.id === "c3")).toBe(false);
    expect(next).toHaveLength(3);
  });
  it("leaves other categories untouched", () => {
    const { categories: next } = applyCategoryDelete(categories, transactions, "c3");
    expect(next.find((c) => c.id === "c1")).toEqual(categories.find((c) => c.id === "c1"));
  });
  it("maps to null when no built-in Other category exists", () => {
    const noOther = categories.filter((c) => c.name !== "Other");
    const { transactions: next } = applyCategoryDelete(noOther, transactions, "c3");
    const moved = next.filter((t) => t.id === "t1" || t.id === "t3");
    expect(moved.every((t) => t.categoryId === null)).toBe(true);
  });
  it("deleting a nonexistent id changes nothing", () => {
    const before = JSON.stringify(transactions);
    const { transactions: next, categories: cats } = applyCategoryDelete(categories, transactions, "nope");
    expect(JSON.stringify(next)).toBe(before);
    expect(cats).toHaveLength(4);
  });
});