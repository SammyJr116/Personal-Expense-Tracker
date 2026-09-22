import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatMoney } from "@/lib/format";

// DSH-06 / RPT-03: spending by category donut.
const COLORS = ["hsl(152 34% 30%)", "hsl(28 58% 52%)", "hsl(42 70% 55%)", "hsl(200 45% 45%)", "hsl(320 45% 55%)", "hsl(170 40% 40%)", "hsl(12 55% 48%)", "hsl(260 40% 55%)"];

export default function CategoryDonut({ rows, currency }) {
  const data = rows.map((r, i) => ({ ...r, fill: COLORS[i % COLORS.length] }));
  const total = rows.reduce((a, r) => a + r.amount, 0);

  if (!rows.length) return null;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div className="relative h-44 w-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="amount" nameKey="name" innerRadius={56} outerRadius={80} paddingAngle={1.5} stroke="none">
              {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Pie>
            <Tooltip
              formatter={(v) => formatMoney(v, currency)}
              contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 13 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] text-muted-foreground">Total</span>
          <span className="font-display text-base font-semibold num-tabular">{formatMoney(total, currency)}</span>
        </div>
      </div>

      {/* RPT-07: text alternative listing the same data */}
      <ul className="flex-1 space-y-2 w-full">
        {data.map((d) => (
          <li key={d.id} className="flex items-center gap-2.5 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.fill }} />
            <span className="flex-1 truncate text-foreground/80">{d.name}</span>
            <span className="num-tabular text-muted-foreground">{Math.round(d.share * 100)}%</span>
            <span className="num-tabular w-20 text-right font-medium">{formatMoney(d.amount, currency)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}