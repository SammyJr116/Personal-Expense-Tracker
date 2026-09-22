import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  PREDEFINED_EXPENSE, PREDEFINED_INCOME, DEFAULT_CURRENCY, SCHEMA_VERSION,
} from "./constants";
import { uid, todayStr } from "./format";
import * as storage from "./storage";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

function makeDefaultCategories() {
  const now = Date.now();
  const mk = (name, type, isPredefined) => ({
    id: uid(), name, type, isPredefined, createdAt: now,
  });
  return [
    ...PREDEFINED_EXPENSE.map((n) => mk(n, "expense", true)),
    ...PREDEFINED_INCOME.map((n) => mk(n, "income", true)),
  ];
}

function defaultSettings() {
  return {
    currency: DEFAULT_CURRENCY,
    lastBackupDate: null,
    backupSnooze: null,
    schemaVersion: SCHEMA_VERSION,
  };
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => storage.getSession());
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(defaultSettings());
  const [loaded, setLoaded] = useState(false);

  // Load user data on sign-in (ACC-06 per-account separation)
  useEffect(() => {
    if (!user) {
      setTransactions([]); setCategories([]); setSettings(defaultSettings());
      setLoaded(true);
      return;
    }
    const data = storage.loadUserData(user.id);
    setTransactions(data.transactions || []);
    setCategories(data.categories || makeDefaultCategories());
    setSettings({ ...defaultSettings(), ...(data.settings || {}) });
    setLoaded(true);
  }, [user]);

  // Persist on change
  useEffect(() => {
    if (user && loaded) storage.saveTransactions(user.id, transactions);
  }, [transactions, user, loaded]);
  useEffect(() => {
    if (user && loaded) storage.saveCategories(user.id, categories);
  }, [categories, user, loaded]);
  useEffect(() => {
    if (user && loaded) storage.saveSettings(user.id, settings);
  }, [settings, user, loaded]);

  // ARC-08: multi-tab sync via storage events
  useEffect(() => {
    const onStorage = (e) => {
      if (!user) return;
      if (e.key === "tally:session" && !e.newValue) {
        setUser(null);
      }
      if (e.key && e.key.includes(`:${user.id}:transactions`)) {
        try { setTransactions(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key && e.key.includes(`:${user.id}:categories`)) {
        try { setCategories(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key && e.key.includes(`:${user.id}:settings`)) {
        try { setSettings({ ...defaultSettings(), ...JSON.parse(e.newValue) }); } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [user]);

  const signIn = useCallback((account) => {
    const u = { id: account.email, name: account.name, email: account.email };
    storage.setSession(u);
    setUser(u);
  }, []);

  const signOut = useCallback(() => {
    storage.setSession(null);
    setUser(null);
  }, []);

  // Transactions
  const addTransaction = useCallback((data) => {
    const now = Date.now();
    const txn = {
      id: uid(),
      type: data.type,
      amount: Math.round(Math.round(data.amount * 100)),
      categoryId: data.categoryId,
      date: data.date,
      note: (data.note || "").trim().slice(0, 100),
      createdAt: now,
      updatedAt: now,
    };
    setTransactions((prev) => [...prev, txn]);
    return txn;
  }, []);

  const updateTransaction = useCallback((id, data) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              type: data.type,
              amount: Math.round(Math.round(data.amount * 100)),
              categoryId: data.categoryId,
              date: data.date,
              note: (data.note || "").trim().slice(0, 100),
              updatedAt: Date.now(),
            }
          : t
      )
    );
  }, []);

  const deleteTransaction = useCallback((id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Categories
  const addCategory = useCallback((name) => {
    const trimmed = name.trim().slice(0, 30);
    if (!trimmed) return { error: "Name cannot be empty." };
    const exists = categories.some(
      (c) => c.type === "expense" && c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) return { error: "You already have an expense category with that name." };
    const cat = { id: uid(), name: trimmed, type: "expense", isPredefined: false, createdAt: Date.now() };
    setCategories((prev) => [...prev, cat]);
    return { cat };
  }, [categories]);

  const renameCategory = useCallback((id, name) => {
    const trimmed = name.trim().slice(0, 30);
    if (!trimmed) return { error: "Name cannot be empty." };
    const exists = categories.some(
      (c) => c.id !== id && c.type === "expense" && c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) return { error: "You already have an expense category with that name." };
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name: trimmed } : c)));
    return {};
  }, [categories]);

  // CAT-06: deleting a custom category moves its transactions to "Other"
  const deleteCategory = useCallback((id) => {
    const other = categories.find((c) => c.type === "expense" && c.name === "Other" && c.isPredefined);
    const otherId = other ? other.id : null;
    setTransactions((prev) =>
      prev.map((t) => (t.categoryId === id ? { ...t, categoryId: otherId, updatedAt: Date.now() } : t))
    );
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, [categories]);

  // Settings
  const updateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetAllData = useCallback(() => {
    if (!user) return;
    setTransactions([]);
    setCategories(makeDefaultCategories());
    setSettings(defaultSettings());
    storage.saveTransactions(user.id, []);
    storage.saveCategories(user.id, makeDefaultCategories());
    storage.saveSettings(user.id, defaultSettings());
  }, [user]);

  // Backup / restore (BAK)
  const createBackup = useCallback(() => {
    const payload = {
      format: "tally-backup",
      version: SCHEMA_VERSION,
      createdAt: new Date().toISOString(),
      currency: settings.currency,
      categories,
      transactions,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tally-backup-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    updateSettings({ lastBackupDate: new Date().toISOString() });
  }, [categories, transactions, settings, updateSettings]);

  // Demo aid (not shipped persistent sample data — OOS-21): populate a few
  // realistic transactions for the current month so the UI can be previewed.
  const seedSampleData = useCallback(() => {
    if (!user) return;
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const mk = (day, type, catName, amount, note) => {
      const cat = categories.find((c) => c.name === catName && c.type === type);
      return {
        id: uid(), type,
        amount: Math.round(amount * 100),
        categoryId: cat ? cat.id : null,
        date: `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        note,
        createdAt: Date.now() - day * 1000,
        updatedAt: Date.now() - day * 1000,
      };
    };
    const future = (day, type, catName, amount, note) => {
      const cat = categories.find((c) => c.name === catName && c.type === type);
      return {
        id: uid(), type,
        amount: Math.round(amount * 100),
        categoryId: cat ? cat.id : null,
        date: `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        note,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    };
    const today = now.getDate();
    const txns = [
      mk(Math.min(1, today), "income", "Salary", 4200, "Monthly salary"),
      mk(Math.min(3, today), "expense", "Housing", 1450, "Rent"),
      mk(Math.min(4, today), "expense", "Food", 86.4, "Weekly groceries"),
      mk(Math.min(5, today), "expense", "Transport", 40, "Fuel"),
      mk(Math.min(7, today), "expense", "Utilities", 120, "Electricity & water"),
      mk(Math.min(8, today), "expense", "Entertainment", 32.99, "Cinema"),
      mk(Math.min(10, today), "income", "Freelance", 600, "Side project"),
      mk(Math.min(11, today), "expense", "Shopping", 74.5, "Clothes"),
      mk(Math.min(12, today), "expense", "Health", 55, "Pharmacy"),
      mk(Math.min(14, today), "expense", "Food", 23.8, "Lunch out"),
      mk(Math.min(15, today), "expense", "Transport", 18, "Taxi"),
      mk(Math.min(16, today), "expense", "Education", 200, "Online course"),
    ].filter((t) => t.date <= `${y}-${String(m).padStart(2,"0")}-${String(today).padStart(2,"0")}`);
    // a couple upcoming
    const lastDay = new Date(y, m, 0).getDate();
    if (lastDay > today) txns.push(future(Math.min(today + 3, lastDay), "expense", "Food", 60, "Planned groceries"));
    if (lastDay > today + 5) txns.push(future(Math.min(today + 6, lastDay), "income", "Freelance", 350, "Expected payment"));
    setTransactions(txns);
  }, [user, categories]);

  const restoreBackup = useCallback(
    (file) =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = JSON.parse(reader.result);
            if (!data || data.format !== "tally-backup" || !Array.isArray(data.transactions)) {
              resolve({ error: "This file is not a valid Tally backup." });
              return;
            }
            // BAK-03 merge
            const existingTxns = [...transactions];
            const byId = new Map(existingTxns.map((t) => [t.id, t]));
            let added = 0, skipped = 0, updated = 0;
            for (const t of data.transactions) {
              const ex = byId.get(t.id);
              if (!ex) { byId.set(t.id, t); added++; }
              else if ((t.updatedAt || 0) > (ex.updatedAt || 0)) { byId.set(t.id, t); updated++; }
              else skipped++;
            }
            // BAK-05 categories merge by name (case-insensitive)
            const mergedCats = [...categories];
            const nameIndex = new Map(
              mergedCats.map((c) => [`${c.type}:${c.name.toLowerCase()}`, c.id])
            );
            const catIdMap = new Map();
            for (const c of data.categories || []) {
              const key = `${c.type}:${c.name.toLowerCase()}`;
              if (nameIndex.has(key)) {
                catIdMap.set(c.id, nameIndex.get(key));
              } else {
                const newId = uid();
                mergedCats.push({ ...c, id: newId, isPredefined: false });
                nameIndex.set(key, newId);
                catIdMap.set(c.id, newId);
              }
            }
            const finalTxns = [...byId.values()].map((t) =>
              catIdMap.has(t.categoryId) ? { ...t, categoryId: catIdMap.get(t.categoryId) } : t
            );
            setTransactions(finalTxns);
            setCategories(mergedCats);
            resolve({ added, skipped, updated, currency: data.currency });
          } catch {
            resolve({ error: "This file is corrupted or could not be read." });
          }
        };
        reader.onerror = () => resolve({ error: "Could not read the file." });
        reader.readAsText(file);
      }),
    [transactions, categories]
  );

  const value = {
    user, signIn, signOut,
    transactions, categories, settings,
    addTransaction, updateTransaction, deleteTransaction,
    addCategory, renameCategory, deleteCategory,
    updateSettings, resetAllData,
    createBackup, restoreBackup,
    seedSampleData,
    loaded,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}