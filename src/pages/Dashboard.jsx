import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/lib/store";
import { usePeriod } from "@/lib/period";
import { periodTotals, totalBalance, spendingByCategory, recentTransactions, isUpcoming, inPeriod } from "@/lib/calc";
import { formatMoney, formatMonthLabel } from "@/lib/format";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import TransactionRow from "@/components/TransactionRow";
import TransactionForm from "@/components/TransactionForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import CategoryDonut from "@/components/charts/CategoryDonut";
import PeriodPicker from "@/components/PeriodPicker";
import { useToast } from "@/components/ui/use-toast";
import { Wallet, TrendingUp, TrendingDown, Scale, ArrowRight, Plus, Sparkles } from "lucide-react";

export default function Dashboard() {
  const { transactions, categories, settings, deleteTransaction, seedSampleData } = useApp();
  const { period } = usePeriod();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const currency = settings.currency;
  const totals = periodTotals(transactions, period);
  const balance = totalBalance(transactions);
  const catData = spendingByCategory(transactions, period, categories);
  const recent = recentTransactions(transactions, 5);

  const periodName = period.type === "year" ? String(period.year) : formatMonthLabel(period.year, period.month);
  const hasAny = transactions.length > 0;
  const upcomingInPeriod = transactions.filter((t) => isUpcoming(t) && inPeriod(t, period)).length;
  const countedInPeriod = transactions.filter((t) => !isUpcoming(t) && inPeriod(t, period)).length;

  const confirmDelete = () => {
    deleteTransaction(toDelete.id);
    toast({ title: "Transaction deleted", description: "Totals and charts updated." });
    setToDelete(null);
  };

  // ONB-01: first run — no transactions at all
  if (!hasAny) {
    return (
      <div>
        <PageHeader periodName={periodName} />
        <div className="card-soft mt-6 p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-semibold">Add your first transaction</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Welcome to Tally. Record your first income or expense to get started. Your data lives on this device —
            back it up regularly from Settings.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button onClick={() => { setEditing(null); setFormOpen(true); }} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
              <Plus className="h-4 w-4" /> Add transaction
            </button>
            <button onClick={seedSampleData} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground/80 transition hover:border-foreground/30">
              <Sparkles className="h-4 w-4" /> Load example data
            </button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Example data is for previewing only — clear it anytime from Settings → Reset.</p>
        </div>
        <TransactionForm open={formOpen} onOpenChange={setFormOpen} editing={editing} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader periodName={periodName} onAdd={() => { setEditing(null); setFormOpen(true); }} />

      <div className="mt-6">
        <PeriodPicker />
      </div>

      {/* Stat cards — DSH-01, DSH-02 */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total income" value={formatMoney(totals.income, currency)} tone="income" icon={TrendingUp} accent="hsl(152 40% 30%)" sublabel={periodName} />
        <StatCard label="Total expenses" value={formatMoney(totals.expense, currency)} tone="expense" icon={TrendingDown} accent="hsl(4 60% 48%)" sublabel={periodName} />
        <StatCard label="Net this period" value={formatMoney(totals.net, currency)} tone="balance" icon={Scale} sublabel={periodName} />
        <StatCard label="Total balance" value={formatMoney(balance.balance, currency)} icon={Wallet} accent="hsl(28 58% 52%)" sublabel="All time" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Spending by category — DSH-06 */}
        <div className="card-soft p-5 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Spending by category</h2>
            <Link to="/reports" className="text-sm text-muted-foreground hover:text-primary">Reports <ArrowRight className="inline h-3.5 w-3.5" /></Link>
          </div>
          <div className="mt-5">
            {catData.rows.length ? (
              <CategoryDonut rows={catData.rows} currency={currency} />
            ) : (
              <EmptyState
                compact
                icon={TrendingDown}
                title="No expenses in this period"
                description={upcomingInPeriod ? `${upcomingInPeriod} upcoming transaction${upcomingInPeriod > 1 ? "s" : ""} not counted yet.` : "Add an expense to see the breakdown."}
              />
            )}
          </div>
        </div>

        {/* Recent transactions — DSH-05 */}
        <div className="card-soft p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent</h2>
            <Link to="/transactions" className="text-sm text-muted-foreground hover:text-primary">View all <ArrowRight className="inline h-3.5 w-3.5" /></Link>
          </div>
          <div className="mt-3 space-y-0.5">
            {recent.length ? (
              recent.map((t) => (
                <TransactionRow key={t.id} txn={t} onEdit={(tx) => { setEditing(tx); setFormOpen(true); }} onDelete={(tx) => setToDelete(tx)} />
              ))
            ) : (
              <EmptyState compact icon={Wallet} title="No counted transactions yet" description="Future-dated transactions appear once their date arrives." />
            )}
          </div>
        </div>
      </div>

      {/* UPC-07: period with only upcoming */}
      {countedInPeriod === 0 && upcomingInPeriod > 0 && (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-secondary/40 px-5 py-4 text-sm text-muted-foreground">
          {upcomingInPeriod} upcoming transaction{upcomingInPeriod > 1 ? "s are" : " is"} not counted yet. They'll appear in totals once their date arrives.
        </div>
      )}

      <TransactionForm open={formOpen} onOpenChange={setFormOpen} editing={editing} />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete this transaction?"
        destructive
        confirmLabel="Delete"
        onConfirm={confirmDelete}
      >
        {toDelete && (
          <div className="rounded-xl bg-secondary px-3 py-2.5 text-sm">
            <div className="font-medium">{toDelete.date} · {categories.find((c) => c.id === toDelete.categoryId)?.name}</div>
            <div className="num-tabular text-muted-foreground">{formatMoney(toDelete.amount, currency)}</div>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}

function PageHeader({ periodName, onAdd }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview for {periodName}</p>
      </div>
      {onAdd && (
        <button onClick={onAdd} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add
        </button>
      )}
    </div>
  );
}