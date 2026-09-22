import React, { createContext, useContext, useState } from "react";
import { todayStr } from "./format";

// PER-01..PER-06: Month or Year, shared across Dashboard/Reports/Transactions (PER-03).
// Transactions list additionally offers "All time" (PER-04) — handled locally there.
const PeriodContext = createContext(null);

export function PeriodProvider({ children }) {
  const now = new Date();
  const [period, setPeriod] = useState({
    type: "month", // PER-02 default current month
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });

  const setMonth = (year, month) => setPeriod({ type: "month", year, month });
  const setYear = (year) => setPeriod({ type: "year", year });
  const setType = (type) => {
    if (type === "year") setPeriod((p) => ({ type: "year", year: p.year }));
    else setPeriod((p) => ({ type: "month", year: p.year, month: p.month || 1 }));
  };

  return (
    <PeriodContext.Provider value={{ period, setPeriod, setMonth, setYear, setType }}>
      {children}
    </PeriodContext.Provider>
  );
}

export const usePeriod = () => useContext(PeriodContext);