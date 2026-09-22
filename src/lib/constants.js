// Central configuration & predefined data (ARC-03, ACC-03, CAT-01, SET-05)
export const APP_NAME = "Tally";
export const APP_TAGLINE = "Your money, privately on this device.";

// ACC-03: allowed domain is a single configuration value
export const COMPANY_DOMAIN = "northwind.co";

export const SCHEMA_VERSION = 1;

// 7.3 Predefined categories — cannot be renamed or deleted (CAT-01)
export const PREDEFINED_EXPENSE = [
  "Food", "Transport", "Housing", "Utilities",
  "Shopping", "Entertainment", "Health", "Education", "Other",
];
export const PREDEFINED_INCOME = ["Salary", "Freelance", "Gift", "Refund", "Other"];

// SET-05: selectable display currencies (label only, no conversion — OOS-07)
export const CURRENCIES = [
  { code: "USD", symbol: "$", label: "USD" },
  { code: "EUR", symbol: "€", label: "EUR" },
  { code: "GBP", symbol: "£", label: "GBP" },
  { code: "ETB", symbol: "Br", label: "ETB" },
  { code: "KES", symbol: "KSh", label: "KES" },
  { code: "INR", symbol: "₹", label: "INR" },
  { code: "JPY", symbol: "¥", label: "JPY" },
];

export const DEFAULT_CURRENCY = "USD";

// NAV-01 main areas
export const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: "LayoutDashboard" },
  { label: "Add Transaction", path: "/add", icon: "PlusCircle" },
  { label: "Transactions", path: "/transactions", icon: "List" },
  { label: "Reports", path: "/reports", icon: "BarChart3" },
  { label: "Settings", path: "/settings", icon: "Settings" },
];

export const PAGE_TITLES = {
  "/": "Dashboard — Tally",
  "/add": "Add Transaction — Tally",
  "/transactions": "Transactions — Tally",
  "/reports": "Reports — Tally",
  "/settings": "Settings — Tally",
  "/help": "Help — Tally",
};

// Demo Google accounts for the simulated sign-in (UI-level gate, ACC-08)
export const DEMO_ACCOUNTS = [
  { name: "Amara Osei", email: "amara.osei@northwind.co" },
  { name: "Daniel Bekele", email: "daniel.bekele@northwind.co" },
];