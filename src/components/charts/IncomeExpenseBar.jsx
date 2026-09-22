import React from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Cell } from "recharts";
import { formatMoney } from "@/lib/format";

// RPT-04: income vs expenses for the period.
export default function IncomeExpenseBar({ income, expense, currency }) {
  const data = [
    { name: "Income", value: income, fill: "hsl(152 40% 30%)" },
    { name: "Expenses", value: expense, fill: "hsl(4 60% 48%)" },
  ];

  return (
    <div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tickFormatter={(v) => formatMoney(v, currency).replace(/\.\d+$/, "")} tickLine={false} axisLine={false} width={70} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip formatter={(v) => formatMoney(v, currency)} cursor={{ fill: "hsl(var(--muted))" }} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 13 }} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={64}>
              {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* RPT-07 text alternative */}
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-income-soft/60 px-3 py-2">
          <div className="text-xs text-muted-foreground">Income</div>
          <div className="num-tabular font-semibold text-income">{formatMoney(income, currency)}</div>
        </div>
        <div className="rounded-xl bg-expense-soft/60 px-3 py-2">
          <div className="text-xs text-muted-foreground">Expenses</div>
          <div className="num-tabular font-semibold text-expense">{formatMoney(expense, currency)}</div>
        </div>
      </div>
    </div>
  );
}