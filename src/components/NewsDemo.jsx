"use client";

import { useEffect, useMemo, useState } from "react";
import { initialNewsItems } from "@/lib/mockData";

const STORAGE_KEY = "sp_news_demo_v1";

export default function NewsDemo() {
  // ✅ Lazy init: read once from localStorage (or seed), no setState inside effect
  const [items, setItems] = useState(() => {
    if (typeof window === "undefined") return initialNewsItems;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : initialNewsItems;
    } catch {
      return initialNewsItems;
    }
  });

  const [admin, setAdmin] = useState(false);
  const [filter, setFilter] = useState("all"); // all | blog | coupon
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({
    kind: "blog", // blog | coupon
    title: "",
    body: "",
    code: "",
    expiresAt: "",
  });

  // ✅ Only sync OUT to localStorage when items change
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  // Derived list
  const visible = useMemo(() => {
    const f = filter.toLowerCase();
    return items
      .filter((it) => (f === "all" ? true : it.kind === f))
      .filter((it) =>
        (it.title + " " + (it.body || "") + " " + (it.code || ""))
          .toLowerCase()
          .includes(q.toLowerCase())
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [items, filter, q]);

  function save(next) {
    setItems(next);
    // localStorage write is handled by the effect above
  }

  function resetAll() {
    save(initialNewsItems);
  }

  function remove(id) {
    save(items.filter((i) => i.id !== id));
  }

  function addDraft() {
    if (!draft.title.trim()) return;
    const now = new Date().toISOString();
    const entry = {
      id: crypto.randomUUID(),
      kind: draft.kind,
      title: draft.title.trim(),
      body: draft.body.trim(),
      code: draft.kind === "coupon" ? draft.code.trim().toUpperCase() : "",
      expiresAt:
        draft.kind === "coupon" && draft.expiresAt ? draft.expiresAt : null,
      createdAt: now,
    };
    save([entry, ...items]);
    setDraft({ kind: "blog", title: "", body: "", code: "", expiresAt: "" });
    setShowForm(false);
  }

  return (
    <div id="news-demo" className="rounded-2xl bg-zinc-900/40 border border-white/10 p-4 md:p-6">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterBtn active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </FilterBtn>
          <FilterBtn active={filter === "blog"} onClick={() => setFilter("blog")}>
            Blog
          </FilterBtn>
          <FilterBtn active={filter === "coupon"} onClick={() => setFilter("coupon")}>
            Coupons
          </FilterBtn>
        </div>

        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search posts or codes…"
            className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-accent transition"
          />
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/40 border border-white/10 cursor-pointer">
            <input
              type="checkbox"
              checked={admin}
              onChange={(e) => setAdmin(e.target.checked)}
            />
            <span className="text-sm">Demo Admin Mode</span>
          </label>
          {admin && (
            <button
              onClick={() => setShowForm(true)}
              className="px-3 py-2 rounded-xl bg-accent/20 hover:bg-accent/30 border border-accent/40"
            >
              + New
            </button>
          )}
          <button
            onClick={resetAll}
            className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/10"
            title="Restore seeded content"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((it) => (
          <article
            key={it.id}
            className="rounded-2xl border border-white/10 bg-black/40 p-4 flex flex-col"
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs px-2 py-1 rounded-full border ${
                  it.kind === "coupon"
                    ? "border-green-400/40 text-green-300"
                    : "border-blue-400/40 text-blue-300"
                }`}
              >
                {it.kind === "coupon" ? "Coupon" : "Blog"}
              </span>
              <time
                className="text-xs text-muted"
                dateTime={it.createdAt}
                title={new Date(it.createdAt).toLocaleString()}
              >
                {new Date(it.createdAt).toLocaleDateString()}
              </time>
            </div>

            <h3 className="mt-3 text-lg font-semibold">{it.title}</h3>
            {it.body && <p className="mt-2 text-sm text-muted">{it.body}</p>}

            {it.kind === "coupon" && (
              <div className="mt-3 rounded-xl bg-green-500/10 border border-green-500/30 p-3">
                <div className="text-sm opacity-80">Code</div>
                <div className="text-2xl font-mono tracking-wider">
                  {it.code || "SAVE10"}
                </div>
                {it.expiresAt && (
                  <div className="text-xs text-muted mt-1">
                    Expires: {new Date(it.expiresAt).toLocaleDateString()}
                  </div>
                )}
                <button
                  className="mt-3 text-sm underline underline-offset-4 hover:opacity-80"
                  onClick={() => navigator.clipboard.writeText(it.code || "")}
                >
                  Copy code
                </button>
              </div>
            )}

            {admin && (
              <button
                onClick={() => remove(it.id)}
                className="mt-4 self-end text-xs text-red-300 hover:text-red-200"
              >
                Delete
              </button>
            )}
          </article>
        ))}
      </div>

      {/* Compose modal */}
      {admin && showForm && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-white/10 p-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xl font-semibold">New Item</h4>
              <button onClick={() => setShowForm(false)} className="opacity-70 hover:opacity-100">
                ✕
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <div className="flex gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="kind"
                    checked={draft.kind === "blog"}
                    onChange={() => setDraft((d) => ({ ...d, kind: "blog" }))}
                  />
                  Blog
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="kind"
                    checked={draft.kind === "coupon"}
                    onChange={() => setDraft((d) => ({ ...d, kind: "coupon" }))}
                  />
                  Coupon
                </label>
              </div>

              <input
                className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-accent transition"
                placeholder="Title"
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              />
              <textarea
                rows={4}
                className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-accent transition"
                placeholder="Body (optional)"
                value={draft.body}
                onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              />

              {draft.kind === "coupon" && (
                <>
                  <input
                    className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-accent transition"
                    placeholder="Coupon code e.g. SAVE20"
                    value={draft.code}
                    onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value }))}
                  />
                  <input
                    type="date"
                    className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-accent transition"
                    value={draft.expiresAt}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, expiresAt: e.target.value }))
                    }
                  />
                </>
              )}

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={addDraft}
                  className="px-3 py-2 rounded-xl bg-accent/20 hover:bg-accent/30 border border-accent/40"
                >
                  Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterBtn({ active, children, ...rest }) {
  return (
    <button
      {...rest}
      className={`px-3 py-2 rounded-xl border transition ${
        active
          ? "border-accent/60 bg-accent/10"
          : "border-white/10 bg-black/40 hover:bg-black/60"
      }`}
    >
      {children}
    </button>
  );
}
