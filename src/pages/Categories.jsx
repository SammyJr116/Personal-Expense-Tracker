import React, { useState } from "react";
import { useApp } from "@/lib/store";
import { countForCategory } from "@/lib/calc";
import { useToast } from "@/components/ui/use-toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Trash2, Check, X, Lock, ArrowDownLeft, ArrowUpRight } from "lucide-react";

// CAT-01..CAT-10: category management. Income fixed; custom expense categories add/rename/delete.
export default function Categories() {
  const { categories, transactions, addCategory, renameCategory, deleteCategory } = useApp();
  const { toast } = useToast();

  const [newName, setNewName] = useState("");
  const [newError, setNewError] = useState("");
  const [renameId, setRenameId] = useState(null);
  const [renameVal, setRenameVal] = useState("");
  const [renameError, setRenameError] = useState("");
  const [toDelete, setToDelete] = useState(null);

  const expenseCats = categories.filter((c) => c.type === "expense");
  const incomeCats = categories.filter((c) => c.type === "income");

  const handleAdd = (e) => {
    e.preventDefault();
    setNewError("");
    const res = addCategory(newName);
    if (res.error) { setNewError(res.error); return; }
    setNewName("");
    toast({ title: "Category added" });
  };

  const startRename = (c) => { setRenameId(c.id); setRenameVal(c.name); setRenameError(""); };
  const saveRename = () => {
    const res = renameCategory(renameId, renameVal);
    if (res.error) { setRenameError(res.error); return; }
    setRenameId(null);
    toast({ title: "Category renamed" });
  };

  const confirmDelete = () => {
    const count = countForCategory(transactions, toDelete.id);
    deleteCategory(toDelete.id);
    toast({ title: "Category deleted", description: `${count} transaction${count !== 1 ? "s" : ""} moved to Other.` });
    setToDelete(null);
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Categories</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage your expense categories. Income categories are fixed.</p>

      {/* Add custom expense category — CAT-03 */}
      <form onSubmit={handleAdd} className="mt-6 card-soft p-5">
        <h2 className="font-display text-lg font-semibold">Add expense category</h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            maxLength={30}
            placeholder="e.g. Pets, Subscriptions…"
            className={cn("flex-1 rounded-xl border bg-card px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-primary/15", newError ? "border-destructive" : "border-border focus:border-primary")}
          />
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        {newError && <p className="mt-1.5 text-xs text-destructive">{newError}</p>}
        <p className="mt-1.5 text-xs text-muted-foreground">Up to 30 characters, unique among your expense categories.</p>
      </form>

      {/* Expense categories */}
      <div className="mt-6">
        <div className="flex items-center gap-2 px-1">
          <ArrowUpRight className="h-4 w-4 text-expense" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Expense</h2>
        </div>
        <div className="mt-2 card-soft divide-y divide-border/50">
          {expenseCats.map((c) => {
            const count = countForCategory(transactions, c.id);
            const renaming = renameId === c.id;
            return (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  {renaming ? (
                    <input
                      autoFocus
                      value={renameVal}
                      maxLength={30}
                      onChange={(e) => setRenameVal(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveRename()}
                      className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm outline-none focus:border-primary"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{c.name}</span>
                      {c.isPredefined && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                          <Lock className="h-2.5 w-2.5" /> Built-in
                        </span>
                      )}
                    </div>
                  )}
                  {renameError && renaming && <p className="text-xs text-destructive">{renameError}</p>}
                  <div className="text-xs text-muted-foreground">{count} transaction{count !== 1 ? "s" : ""}</div>
                </div>
                {renaming ? (
                  <div className="flex gap-1">
                    <button onClick={saveRename} className="rounded-lg p-1.5 text-primary hover:bg-secondary" aria-label="Save"><Check className="h-4 w-4" /></button>
                    <button onClick={() => setRenameId(null)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary" aria-label="Cancel"><X className="h-4 w-4" /></button>
                  </div>
                ) : !c.isPredefined ? (
                  <div className="flex gap-1">
                    <button onClick={() => startRename(c)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Rename"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setToDelete(c)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Income categories — fixed (CAT-02) */}
      <div className="mt-6">
        <div className="flex items-center gap-2 px-1">
          <ArrowDownLeft className="h-4 w-4 text-income" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Income</h2>
          <span className="text-xs text-muted-foreground">— fixed list, cannot be changed</span>
        </div>
        <div className="mt-2 card-soft divide-y divide-border/50">
          {incomeCats.map((c) => {
            const count = countForCategory(transactions, c.id);
            return (
              <div key={c.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex-1 text-sm font-medium">{c.name}</span>
                <span className="text-xs text-muted-foreground">{count} transaction{count !== 1 ? "s" : ""}</span>
                <Lock className="h-3.5 w-3.5 text-muted-foreground/50" />
              </div>
            );
          })}
        </div>
      </div>

      {/* CAT-07: delete confirmation with count */}
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete this category?"
        destructive
        confirmLabel="Delete & move to Other"
        onConfirm={confirmDelete}
      >
        {toDelete && (
          <div className="rounded-xl bg-secondary px-3 py-2.5 text-sm">
            <div className="font-medium">{toDelete.name}</div>
            <div>{countForCategory(transactions, toDelete.id)} transaction{countForCategory(transactions, toDelete.id) !== 1 ? "s" : ""} will be moved to Other.</div>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}