import { describe, it, expect } from "vitest";
import { validateTransaction, MAX_AMOUNT } from "../transaction-validation";
import { STRINGS } from "../strings";

const valid = { type: "expense", amount: "12.34", categoryId: "c1", date: "2026-09-22", note: "" };

describe("validateTransaction", () => {
  it("accepts a valid transaction", () => {
    expect(validateTransaction(valid)).toEqual({});
  });
  it("rejects a missing type", () => {
    expect(validateTransaction({ ...valid, type: "" }).type).toBe(STRINGS.form.errType);
  });
  it("rejects a missing amount", () => {
    expect(validateTransaction({ ...valid, amount: "" }).amount).toBe(STRINGS.form.errAmountRequired);
    expect(validateTransaction({ ...valid, amount: "   " }).amount).toBe(STRINGS.form.errAmountRequired);
  });
  it("rejects non-numeric or badly formatted amounts", () => {
    expect(validateTransaction({ ...valid, amount: "abc" }).amount).toBe(STRINGS.form.errAmountFormat);
    expect(validateTransaction({ ...valid, amount: "1.234" }).amount).toBe(STRINGS.form.errAmountFormat);
    expect(validateTransaction({ ...valid, amount: "1.2.3" }).amount).toBe(STRINGS.form.errAmountFormat);
    expect(validateTransaction({ ...valid, amount: "-5" }).amount).toBe(STRINGS.form.errAmountFormat);
  });
  it("rejects zero amounts", () => {
    expect(validateTransaction({ ...valid, amount: "0" }).amount).toBe(STRINGS.form.errAmountPositive);
    expect(validateTransaction({ ...valid, amount: "0.00" }).amount).toBe(STRINGS.form.errAmountPositive);
  });
  it("rejects amounts above the maximum", () => {
    expect(validateTransaction({ ...valid, amount: String(MAX_AMOUNT + 0.01) }).amount).toBe(STRINGS.form.errAmountLarge);
    expect(validateTransaction({ ...valid, amount: String(MAX_AMOUNT) })).toEqual({});
  });
  it("rejects a missing category and date", () => {
    expect(validateTransaction({ ...valid, categoryId: "" }).category).toBe(STRINGS.form.errCategory);
    expect(validateTransaction({ ...valid, date: "" }).date).toBe(STRINGS.form.errDate);
  });
  it("rejects notes over 100 characters", () => {
    expect(validateTransaction({ ...valid, note: "x".repeat(101) }).note).toBe(STRINGS.form.errNote);
    expect(validateTransaction({ ...valid, note: "x".repeat(100) })).toEqual({});
  });
  it("reports multiple errors at once", () => {
    const e = validateTransaction({ ...valid, type: "", amount: "", categoryId: "" });
    expect(Object.keys(e).sort()).toEqual(["amount", "category", "type"]);
  });
});