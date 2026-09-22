import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  PREDEFINED_EXPENSE, PREDEFINED_INCOME, DEFAULT_CURRENCY, SCHEMA_VERSION,
} from "./constants";
import { uid, todayStr } from "./format";
import * as storage from "./storage";
import { applyCategoryDelete } from "./category-delete";
import { mergeTransactions, mergeCategories, remapCategoryIds } from "./restore-merge";
import { toast } from "@/components/ui/use-toast";

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
  // ARC-06: kinds of user data whose stored value could not be parsed.
  // While a kind is listed, saves to it are suppressed so the raw value survives.
  const [corruptKinds, setCorruptKinds] = useState(() => new Set());

  // Load user data on sign-in (ACC-06 per-account separation)
  useEffect(() => {
    if (!user) {
      setTransactions([]); setCategories([]); setSettings(defaultSettings());
      setCorruptKinds(new Set());
      setLoaded(true);
      return;
    }
    const data = storage.loadUserData(user.id);
    setTransactions(data.transactions || []);
    setCategories(data.categories || makeDefaultCategories());
    setSettings({ ...defaultSettings(), ...(data.settings || {}) });
    setCorruptKinds(new Set((data.corruptKeys || []).map((k) => k.split(":").pop())));
    setLoaded(true);
    storage.requestPersistentStorage(); // ARC-07: best effort, only once a user is present
  }, [user]);

  // Persist on change (FBK-03: surface save failures instead of losing data)
  useEffect(() => {
    if (user && loaded && !corruptKinds.has("transactions") && !storage.saveTransactions(user.id, transactions)) {
      toast({ title: "Change not saved", description: "Storage is full or unavailable — your latest transaction change may not be saved.", variant: "destructive" });
    }
  }, [transactions, user, loaded, corruptKinds]);
  useEffect(() => {
    if (user && loaded && !corruptKinds.has("categories") && !storage.saveCategories(user.id, categories)) {
      toast({ title: "Change not saved", description: "Storage is full or unavailable — your latest category change may not be saved.", variant: "destructive" });
    }
  }, [categories, user, loaded, corruptKinds]);
  useEffect(() => {
    if (user && loaded && !corruptKinds.has("settings") && !storage.saveSettings(user.id, settings)) {
      toast({ title: "Change not saved", description: "Storage is full or unavailable — your latest setting may not be saved.", variant: "destructive" });
    }
  }, [settings, user, loaded, corruptKinds]);

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
    const { transactions: nextTx, categories: nextCats } = applyCategoryDelete(categories, transactions, id);
    setTransactions(nextTx);
    setCategories(nextCats);
  }, [categories, transactions]);

  // Settings
  const updateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetAllData = useCallback(() => {
    if (!user) return;
    setTransactions([]);
    setCategories(makeDefaultCategories());
    setSettings(defaultSettings());
    setCorruptKinds(new Set());
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
            // BAK-03 / BAK-05: pure merge + category remap
            const { transactions: finalTxns, added, skipped, updated } = mergeTransactions(transactions, data.transactions);
            const { categories: mergedCats, catIdMap } = mergeCategories(categories, data.categories || []);
            const pendingTransactions = remapCategoryIds(finalTxns, catIdMap);
            // BAK-04: preview only — nothing is applied until applyRestore is called
            resolve({ added, skipped, updated, currency: data.currency, pendingTransactions, pendingCategories: mergedCats });
          } catch {
            resolve({ error: "This file is corrupted or could not be read." });
          }
        };
        reader.onerror = () => resolve({ error: "Could not read the file." });
        reader.readAsText(file);
      }),
    [transactions, categories]
  );

  // BAK-04: commits a staged restore computed by restoreBackup
  const applyRestore = useCallback((pending) => {
    setTransactions(pending.pendingTransactions);
    setCategories(pending.pendingCategories);
    setCorruptKinds(new Set());
  }, []);

  const value = {
    user, signIn, signOut,
    transactions, categories, settings,
    addTransaction, updateTransaction, deleteTransaction,
    addCategory, renameCategory, deleteCategory,
    updateSettings, resetAllData,
    createBackup, restoreBackup, applyRestore,
    dataUnreadable: corruptKinds.size > 0,
    loaded,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}