// TXN-03: transaction form validation. Pure function — no React, no DOM.
import { STRINGS } from "./strings";

export const MAX_AMOUNT = 999999999.99;

// Returns an errors object keyed by field name; an empty object means valid.
export function validateTransaction({ type, amount, categoryId, date, note = "" }) {
  const e = {};
  if (!type) e.type = STRINGS.form.errType;
  const amtStr = String(amount).trim();
  if (!amtStr) e.amount = STRINGS.form.errAmountRequired;
  else if (!/^\d+(\.\d{1,2})?$/.test(amtStr)) e.amount = STRINGS.form.errAmountFormat;
  else {
    const n = parseFloat(amtStr);
    if (!(n > 0)) e.amount = STRINGS.form.errAmountPositive;
    else if (n > MAX_AMOUNT) e.amount = STRINGS.form.errAmountLarge;
  }
  if (!categoryId) e.category = STRINGS.form.errCategory;
  if (!date) e.date = STRINGS.form.errDate;
  if (note.length > 100) e.note = STRINGS.form.errNote;
  return e;
}