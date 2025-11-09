function safeCell(v) {
  const s = String(v ?? "");
  const needs = /[",\n]/.test(s);
  return needs ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCSV(rows) {
  if (!rows || !rows.length) return "";
  const cols = Array.from(rows.reduce((acc, r) => { Object.keys(r).forEach((k)=>acc.add(k)); return acc; }, new Set()));
  const header = cols.join(",");
  const lines = rows.map(r => cols.map(c => safeCell(r[c])).join(","));
  return [header, ...lines].join("\n");
}

export function toTSV(rows) {
  if (!rows || !rows.length) return "";
  const cols = Array.from(rows.reduce((acc, r) => { Object.keys(r).forEach((k)=>acc.add(k)); return acc; }, new Set()));
  const header = cols.join("\t");
  const lines = rows.map(r => cols.map(c => String(r[c] ?? "")).join("\t"));
  return [header, ...lines].join("\n");
}
