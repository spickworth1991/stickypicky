"use client";

import { useMemo, useState } from "react";
import { demoOwners, weeklyScores } from "@/lib/mockData";

const WEEKS = [3, 6, 12, "season"];

export default function LeaderboardDemo() {
  const [windowSel, setWindowSel] = useState(3);
  const [sortKey, setSortKey] = useState("total"); // total | name
  const [asc, setAsc] = useState(false);

  const rows = useMemo(() => {
    const weeks = windowSel === "season" ? weeklyScores.length : windowSel;
    const list = demoOwners.map((o) => {
      const recent = weeklyScores.slice(-weeks).reduce((sum, wk) => {
        return sum + (wk[o.id] ?? 0);
      }, 0);
      const total = weeklyScores.reduce((sum, wk) => sum + (wk[o.id] ?? 0), 0);
      return { ...o, recent, total };
    });

    const sorted = [...list].sort((a, b) => {
      if (sortKey === "name") {
        const c = a.name.localeCompare(b.name);
        return asc ? c : -c;
      }
      const diff = a[sortKey] - b[sortKey];
      return asc ? diff : -diff;
    });

    // stable global rank by total, name, then league
    const ranked = sorted.map((o, i) => ({ ...o, rank: i + 1 }));
    return ranked;
  }, [windowSel, sortKey, asc]);

  function toggleSort(key) {
    if (sortKey === key) setAsc((s) => !s);
    else {
      setSortKey(key);
      setAsc(false);
    }
  }

  return (
    <div className="rounded-2xl bg-zinc-900/40 border border-white/10 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex gap-2">
          {WEEKS.map((w) => (
            <button
              key={w}
              onClick={() => setWindowSel(w)}
              className={`px-3 py-2 rounded-xl border ${
                windowSel === w
                  ? "border-accent/60 bg-accent/10"
                  : "border-white/10 bg-black/40 hover:bg-black/60"
              }`}
            >
              {w === "season" ? "Season" : `Last ${w} wks`}
            </button>
          ))}
        </div>
        <div className="text-sm text-muted">
          Sort by{" "}
          <button
            onClick={() => toggleSort("total")}
            className={`underline underline-offset-4 ${
              sortKey === "total" ? "text-accent" : ""
            }`}
          >
            Total
          </button>{" "}
          ·{" "}
          <button
            onClick={() => toggleSort("name")}
            className={`underline underline-offset-4 ${
              sortKey === "name" ? "text-accent" : ""
            }`}
          >
            Name
          </button>{" "}
          ({asc ? "asc" : "desc"})
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-[640px] w-full">
          <thead>
            <tr className="text-left text-sm text-muted border-b border-white/10">
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">Owner</th>
              <th className="py-2 pr-4">League</th>
              <th className="py-2 pr-4">Recent</th>
              <th className="py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-white/5">
                <td className="py-2 pr-4">{r.rank}</td>
                <td className="py-2 pr-4">{r.name}</td>
                <td className="py-2 pr-4 opacity-80">{r.league}</td>
                <td className="py-2 pr-4">{r.recent.toFixed(1)}</td>
                <td className="py-2">{r.total.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-muted">
        * Demo data only. The production app caches weekly results, supports multiple
        seasons, and resolves owners across leagues with stable IDs.
      </p>
    </div>
  );
}
