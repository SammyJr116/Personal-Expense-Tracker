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
  try {
    if (user) localStorage.setItem(sessionKey(), JSON.stringify(user));
    else localStorage.removeItem(sessionKey());
    return true;
  } catch {
    return false;
  }
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

// FBK-03: writes report success/failure instead of throwing, so callers can
// surface a clear message when storage is full or unavailable.
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// ARC-06 / NFR-02: report which keys were unreadable so callers can preserve
// the raw stored data instead of silently overwriting it.
export function loadUserData(userId) {
  const corruptKeys = [];
  const readTracked = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch {
      corruptKeys.push(key);
      return fallback;
    }
  };
  const txns = readTracked(userKey(userId, "transactions"), []);
  const cats = readTracked(userKey(userId, "categories"), null);
  const settings = readTracked(userKey(userId, "settings"), null);
  return { transactions: txns, categories: cats, settings, corruptKeys };
}

export function saveTransactions(userId, txns) {
  return write(userKey(userId, "transactions"), txns);
}
export function saveCategories(userId, cats) {
  return write(userKey(userId, "categories"), cats);
}
export function saveSettings(userId, settings) {
  return write(userKey(userId, "settings"), settings);
}

export function clearUserData(userId) {
  localStorage.removeItem(userKey(userId, "transactions"));
  localStorage.removeItem(userKey(userId, "categories"));
  localStorage.removeItem(userKey(userId, "settings"));
}

// ARC-07: best-effort request to persist site storage (reduces eviction risk).
export async function requestPersistentStorage() {
  try {
    if (navigator.storage && typeof navigator.storage.persist === "function") {
      await navigator.storage.persist();
    }
  } catch {
    // best effort — unsupported or denied is fine
  }
}

export { SCHEMA_VERSION };