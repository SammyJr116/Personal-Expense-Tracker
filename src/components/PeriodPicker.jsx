import React from "react";
import { usePeriod } from "@/lib/period";
import { formatMonthLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

// PER-01..PER-06: Month picker + full-year view. Shared period (PER-03).
// PER-05: users may select any month or year, including future ones.
export default function PeriodPicker({ allowAll = false, allActive, onAll }) {
  const { period, setMonth, setYear, setType } = usePeriod();

  const goPrev = () => {
    if (period.type === "month") {
      const d = new Date(period.year, period.month - 2, 1);
      setMonth(d.getFullYear(), d.getMonth() + 1);
    } else {
      setYear(period.year - 1);
    }
  };
  const goNext = () => {
    if (period.type === "month") {
      const d = new Date(period.year, period.month, 1);
      setMonth(d.getFullYear(), d.getMonth() + 1);
    } else {
      setYear(period.year + 1);
    }
  };

  const label =
    period.type === "year"
      ? String(period.year)
      : formatMonthLabel(period.year, period.month);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex rounded-xl border border-border bg-card p-0.5 shadow-sm">
        <button
          onClick={() => { if (allActive && onAll) onAll(false); setType("month"); }}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition",
            period.type === "month" && !allActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Month
        </button>
        <button
          onClick={() => { if (allActive && onAll) onAll(false); setType("year"); }}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition",
            period.type === "year" && !allActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Year
        </button>
      </div>

      {!allActive && (
        <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-1 py-1 shadow-sm">
          <button onClick={goPrev} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Previous period">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[120px] text-center text-sm font-medium num-tabular">{label}</span>
          <button onClick={goNext} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Next period">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {allowAll && (
        <button
          onClick={onAll}
          className={cn(
            "rounded-xl border px-3 py-1.5 text-sm font-medium transition",
            allActive ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          All time
        </button>
      )}
    </div>
  );
}