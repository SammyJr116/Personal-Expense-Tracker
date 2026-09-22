import React from "react";
import { formatMoney, relativeDate } from "@/lib/format";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Clock, Pencil, Trash2 } from "lucide-react";

// LST-01: date, type, category, note, amount. UPC-04 upcoming badge.
// UXD-09: income/expense never distinguished by color alone (icon + sign used).
export default function TransactionRow({ txn, onEdit, onDelete, compact }) {
  const { categories, settings } = useApp();
  const cat = categories.find((c) => c.id === txn.categoryId);
  const isIncome = txn.type === "income";
  const upcoming = txn.date > new Date().toISOString().slice(0, 10);

  return (
    <div className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-secondary/60">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          isIncome ? "bg-income-soft text-income" : "bg-expense-soft text-expense"
        )}
      >
        {isIncome ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{cat ? cat.name : "Uncategorised"}</span>
          {upcoming && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <Clock className="h-3 w-3" /> Upcoming
            </span>
          )}
        </div>
        <div className="truncate text-xs text-muted-foreground">
          {relativeDate(txn.date)}
          {txn.note ? ` · ${txn.note}` : ""}
        </div>
      </div>

      <div className={cn("num-tabular text-sm font-semibold", isIncome ? "text-income" : "text-foreground")}>
        {isIncome ? "+" : "−"}{formatMoney(txn.amount, settings.currency).replace(/^[+-]/, "")}
      </div>

      {!compact && (onEdit || onDelete) && (
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
          {onEdit && (
            <button onClick={() => onEdit(txn)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-background hover:text-foreground" aria-label="Edit">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(txn)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-background hover:text-destructive" aria-label="Delete">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}