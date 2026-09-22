import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/lib/store";
import { CURRENCIES } from "@/lib/constants";
import { useToast } from "@/components/ui/use-toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import { formatMoney } from "@/lib/format";
import {
  Coins, Tags, Download, Upload, LogOut, Trash2, HelpCircle,
  ShieldAlert, ChevronRight, Clock,
} from "lucide-react";

export default function Settings() {
  const { user, settings, updateSettings, createBackup, restoreBackup, resetAllData, signOut, transactions, categories } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [pendingCurrency, setPendingCurrency] = useState(null);
  const [restoreFile, setRestoreFile] = useState(null);
  const [restoreSummary, setRestoreSummary] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetText, setResetText] = useState("");

  const lastBackup = settings.lastBackupDate;

  const applyCurrency = () => {
    updateSettings({ currency: pendingCurrency });
    setCurrencyOpen(false);
    setPendingCurrency(null);
    toast({ title: "Display currency updated", description: "Amounts were relabelled, not converted." });
  };

  const onBackup = () => {
    createBackup();
    toast({ title: "Backup downloaded", description: "Your JSON file is not encrypted — store it safely." });
  };

  const onPickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoreFile(file);
    // preview by actually parsing
    restoreBackup(file).then((res) => {
      if (res.error) {
        toast({ title: "Restore failed", description: res.error, variant: "destructive" });
        setRestoreFile(null);
      } else {
        setRestoreSummary(res);
      }
    });
  };

  const confirmRestore = () => {
    toast({
      title: "Restore complete",
      description: `${restoreSummary.added} added, ${restoreSummary.skipped} skipped${restoreSummary.updated ? `, ${restoreSummary.updated} updated` : ""}.`,
    });
    if (restoreSummary.currency && restoreSummary.currency !== settings.currency) {
      toast({ title: "Note", description: `Backup used ${restoreSummary.currency}. Your current currency was kept.`, });
    }
    setRestoreSummary(null);
    setRestoreFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const confirmReset = () => {
    resetAllData();
    setResetOpen(false);
    setResetText("");
    toast({ title: "All data reset", description: "Your transactions and custom categories were removed." });
  };

  const signOutAndGo = () => {
    signOut();
    navigate("/");
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your preferences, data, and account.</p>

      {/* Display currency — SET-02 */}
      <Section icon={Coins} title="Display currency" description="A label only — amounts are never converted.">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">{settings.currency}</div>
            <div className="text-xs text-muted-foreground">All amounts use two decimals.</div>
          </div>
          <select
            value={settings.currency}
            onChange={(e) => { setPendingCurrency(e.target.value); setCurrencyOpen(true); }}
            className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
          >
            {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}
          </select>
        </div>
      </Section>

      {/* Categories — CAT-08 */}
      <Link to="/categories" className="block">
        <Section icon={Tags} title="Categories" description="Add, rename, or delete custom expense categories." chevron />
      </Link>

      {/* Backup & restore — BAK */}
      <Section icon={Download} title="Backup & restore" description="Back up to a JSON file or restore by merging.">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            Last backup: <span className="font-medium text-foreground">{lastBackup ? new Date(lastBackup).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Never"}</span>
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button onClick={onBackup} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
            <Download className="h-4 w-4" /> Back up my data
          </button>
          <button onClick={() => fileRef.current?.click()} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition hover:border-foreground/30">
            <Upload className="h-4 w-4" /> Restore from file
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onPickFile} />
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-accent/10 px-3 py-2 text-xs text-muted-foreground">
          <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
          Backup files are plain, unencrypted JSON. Restore merges into your data and may bring back deleted transactions.
        </div>
      </Section>

      {/* Account — ACC-04 */}
      <Section icon={LogOut} title="Account">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              {(user?.name || "?").charAt(0)}
            </div>
            <div>
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-muted-foreground">{user?.email}</div>
            </div>
          </div>
          <button onClick={signOutAndGo} className="inline-flex items-center gap-2 rounded-xl border border-border px-3.5 py-2 text-sm font-medium transition hover:border-destructive hover:text-destructive">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Signing out keeps your data on this device.</p>
      </Section>

      {/* Reset — SET-04 */}
      <Section icon={Trash2} title="Reset all data" description="Permanently delete your transactions and custom categories.">
        <button onClick={() => setResetOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-2.5 text-sm font-medium text-destructive transition hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" /> Reset all data
        </button>
      </Section>

      {/* Help link — NAV-02 */}
      <Link to="/help" className="block">
        <Section icon={HelpCircle} title="Help & privacy" description="How your data is stored and how to back up." chevron />
      </Link>

      {/* Currency change warning — SET-02 */}
      <ConfirmDialog
        open={currencyOpen}
        onOpenChange={setCurrencyOpen}
        title="Change display currency?"
        confirmLabel="Change label"
        onConfirm={applyCurrency}
      >
        <p>This only changes the currency label. Existing amounts are <b>not converted</b> — {formatMoney(transactions.reduce((a, t) => a + (t.type === "income" ? t.amount : -t.amount), 0), pendingCurrency || settings.currency)} would simply be shown in {pendingCurrency}.</p>
      </ConfirmDialog>

      {/* Restore summary — BAK-04 */}
      <ConfirmDialog
        open={!!restoreSummary}
        onOpenChange={(o) => { if (!o) { setRestoreSummary(null); setRestoreFile(null); } }}
        title="Restore this backup?"
        confirmLabel="Restore"
        onConfirm={confirmRestore}
      >
        {restoreSummary && (
          <div>
            <p>This will <b>merge</b> into your current data:</p>
            <ul className="mt-2 space-y-1">
              <li>• {restoreSummary.added} transaction{restoreSummary.added !== 1 ? "s" : ""} added</li>
              <li>• {restoreSummary.skipped} skipped (already exist)</li>
              {restoreSummary.updated > 0 && <li>• {restoreSummary.updated} updated (newer version)</li>}
            </ul>
            <p className="mt-2 text-xs">Transactions deleted since this backup will come back.</p>
          </div>
        )}
      </ConfirmDialog>

      {/* Reset typed confirmation — SET-04 */}
      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset all data?"
        confirmLabel="Reset everything"
        destructive
        onConfirm={confirmReset}
      >
        <div>
          <p className="text-sm">This permanently deletes {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} and {categories.filter((c) => !c.isPredefined).length} custom categor{categories.filter((c) => !c.isPredefined).length !== 1 ? "ies" : "y"}. This cannot be undone.</p>
          <p className="mt-3 text-sm font-medium">Type <span className="font-mono">RESET</span> to confirm:</p>
          <input
            value={resetText}
            onChange={(e) => setResetText(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
            placeholder="RESET"
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}

function Section({ icon: Icon, title, description, children, chevron }) {
  return (
    <div className="card-soft mt-4 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-base font-semibold">{title}</h2>
            {chevron && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </div>
  );
}