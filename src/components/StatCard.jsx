import React from "react";
import { cn } from "@/lib/utils";

// DSH-04: negative values show a minus sign and distinct style; color is never the only signal.
export default function StatCard({ label, value, sublabel, tone = "neutral", icon: Icon, accent }) {
  const toneStyles = {
    neutral: "text-foreground",
    income: "text-foreground",
    expense: "text-foreground",
    balance: "text-foreground",
  };
  const isNegative = typeof value === "string" ? value.trim().startsWith("-") : value < 0;

  return (
    <div className="card-soft card-hover relative overflow-hidden p-5">
      {accent && (
        <div className="absolute right-0 top-0 h-20 w-20 -translate-y-6 translate-x-6 rounded-full opacity-[0.07]" style={{ background: accent }} />
      )}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className={cn("mt-3 font-display text-2xl font-semibold tracking-tight num-tabular sm:text-[28px]", toneStyles[tone], isNegative && "text-destructive")}>
        {value}
      </div>
      {sublabel && <div className="mt-1 text-xs text-muted-foreground">{sublabel}</div>}
    </div>
  );
}