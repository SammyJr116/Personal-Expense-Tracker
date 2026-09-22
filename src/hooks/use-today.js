import { useEffect, useState } from "react";
import { todayStr } from "@/lib/format";

// UPC-05: returns today's YYYY-MM-DD and re-evaluates at midnight and when the
// tab regains focus, so "counted vs upcoming" never goes stale while open.
export function useToday() {
  const [today, setToday] = useState(() => todayStr());

  useEffect(() => {
    const refresh = () => setToday(todayStr());
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);

    let timer;
    const arm = () => {
      clearTimeout(timer);
      const now = new Date();
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
      timer = setTimeout(() => {
        refresh();
        arm();
      }, nextMidnight.getTime() - now.getTime());
    };
    arm();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return today;
}