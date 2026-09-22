import React from "react";
import { useApp } from "@/lib/store";
import { usePeriod } from "@/lib/period";
import { useToday } from "@/hooks/use-today";
import { periodTotals, spendingByCategory, spendingTrend, inPeriod, isCounted } from "@/lib/calc";
import { formatMoney, formatMonthLabel } from "@/lib/format";
import { STRINGS } from "@/lib/strings";
import PeriodPicker from "@/components/PeriodPicker";
import CategoryDonut from "@/components/charts/CategoryDonut";
import IncomeExpenseBar from "@/components/charts/IncomeExpenseBar";
import SpendingTrend from "@/components/charts/SpendingTrend";
import EmptyState from "@/components/EmptyState";
import { BarChart3, PieChart, Activity } from "lucide-react";

export default function Reports() {
  const { transactions, categories, settings } = useApp();
  const { period } = usePeriod();
  const today = useToday();
  const currency = settings.currency;

  const totals = periodTotals(transactions, period, today);
  const catData = spendingByCategory(transactions, period, categories, today);
  const trend = spendingTrend(transactions, period, today);
  const periodName = period.type === "year" ? String(period.year) : formatMonthLabel(period.year, period.month);

  const hasCounted = transactions.some((t) => isCounted(t, today) && inPeriod(t, period));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{STRINGS.reports.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{periodName}</p>
        </div>
      </div>

      <div className="mt-5">
        <PeriodPicker />
      </div>

      {/* RPT-08 empty state */}
      {!hasCounted ? (
        <div className="card-soft mt-6">
          <EmptyState
            icon={BarChart3}
            title={STRINGS.reports.noCountedTitle}
            description={STRINGS.reports.noCountedBody}
          />
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {/* Summary strip */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MiniStat label={STRINGS.reports.totalSpending} value={formatMoney(totals.expense, currency)} />
            <MiniStat label={STRINGS.reports.totalIncome} value={formatMoney(totals.income, currency)} />
            <MiniStat label={STRINGS.reports.net} value={formatMoney(totals.net, currency)} />
            <MiniStat label={STRINGS.reports.categoriesUsed} value={String(catData.rows.length)} />
          </div>

          {/* RPT-01 spending by category */}
          <Section icon={PieChart} title={STRINGS.reports.spendingByCategory}>
            {catData.rows.length ? (
              <CategoryDonut rows={catData.rows} currency={currency} />
            ) : (
              <p className="text-sm text-muted-foreground">{STRINGS.reports.noExpenses}</p>
            )}
          </Section>

          {/* RPT-04 income vs expenses */}
          <Section icon={BarChart3} title={STRINGS.reports.incomeVsExpenses}>
            <IncomeExpenseBar income={totals.income} expense={totals.expense} currency={currency} />
          </Section>

          {/* RPT-05 spending trend */}
          <Section icon={Activity} title={STRINGS.reports.spendingTrend(period.type)}>
            <SpendingTrend points={trend} currency={currency} />
          </Section>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="card-soft p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl font-semibold num-tabular">{value}</div>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="card-soft p-5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}