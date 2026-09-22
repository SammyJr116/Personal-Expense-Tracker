import React, { useState, useMemo } from "react";
import { useApp } from "@/lib/store";
import { usePeriod } from "@/lib/period";
import { isUpcoming, inPeriod } from "@/lib/calc";
import { formatMoney, formatDate } from "@/lib/format";
import TransactionRow from "@/components/TransactionRow";
import TransactionForm from "@/components/TransactionForm";
import ConfirmDialog from "@/components/ConfirmDialog";
import PeriodPicker from "@/components/PeriodPicker";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Search, ArrowDownUp, Plus, Inbox } from "lucide-react";

const PAGE = 50; // LST-04

export default function Transactions() {
  const { transactions, categories, settings, deleteTransaction } = useApp();
  const { period } = usePeriod();
  const { toast } = useToast();
  const currency = settings.currency;

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [allTime, setAllTime] = useState(false);
  const [sort, setSort] = useState({ key: "date", dir: "desc" });
  const [visible, setVisible] = useState(PAGE);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const filtered = useMemo(() => {
    let list = transactions;
    // Period filter (PER-04: All time available here)
    if (!allTime) list = list.filter((t) => inPeriod(t, period));
    // Type filter
    if (typeFilter !== "all") list = list.filter((t) => t.type === typeFilter);
    // Category filter
    if (catFilter !== "all") list = list.filter((t) => t.categoryId === catFilter);
    // Search (LST-10) — note or category name, case-insensitive
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((t) => {
        const cat = categories.find((c) => c.id === t.categoryId);
        return (t.note || "").toLowerCase().includes(q) || (cat?.name || "").toLowerCase().includes(q);
      });
    }
    // Sort (LST-02)
    list = [...list].sort((a, b) => {
      let cmp;
      if (sort.key === "amount") cmp = a.amount - b.amount;
      else cmp = a.date < b.date ? -1 : a.date > b.date ? 1 : a.createdAt - b.createdAt;
      return sort.dir === "desc" ? -cmp : cmp;
    });
    return list;
  }, [transactions, categories, period, allTime, typeFilter, catFilter, search, sort]);

  const shown = filtered.slice(0, visible);
  const upcomingTotal = filtered.filter(isUpcoming).reduce((a, t) => a + t.amount, 0);
  const hasActiveFilters = search || typeFilter !== "all" || catFilter !== "all" || !allTime;

  const clearFilters = () => {
    setSearch(""); setTypeFilter("all"); setCatFilter("all"); setAllTime(false);
  };

  const confirmDelete = () => {
    deleteTransaction(toDelete.id);
    toast({ title: "Transaction deleted" });
    setToDelete(null);
  };

  const toggleSort = (key) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "desc" ? "asc" : "desc" } : { key, dir: "desc" }));
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} record{filtered.length !== 1 ? "s" : ""}{allTime ? " · All time" : ""}</p>
        </div>
        <button onClick={() => { setEditing(null); setFormOpen(true); }} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <PeriodPicker allowAll allActive={allTime} onAll={(v) => setAllTime(v)} />
        {allTime && (
          <button onClick={() => setAllTime(false)} className="rounded-xl border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">
            Exit All time
          </button>
        )}
      </div>

      {/* Search + filters — LST-10..LST-15 */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search note or category…"
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary">
          <option value="all">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary">
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Desktop table header with sort — LST-02, LST-03 */}
      <div className="mt-5 hidden items-center gap-2 border-b border-border/60 px-3 pb-2 text-xs font-medium text-muted-foreground md:flex">
        <button onClick={() => toggleSort("date")} className={cn("flex items-center gap-1 hover:text-foreground", sort.key === "date" && "text-foreground")}>
          Date <ArrowDownUp className="h-3 w-3" /> {sort.key === "date" && (sort.dir === "desc" ? "↓" : "↑")}
        </button>
        <span className="flex-1" />
        <button onClick={() => toggleSort("amount")} className={cn("flex items-center gap-1 hover:text-foreground", sort.key === "amount" && "text-foreground")}>
          Amount <ArrowDownUp className="h-3 w-3" /> {sort.key === "amount" && (sort.dir === "desc" ? "↓" : "↑")}
        </button>
        <span className="w-[88px]" />
      </div>

      <div className="mt-1 md:mt-0">
        {shown.length ? (
          <div className="space-y-0.5">
            {shown.map((t) => (
              <TransactionRow key={t.id} txn={t} onEdit={(tx) => { setEditing(tx); setFormOpen(true); }} onDelete={(tx) => setToDelete(tx)} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={hasActiveFilters ? Search : Inbox}
            title={hasActiveFilters ? "No matching transactions" : "No transactions yet"}
            description={hasActiveFilters ? "Try adjusting your search or filters." : "Add your first transaction to get started."}
            actionLabel={hasActiveFilters ? "Clear filters" : "Add transaction"}
            onAction={hasActiveFilters ? clearFilters : () => { setEditing(null); setFormOpen(true); }}
          />
        )}
      </div>

      {/* LST-04 load more */}
      {visible < filtered.length && (
        <div className="mt-5 text-center">
          <button onClick={() => setVisible((v) => v + PAGE)} className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium transition hover:border-foreground/30">
            Load more ({filtered.length - visible} remaining)
          </button>
        </div>
      )}

      {/* LST-06 upcoming total — never added to balance */}
      {upcomingTotal > 0 && (
        <div className="mt-5 rounded-xl bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
          Upcoming in this view: <span className="num-tabular font-medium text-foreground">{formatMoney(upcomingTotal, currency)}</span> — not counted in your balance.
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
            <div className="font-medium">{formatDate(toDelete.date)} · {categories.find((c) => c.id === toDelete.categoryId)?.name}</div>
            <div className="num-tabular text-muted-foreground">{formatMoney(toDelete.amount, currency)}</div>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}