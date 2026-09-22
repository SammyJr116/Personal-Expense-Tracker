import React from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { formatMoney } from "@/lib/format";

// RPT-05: spending trend — by day in Month view, by month in Year view.
export default function SpendingTrend({ points, currency }) {
  return (
    <div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(4 60% 48%)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="hsl(4 60% 48%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(152 40% 30%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(152 40% 30%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={20} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tickFormatter={(v) => formatMoney(v, currency).replace(/\.\d+$/, "")} tickLine={false} axisLine={false} width={70} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              formatter={(v, name) => [formatMoney(v, currency), name === "income" ? "Income" : "Expenses"]}
              cursor={{ stroke: "hsl(var(--border))" }}
              contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 13 }}
            />
            <Area type="monotone" dataKey="expense" stroke="hsl(4 60% 48%)" strokeWidth={2} fill="url(#expGrad)" />
            <Area type="monotone" dataKey="income" stroke="hsl(152 40% 30%)" strokeWidth={2} fill="url(#incGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* RPT-07 text alternative */}
      <details className="mt-2 text-xs text-muted-foreground">
        <summary className="cursor-pointer hover:text-foreground">View as table</summary>
        <div className="mt-2 max-h-40 overflow-auto scrollbar-thin">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-card">
              <tr><th className="py-1 font-medium">Period</th><th className="py-1 text-right font-medium">Income</th><th className="py-1 text-right font-medium">Expenses</th></tr>
            </thead>
            <tbody className="num-tabular">
              {points.map((p) => (
                <tr key={p.key} className="border-t border-border/50">
                  <td className="py-1">{p.label}</td>
                  <td className="py-1 text-right">{formatMoney(p.income, currency)}</td>
                  <td className="py-1 text-right">{formatMoney(p.expense, currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}