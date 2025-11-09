"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { SAMPLE_ROWS, SAMPLE_CSV, SAMPLE_JSON } from "@/lib/sampleData";
import { toCSV, toTSV } from "@/lib/tableExport";

/* ---------- helpers ---------- */
function detectDelimiter(text) {
  const counts = { ",": (text.match(/,/g) || []).length, "\t": (text.match(/\t/g) || []).length, ";": (text.match(/;/g) || []).length };
  return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0][0] || ",";
}
function parseCSV(text) {
  const delim = detectDelimiter(text);
  const rows = text.trim().split(/\r?\n/).map((r) => {
    const parts = []; let cur = ""; let inQuotes = false;
    for (let i=0;i<r.length;i++) {
      const ch = r[i];
      if (ch === '"' && r[i+1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQuotes = !inQuotes;
      else if (ch === delim && !inQuotes) { parts.push(cur); cur = ""; }
      else cur += ch;
    }
    parts.push(cur);
    return parts;
  });
  if (!rows.length) return { columns: [], data: [] };
  const columns = rows[0].map((h,i)=> (h?.trim() ? h.trim() : `col_${i+1}`));
  const data = rows.slice(1).map((r)=>{
    const o={}; columns.forEach((c,i)=> o[c] = r[i] ?? ""); return o;
  });
  return { columns, data };
}
function normalizeJSON(input) {
  let arr = [];
  if (Array.isArray(input)) arr = input;
  else if (input && typeof input === "object") {
    const firstArray = Object.values(input).find((v)=>Array.isArray(v));
    arr = Array.isArray(firstArray) ? firstArray : [];
  }
  const colSet = new Set(); arr.forEach((row)=> Object.keys(row||{}).forEach((k)=>colSet.add(k)));
  const columns = [...colSet];
  const data = arr.map((row)=> {
    const o={}; columns.forEach((c)=> o[c] = row?.[c] ?? ""); return o;
  });
  return { columns, data };
}
function stringifyJSON(columns, data) {
  const out = data.map((r)=> {
    const o={}; columns.forEach((c)=> o[c]=r[c]); return o;
  });
  return JSON.stringify(out, null, 2);
}
function download(filename, text, mime="text/plain;charset=utf-8") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
const PALETTE = ["#22d3ee","#a78bfa","#34d399","#f59e0b","#f472b6","#60a5fa","#eab308"];
const colorAt = (i)=> PALETTE[i % PALETTE.length];

/* ---------- component ---------- */
export default function DataWorkbench() {
  const fileRef = useRef(null);

  // seed with your consistent sample rows
  const [columns, setColumns] = useState(Object.keys(SAMPLE_ROWS[0]));
  const [data, setData] = useState(SAMPLE_ROWS);

  const [xKey, setXKey] = useState(columns[0]);
  const [yKeys, setYKeys] = useState(
    columns.filter((c)=> SAMPLE_ROWS.some((r)=> !isNaN(Number(r[c])))).slice(0,2)
  );
  const [chartType, setChartType] = useState("line"); // line | bar | area
  const [seriesColors, setSeriesColors] = useState(() => {
    const m={}; yKeys.forEach((k,i)=> m[k]=colorAt(i)); return m;
  });

  // filters
  const [q, setQ] = useState(""); // global
  const [colFilters, setColFilters] = useState({}); // {col: {mode, value|min|max}}

  // sorting
  const [sortKey, setSortKey] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  /* ---------- ingest ---------- */
  const onPickFile = useCallback(async (file) => {
    const text = await file.text();
    try {
      if (file.name.toLowerCase().endsWith(".json") || text.trim().startsWith("{") || text.trim().startsWith("[")) {
        const json = JSON.parse(text);
        const norm = normalizeJSON(json);
        if (!norm.columns.length) return alert("JSON must be an array of objects (or contain one).");
        setColumns(norm.columns);
        setData(norm.data);
        setXKey(norm.columns[0]);
        const nums = norm.columns.filter((c)=> norm.data.some((r)=> !isNaN(Number(r[c]))));
        setYKeys(nums.slice(0,2));
        const m={}; nums.forEach((k,i)=> m[k]=colorAt(i)); setSeriesColors(m);
        return;
      }
      // CSV/TSV
      const { columns: cols, data: rows } = parseCSV(text);
      if (!cols.length) return alert("No columns found in CSV/TSV.");
      setColumns(cols);
      setData(rows);
      setXKey(cols[0]);
      const nums = cols.filter((c)=> rows.some((r)=> !isNaN(Number(r[c]))));
      setYKeys(nums.slice(0,2));
      const m={}; nums.forEach((k,i)=> m[k]=colorAt(i)); setSeriesColors(m);
    } catch (e) {
      console.error(e); alert("Failed to parse file.");
    }
  }, []);

  // paste import (JSON or CSV/TSV)
  const onPaste = useCallback((e) => {
    const text = e.clipboardData?.getData("text/plain"); if (!text) return;
    try {
      const j = JSON.parse(text); const norm = normalizeJSON(j);
      if (norm.columns.length) {
        setColumns(norm.columns); setData(norm.data);
        setXKey(norm.columns[0]);
        const nums = norm.columns.filter((c)=> norm.data.some((r)=> !isNaN(Number(r[c]))));
        setYKeys(nums.slice(0,2));
        const m={}; nums.forEach((k,i)=> m[k]=colorAt(i)); setSeriesColors(m);
        return;
      }
    } catch {}
    const { columns: cols, data: rows } = parseCSV(text);
    if (cols.length) {
      setColumns(cols); setData(rows); setXKey(cols[0]);
      const nums = cols.filter((c)=> rows.some((r)=> !isNaN(Number(r[c]))));
      setYKeys(nums.slice(0,2)); const m={}; nums.forEach((k,i)=> m[k]=colorAt(i)); setSeriesColors(m);
    }
  }, []);

  /* ---------- editing ---------- */
  function addRow() {
    const empty={}; columns.forEach((c)=> empty[c]=""); setData((d)=> [...d, empty]);
  }
  function addColumn() {
    const name = prompt("New column name:"); if (!name) return;
    if (columns.includes(name)) return alert("Column exists.");
    setColumns((cols)=> [...cols, name]);
    setData((rows)=> rows.map((r)=> ({ ...r, [name]: "" })));
  }
  function removeRow(idx) {
    setData((rows)=> rows.filter((_,i)=> i!==idx));
  }
  function removeColumn(col) {
    if (!confirm(`Remove column "${col}"?`)) return;
    setColumns((cols)=> cols.filter((c)=> c!==col));
    setData((rows)=> rows.map(({[col]:_, ...rest})=> rest));
    if (xKey === col) setXKey(columns.find((c)=> c!==col) || "");
    if (yKeys.includes(col)) setYKeys((ys)=> ys.filter((y)=> y!==col));
  }
  function updateCell(rIdx, col, val) {
    setData((rows)=> {
      const next=[...rows]; next[rIdx] = { ...next[rIdx], [col]: val }; return next;
    });
  }

  /* ---------- filtering ---------- */
  const filtered = useMemo(()=> {
    const gf = q.trim().toLowerCase();
    return data.filter((row)=> {
      if (gf) {
        const hit = columns.some((c)=> String(row[c] ?? "").toLowerCase().includes(gf));
        if (!hit) return false;
      }
      for (const [col, cfg] of Object.entries(colFilters)) {
        if (!cfg) continue;
        const raw = row[col];
        if (cfg.mode === "contains") {
          const needle = (cfg.value ?? "").toLowerCase();
          if (needle && !String(raw ?? "").toLowerCase().includes(needle)) return false;
        }
        if (cfg.mode === "equals") {
          if (cfg.value !== "" && String(raw ?? "") !== String(cfg.value)) return false;
        }
        if (cfg.mode === "range") {
          const v = Number(raw);
          const minOk = cfg.min === "" || (!isNaN(Number(cfg.min)) && v >= Number(cfg.min));
          const maxOk = cfg.max === "" || (!isNaN(Number(cfg.max)) && v <= Number(cfg.max));
          if (!(minOk && maxOk)) return false;
        }
      }
      return true;
    });
  }, [data, columns, q, colFilters]);

  /* ---------- sorting ---------- */
  const viewRows = useMemo(()=> {
    if (!sortKey) return filtered;
    const copy=[...filtered];
    copy.sort((a,b)=> {
      const av = a[sortKey], bv = b[sortKey];
      const na = !isNaN(Number(av)), nb = !isNaN(Number(bv));
      if (na && nb) return sortAsc ? Number(av)-Number(bv) : Number(bv)-Number(av);
      return sortAsc
        ? String(av ?? "").localeCompare(String(bv ?? ""))
        : String(bv ?? "").localeCompare(String(av ?? ""));
    });
    return copy;
  }, [filtered, sortKey, sortAsc]);

  /* ---------- series ---------- */
  const numericCols = useMemo(()=> columns.filter((c)=> viewRows.some((r)=> !isNaN(Number(r[c])))), [columns, viewRows]);
  function toggleSeries(c) {
    setYKeys((ys)=> ys.includes(c) ? ys.filter((y)=> y!==c) : [...ys, c]);
    setSeriesColors((m)=> m[c] ? m : { ...m, [c]: colorAt(Object.keys(m).length) });
  }

  /* ---------- export ---------- */
  function exportCSV(){ download("export.csv", toCSV(columns, viewRows), "text/csv;charset=utf-8"); }
  function exportJSON(){ download("export.json", stringifyJSON(columns, viewRows), "application/json"); }
  function exportTSV(){ download("export.tsv", toTSV(viewRows), "text/tab-separated-values;charset=utf-8"); }

  /* ---------- UI ---------- */
  return (
    <div onPaste={onPaste} className="space-y-4">
      {/* top controls — compact */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.tsv,.json,application/json,text/csv,text/tab-separated-values"
          onChange={(e)=> e.target.files?.[0] && onPickFile(e.target.files[0])}
          className="hidden"
        />
        <button className="px-3 py-2 rounded-xl border border-white/10 bg-accent/20 hover:bg-accent/30"
                onClick={()=> fileRef.current?.click()}>
          Upload CSV / JSON / TSV
        </button>

        <button className="px-3 py-2 rounded-xl border border-white/10 bg-zinc-900 hover:bg-zinc-800"
                onClick={()=> { // load sample CSV string
                  const { columns: cols, data: rows } = parseCSV(SAMPLE_CSV);
                  setColumns(cols); setData(rows); setXKey(cols[0]);
                  const nums = cols.filter((c)=> rows.some((r)=> !isNaN(Number(r[c]))));
                  setYKeys(nums.slice(0,2)); const m={}; nums.forEach((k,i)=> m[k]=colorAt(i)); setSeriesColors(m);
                }}>
          Load Sample CSV
        </button>

        <button className="px-3 py-2 rounded-xl border border-white/10 bg-zinc-900 hover:bg-zinc-800"
                onClick={()=> { // load sample JSON array
                  const norm = normalizeJSON(JSON.parse(SAMPLE_JSON));
                  setColumns(norm.columns); setData(norm.data); setXKey(norm.columns[0]);
                  const nums = norm.columns.filter((c)=> norm.data.some((r)=> !isNaN(Number(r[c]))));
                  setYKeys(nums.slice(0,2)); const m={}; nums.forEach((k,i)=> m[k]=colorAt(i)); setSeriesColors(m);
                }}>
          Load Sample JSON
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <input
            className="px-3 py-2 rounded-xl bg-black/40 border border-white/10"
            placeholder="Search all…"
            value={q}
            onChange={(e)=> setQ(e.target.value)}
          />
          <button className="px-3 py-2 rounded-xl border border-white/10 bg-zinc-900 hover:bg-zinc-800" onClick={exportCSV}>CSV</button>
          <button className="px-3 py-2 rounded-xl border border-white/10 bg-zinc-900 hover:bg-zinc-800" onClick={exportJSON}>JSON</button>
          <button className="px-3 py-2 rounded-xl border border-white/10 bg-zinc-900 hover:bg-zinc-800" onClick={exportTSV}>TSV</button>
        </div>
      </div>

      {/* axis & series (tight row) */}
      <div className="rounded-xl border border-white/10 bg-black/30 p-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm">X</span>
          <select className="px-3 py-2 rounded-xl bg-black/40 border border-white/10"
                  value={xKey} onChange={(e)=> setXKey(e.target.value)}>
            {columns.map((c)=> <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm">Y</span>
          {numericCols.length ? numericCols.map((c, i)=> {
            const active = yKeys.includes(c);
            return (
              <label key={c} className={`flex items-center gap-2 rounded-md border px-2 py-1 ${active ? "border-accent/60 bg-accent/10" : "border-white/10 bg-black/40"}`}>
                <input type="checkbox" checked={active} onChange={()=> toggleSeries(c)} />
                <span className="text-sm">{c}</span>
                {active && (
                  <input
                    type="color"
                    value={seriesColors[c] || colorAt(i)}
                    onChange={(e)=> setSeriesColors((m)=> ({ ...m, [c]: e.target.value }))}
                    className="h-5 w-8 rounded border border-white/20"
                    title={`Color for ${c}`}
                  />
                )}
              </label>
            );
          }) : <span className="text-xs text-muted">No numeric columns.</span>}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm">Chart</span>
          <select className="px-3 py-2 rounded-xl bg-black/40 border border-white/10"
                  value={chartType} onChange={(e)=> setChartType(e.target.value)}>
            <option value="line">Line</option>
            <option value="bar">Bar</option>
            <option value="area">Area</option>
          </select>
        </div>
      </div>

      {/* per-column filters (compact chips) */}
      <div className="rounded-xl border border-white/10 bg-black/30 p-3 overflow-x-auto">
        <div className="flex flex-wrap gap-2 items-center">
          {columns.map((c)=> {
            const isNumeric = viewRows.some((r)=> !isNaN(Number(r[c])));
            const cfg = colFilters[c] || { mode: isNumeric ? "range" : "contains", value: "", min: "", max: "" };
            return (
              <div key={c} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-2 py-1">
                <span className="text-xs">{c}</span>
                <select
                  className="px-2 py-1 text-xs bg-transparent border border-white/10 rounded"
                  value={cfg.mode}
                  onChange={(e)=> setColFilters((f)=> ({ ...f, [c]: { ...cfg, mode: e.target.value } }))}
                >
                  <option value="contains">contains</option>
                  <option value="equals">equals</option>
                  <option value="range">range</option>
                </select>
                {cfg.mode === "range" ? (
                  <>
                    <input className="px-2 py-1 w-20 text-xs bg-transparent border border-white/10 rounded"
                           placeholder="min" value={cfg.min ?? ""}
                           onChange={(e)=> setColFilters((f)=> ({ ...f, [c]: { ...cfg, min: e.target.value } }))}/>
                    <input className="px-2 py-1 w-20 text-xs bg-transparent border border-white/10 rounded"
                           placeholder="max" value={cfg.max ?? ""}
                           onChange={(e)=> setColFilters((f)=> ({ ...f, [c]: { ...cfg, max: e.target.value } }))}/>
                  </>
                ) : (
                  <input className="px-2 py-1 w-28 text-xs bg-transparent border border-white/10 rounded"
                         placeholder={cfg.mode === "equals" ? "equals…" : "contains…"}
                         value={cfg.value ?? ""}
                         onChange={(e)=> setColFilters((f)=> ({ ...f, [c]: { ...cfg, value: e.target.value } }))}/>
                )}
                <button className="text-xs opacity-70 hover:opacity-100" onClick={()=> setColFilters((f)=> ({ ...f, [c]: undefined }))}>✕</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* chart — give explicit height + min-w-0 */}
      <div className="rounded-xl border border-white/10 bg-black/30 p-3 min-w-0">
        <div className="h-[360px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={viewRows}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2}/>
                <XAxis dataKey={xKey}/><YAxis/><Tooltip/><Legend/>
                {yKeys.map((k,i)=> <Line key={k} type="monotone" dataKey={k} dot={false} strokeWidth={2} stroke={seriesColors[k] || colorAt(i)} />)}
              </LineChart>
            ) : chartType === "bar" ? (
              <BarChart data={viewRows}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2}/>
                <XAxis dataKey={xKey}/><YAxis/><Tooltip/><Legend/>
                {yKeys.map((k,i)=> <Bar key={k} dataKey={k} fill={seriesColors[k] || colorAt(i)} />)}
              </BarChart>
            ) : (
              <AreaChart data={viewRows}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2}/>
                <XAxis dataKey={xKey}/><YAxis/><Tooltip/><Legend/>
                {yKeys.map((k,i)=> <Area key={k} type="monotone" dataKey={k} stroke={seriesColors[k] || colorAt(i)} fill={seriesColors[k] || colorAt(i)} />)}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* editable table */}
      <div className="rounded-xl overflow-x-auto border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-950">
            <tr>
              {columns.map((c)=> (
                <th key={c} className="px-3 py-2 text-left font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      className="hover:underline underline-offset-4"
                      onClick={()=> {
                        if (sortKey === c) setSortAsc((s)=> !s);
                        else { setSortKey(c); setSortAsc(true); }
                      }}
                      title="Sort"
                    >
                      {c}{sortKey===c ? (sortAsc ? " ▲" : " ▼") : ""}
                    </button>
                    <button className="text-xs text-zinc-400 hover:text-red-400" onClick={()=> removeColumn(c)}>
                      remove
                    </button>
                  </div>
                </th>
              ))}
              <th className="px-3 py-2 text-left font-medium text-zinc-400">actions</th>
            </tr>
          </thead>
          <tbody>
            {viewRows.map((row, ridx)=> {
              const actualIndex = data.indexOf(row); // keep edits in sync with main data
              return (
                <tr key={ridx} className="odd:bg-zinc-900/40">
                  {columns.map((c)=> (
                    <td key={c} className="px-3 py-1.5">
                      <input
                        className="w-full px-2 py-1 rounded bg-black/40 border border-white/10"
                        value={String(row[c] ?? "")}
                        onChange={(e)=> updateCell(actualIndex, c, e.target.value)}
                      />
                    </td>
                  ))}
                  <td className="px-3 py-1.5">
                    <button className="px-2 py-1 text-xs rounded bg-red-500/20 border border-red-500/40 hover:bg-red-500/30"
                            onClick={()=> removeRow(actualIndex)}>
                      delete row
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="p-3 bg-zinc-950 border-t border-white/10 flex justify-between">
          <span className="text-xs text-muted">Rows: {viewRows.length}/{data.length} • Columns: {columns.length}</span>
          <div className="flex gap-2">
            <button className="px-3 py-2 rounded-xl border border-white/10 bg-zinc-900 hover:bg-zinc-800" onClick={addRow}>+ Row</button>
            <button className="px-3 py-2 rounded-xl border border-white/10 bg-zinc-900 hover:bg-zinc-800" onClick={addColumn}>+ Column</button>
          </div>
        </div>
      </div>
    </div>
  );
}
