"use client";

import { useEffect, useRef, useState } from "react";

export default function LiveBadge({ keyName, label, color = "#22d3ee", pollMs = 5000 }) {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const prev = useRef(0);

  async function load() {
    try {
      const res = await fetch("/api/badge", { cache: "no-store" });
      const json = await res.json();
      const v = json?.counts?.[keyName] ?? 0;
      prev.current = value;
      setValue(v);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, pollMs);
    return () => clearInterval(id);
  }, [pollMs, keyName]);

  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-sm opacity-80">{label}</span>
      <span
        className="inline-flex items-center gap-1 rounded-full border px-3 py-1 font-mono"
        style={{ borderColor: color + "66", background: color + "14", color }}
        title={loading ? "Loading…" : String(value)}
      >
        <span
          className="inline-block h-2.5 w-2.5 rounded-full shadow-[0_0_10px]"
          style={{ backgroundColor: color, boxShadow: `0 0 16px ${color}66` }}
        />
        {loading ? "…" : value.toLocaleString()}
      </span>
    </div>
  );
}
