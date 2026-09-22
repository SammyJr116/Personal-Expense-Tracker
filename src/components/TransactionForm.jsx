import React, { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/store";
import { useToast } from "@/components/ui/use-toast";
import { todayStr } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight, Check, Plus } from "lucide-react";

// TXN-01..TXN-13: Add/Edit transaction. Validation per TXN-03.
// TXN-02: category choices depend on type.
// TXN-06: Save + Save and add another.
// TXN-08: no duplicate on double submit.
const MAX_AMOUNT = 999999999.99;

export default function TransactionForm({ open, onOpenChange, editing }) {
  const { categories, addTransaction, updateTransaction } = useApp();
  const { toast } = useToast();

  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(todayStr());
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Pre-fill on edit or reset on open
  useEffect(() => {
    if (!open) return;
    if (editing) {
      setType(editing.type);
      setAmount((editing.amount / 100).toFixed(2));
      setCategoryId(editing.categoryId);
      setDate(editing.date);
      setNote(editing.note || "");
    } else {
      setType("expense");
      setAmount("");
      setCategoryId("");
      setDate(todayStr());
      setNote("");
    }
    setErrors({});
  }, [open, editing]);

  // TXN-02 / TXN-11: when type changes, reset category if invalid for the type
  const availableCats = categories.filter((c) => c.type === type);
  useEffect(() => {
    if (categoryId && !availableCats.some((c) => c.id === categoryId)) {
      setCategoryId("");
    }
  }, [type]);  

  const validate = () => {
    const e = {};
    if (!type) e.type = "Choose a type.";
    const amtStr = String(amount).trim();
    if (!amtStr) e.amount = "Amount is required.";
    else if (!/^\d+(\.\d{1,2})?$/.test(amtStr)) e.amount = "Enter a number with up to 2 decimals.";
    else {
      const n = parseFloat(amtStr);
      if (!(n > 0)) e.amount = "Amount must be greater than zero.";
      else if (n > MAX_AMOUNT) e.amount = "Amount is too large.";
    }
    if (!categoryId) e.category = "Choose a category.";
    if (!date) e.date = "Date is required.";
    if (note.length > 100) e.note = "Note must be 100 characters or fewer.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildPayload = () => ({
    type,
    amount: parseFloat(String(amount).trim()),
    categoryId,
    date,
    note,
  });

  const handleSave = (addAnother) => {
    if (saving) return; // TXN-08
    if (!validate()) return;
    setSaving(true);
    try {
      if (editing) {
        updateTransaction(editing.id, buildPayload());
        toast({ title: "Transaction updated", description: "Totals and charts refreshed." });
        onOpenChange(false);
      } else {
        addTransaction(buildPayload());
        if (addAnother) {
          setAmount("");
          setCategoryId("");
          setNote("");
          toast({ title: "Transaction saved", description: "Add another below." });
        } else {
          toast({ title: "Transaction saved", description: "It now appears in your dashboard." });
          onOpenChange(false);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit transaction" : "Add transaction"}</DialogTitle>
        </DialogHeader>

        {/* Type toggle — UXD-09 not color alone */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition",
              type === "expense" ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            <ArrowUpRight className="h-4 w-4" /> Expense
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition",
              type === "income" ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            <ArrowDownLeft className="h-4 w-4" /> Income
          </button>
        </div>
        {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}

        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={cn("num-tabular", errors.amount && "border-destructive")}
          />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <div className="flex flex-wrap gap-2">
            {availableCats.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(c.id)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm transition",
                  categoryId === c.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground/80 hover:border-foreground/40"
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
          {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={errors.date && "border-destructive"}
          />
          {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="note">Note <span className="text-muted-foreground">(optional)</span></Label>
          <Textarea
            id="note"
            rows={2}
            maxLength={100}
            placeholder="Add a short note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={errors.note && "border-destructive"}
          />
          <div className="text-right text-[11px] text-muted-foreground">{note.length}/100</div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <div className="flex w-full gap-2">
            <Button onClick={() => handleSave(false)} disabled={saving} className="flex-1">
              <Check className="h-4 w-4" /> {editing ? "Save changes" : "Save"}
            </Button>
            {!editing && (
              <Button variant="outline" onClick={() => handleSave(true)} disabled={saving} className="flex-1">
                <Plus className="h-4 w-4" /> Save & add another
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}