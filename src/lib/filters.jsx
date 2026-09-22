import React, { createContext, useContext, useState } from "react";

export const PAGE = 50; // LST-04

const FiltersContext = createContext(null);
export const useFilters = () => useContext(FiltersContext);

// LST-13: transaction-list filters persist while navigating within the app,
// but are deliberately not stored in the URL and reset on a full reload.
export function FiltersProvider({ children }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [allTime, setAllTime] = useState(false);
  const [sort, setSort] = useState({ key: "date", dir: "desc" });
  const [visible, setVisible] = useState(PAGE);

  const value = {
    search, setSearch,
    typeFilter, setTypeFilter,
    catFilter, setCatFilter,
    allTime, setAllTime,
    sort, setSort,
    visible, setVisible,
  };

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}