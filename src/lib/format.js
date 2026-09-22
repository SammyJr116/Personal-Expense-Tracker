import { CURRENCIES } from "./constants";

// DAT-02 / SET-03: amounts stored as integer hundredths, displayed with 2 decimals
// UXD-08: thousands separators, unambiguous dates "21 Sep 2026"

export function currencyMeta(code) {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
}

// amount is in hundredths (integer). Returns "1,234.56 USD"
export function formatAmount(hundredths, code = "USD", opts = {}) {
  const value = (hundredths ?? 0) / 100;
  const sign = value < 0 ? "-" : opts.forcePlus ? "+" : "";
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}${formatted} ${code}`;
}

// Just the number part with symbol, e.g. "$1,234.56"
export function formatMoney(hundredths, code = "USD", opts = {}) {
  const meta = currencyMeta(code);
  const value = (hundredths ?? 0) / 100;
  const sign = value < 0 ? "-" : opts.forcePlus ? "+" : "";
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}${meta.symbol}${formatted}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// "21 Sep 2026"
export function formatDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function formatMonthLabel(year, month) {
  return `${MONTHS_FULL[month - 1]} ${year}`;
}

export function todayStr() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function daysAgoStr(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function relativeDate(dateStr) {
  const today = todayStr();
  if (dateStr === today) return "Today";
  if (dateStr < today) {
    const diff = Math.round((new Date(today) - new Date(dateStr)) / 86400000);
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;
  } else {
    const diff = Math.round((new Date(dateStr) - new Date(today)) / 86400000);
    if (diff === 1) return "Tomorrow";
    if (diff < 14) return `In ${diff} days`;
  }
  return formatDate(dateStr);
}

export function uid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}