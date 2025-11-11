"use client";

import { useEffect, useMemo, useState } from "react";
import LiveBadge from "@/components/LiveBadge";

function CodeTabs({ items }) {
  const [tab, setTab] = useState(items[0]?.key || "svg");
  const active = items.find((i) => i.key === tab);

  async function copy() {
    try {
      await navigator.clipboard.writeText(active?.code || "");
    } catch {}
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30">
      <div className="flex items-center justify-between px-3 pt-3">
        <div className="flex gap-1">
          {items.map((i) => (
            <button
              key={i.key}
              onClick={() => setTab(i.key)}
              className={`px-3 py-2 rounded-t-xl text-sm border-b-2 ${
                i.key === tab ? "border-accent text-white" : "border-transparent text-muted hover:text-white/80"
              }`}
            >
              {i.label}
            </button>
          ))}
        </div>
        <button
          onClick={copy}
          className="text-xs px-2 py-1 rounded-lg border border-white/10 bg-zinc-800 hover:bg-zinc-700"
        >
          Copy
        </button>
      </div>

      <pre className="p-3 overflow-x-auto text-xs leading-relaxed border-t border-white/10">
        <code>{active?.code || ""}</code>
      </pre>
    </div>
  );
}

export default function LiveBadgeShowcase() {
  const presets = useMemo(
    () => [
      { key: "views", label: "Views", color: "#22d3ee" },
      { key: "orders", label: "Orders", color: "#34d399" },
      { key: "signups", label: "Signups", color: "#a78bfa" },
    ],
    []
  );

  const [admin, setAdmin] = useState(false);

  async function bump(key, delta = 1) {
    await fetch("/api/badge", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, delta }),
    });
  }

  return (
    <div className="mt-8 space-y-8">
      {/* Demo row */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted">
          Live demo (polls the JSON API). Toggle demo admin mode to simulate traffic.
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={admin} onChange={(e) => setAdmin(e.target.checked)} />
          Demo Admin Mode
        </label>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {presets.map(({ key, label, color }) => (
          <div
            key={key}
            className="rounded-xl border border-white/10 bg-black/30 p-4 flex items-center justify-between"
          >
            <LiveBadge keyName={key} label={label} color={color} />
            {admin && (
              <div className="flex gap-2">
                <button
                  onClick={() => bump(key, 1)}
                  className="px-2 py-1 rounded bg-zinc-800 border border-white/10 hover:bg-zinc-700"
                >
                  +1
                </button>
                <button
                  onClick={() => bump(key, 10)}
                  className="px-2 py-1 rounded bg-zinc-800 border border-white/10 hover:bg-zinc-700"
                >
                  +10
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Code for each badge */}
      <div className="grid gap-6">
        {presets.map(({ key, label, color }) => {
          const svg = `<img src="/api/badge/svg?key=${key}&label=${encodeURIComponent(
            label
          )}&color=%23${color.replace("#", "")}" alt="${label}" />`;

          const vanilla = `<!-- Place this where you want the number to appear -->
<div>${label}: <span id="${key}Count">…</span></div>
<script>
  async function refresh${key.charAt(0).toUpperCase() + key.slice(1)}() {
    const res = await fetch("/api/badge", { cache: "no-store" });
    const { counts } = await res.json();
    document.getElementById("${key}Count").textContent =
      (counts.${key} ?? 0).toLocaleString();
  }
  refresh${key.charAt(0).toUpperCase() + key.slice(1)}();
  setInterval(refresh${key.charAt(0).toUpperCase() + key.slice(1)}, 5000);
</script>`;

          const react = `import LiveBadge from "@/components/LiveBadge";

export default function Badge_${key}() {
  return <LiveBadge keyName="${key}" label="${label}" color="${color}" />;
}`;

          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{label} — Exact Code</h3>
                <div className="text-xs text-muted">SVG • Vanilla JS • React</div>
              </div>
              <CodeTabs
                items={[
                  { key: "svg", label: "SVG Embed", code: svg },
                  { key: "js", label: "Vanilla JS (Fetch)", code: vanilla },
                  { key: "react", label: "React Component", code: react },
                ]}
              />
            </div>
          );
        })}
      </div>

      {/* Self-updating example (pageview tracker) */}
      <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Auto-Updating Example</h3>
          <img
            src="/api/badge/track?key=views"
            alt=""
            width={1}
            height={1}
            style={{ position: "absolute", left: -9999 }}
          />
            <img src="/api/badge/svg?key=views&label=Views&color=%2322d3ee" alt="Views" />
          <span className="text-xs text-muted">Counts a view on each page load.</span>
        </div>
        <div className="grid gap-2">
          <div className="text-sm text-muted">Drop this 1×1 pixel anywhere on a page:</div>
          <pre className="p-3 overflow-x-auto text-xs leading-relaxed rounded border border-white/10 bg-black/40">
          </pre>
          <div className="text-sm text-muted">
            Then embed the badge: 
          </div>
          <pre className="p-3 overflow-x-auto text-xs leading-relaxed rounded border border-white/10 bg-black/40">
            <code>{`<img src="/api/badge/svg?key=views&label=Views&color=%2322d3ee" alt="Views" />`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
