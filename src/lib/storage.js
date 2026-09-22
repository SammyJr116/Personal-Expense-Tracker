import { SCHEMA_VERSION } from "./constants";

// ARC-04: storage layer — all reads/writes go through here so a backend can
// replace it later without changing the UI. Uses localStorage (ARC-03, ARC-05).
// ACC-06: data is kept separately per Google account id.

const PREFIX = "tally";
const sessionKey = () => `${PREFIX}:session`;

function userKey(userId, kind) {
  return `${PREFIX}:${userId}:${kind}`;
}

export function getSession() {
  try {
    const raw = localStorage.getItem(sessionKey());
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(user) {
  if (user) localStorage.setItem(sessionKey(), JSON.stringify(user));
  else localStorage.removeItem(sessionKey());
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadUserData(userId) {
  const txns = read(userKey(userId, "transactions"), []);
  const cats = read(userKey(userId, "categories"), null);
  const settings = read(userKey(userId, "settings"), null);
  return { transactions: txns, categories: cats, settings };
}

export function saveTransactions(userId, txns) {
  write(userKey(userId, "transactions"), txns);
}
export function saveCategories(userId, cats) {
  write(userKey(userId, "categories"), cats);
}
export function saveSettings(userId, settings) {
  write(userKey(userId, "settings"), settings);
}

export function clearUserData(userId) {
  localStorage.removeItem(userKey(userId, "transactions"));
  localStorage.removeItem(userKey(userId, "categories"));
  localStorage.removeItem(userKey(userId, "settings"));
}

export { SCHEMA_VERSION };