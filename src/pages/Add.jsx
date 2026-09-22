import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TransactionForm from "@/components/TransactionForm";
import { STRINGS } from "@/lib/strings";
import { Plus } from "lucide-react";

// NAV-01: Add Transaction area. Opens the form immediately.
export default function Add() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { setOpen(true); }, []);

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">{STRINGS.add.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{STRINGS.add.subtitle}</p>

      <div className="mt-8 card-soft p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-primary">
          <Plus className="h-6 w-6" />
        </div>
        <h2 className="mt-4 font-display text-lg font-semibold">{STRINGS.add.ready}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{STRINGS.add.readyBody}</p>
        <button onClick={() => setOpen(true)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
          <Plus className="h-4 w-4" /> {STRINGS.add.openForm}
        </button>
      </div>

      <TransactionForm
        open={open}
        onOpenChange={(o) => { setOpen(o); if (!o) navigate("/"); }}
        editing={null}
      />
    </div>
  );
}