"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { getFilters, listNews } from "@/lib/newsData";

function useQueryState() {
  const sp = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const state = useMemo(
    () => ({
      q: sp.get("q") || "",
      category: sp.get("category") || "all",
      tag: sp.get("tag") || "all",
      preview: sp.get("preview") === "1",
    }),
    [sp]
  );

  function set(next) {
    const params = new URLSearchParams(sp.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "" || v === "all") params.delete(k);
      else params.set(k, String(v));
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return [state, set];
}

export default function NewsIndex({ limit, hidePreviewToggle = false }) {
  const [qs, setQs] = useQueryState();
  const { categories, tags } = getFilters();

  const itemsAll = listNews({
    query: qs.q,
    category: qs.category,
    tag: qs.tag,
    preview: qs.preview,
  });

  const items = typeof limit === "number" ? itemsAll.slice(0, limit) : itemsAll;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-2xl border border-white/10 bg-black/30 p-4 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex-1 flex gap-2">
          <input
            placeholder="Search…"
            className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-accent"
            defaultValue={qs.q}
            onChange={(e) => setQs({ q: e.target.value })}
          />
          <select
            className="px-3 py-2 rounded-xl bg-black/40 border border-white/10"
            value={qs.category}
            onChange={(e) => setQs({ category: e.target.value })}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className="px-3 py-2 rounded-xl bg-black/40 border border-white/10"
            value={qs.tag}
            onChange={(e) => setQs({ tag: e.target.value })}
          >
            <option value="all">All Tags</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {!hidePreviewToggle && (
          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={qs.preview}
              onChange={(e) => setQs({ preview: e.target.checked ? "1" : undefined })}
            />
            Show drafts
          </label>
        )}
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((p) => (
          <article
            key={p.slug}
            className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden hover:translate-y-[-1px] hover:shadow-lg transition"
          >
            {p.cover ? (
              <img src={p.cover} alt="" className="w-full h-40 object-cover border-b border-white/10" />
            ) : (
              <div className="h-2 bg-accent/30" />
            )}
            <div className="p-4 space-y-2">
              <div className="text-xs text-muted">
                {p.category} • {new Date(p.publishedAt).toLocaleDateString()}
              </div>
              <h3 className="text-lg font-medium">{p.title}</h3>
              <p className="text-sm text-muted line-clamp-3">{p.excerpt}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {(p.tags || []).map((t) => (
                  <span
                    key={t}
                    className="text-[11px] px-2 py-0.5 rounded-full border border-white/10 bg-black/40"
                  >
                    {t}
                  </span>
                ))}
                {p.draft && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full border border-yellow-400/30 bg-yellow-400/10 text-yellow-200">
                    draft
                  </span>
                )}
                {p.coupon && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full border border-green-400/30 bg-green-400/10 text-green-200">
                    coupon
                  </span>
                )}
              </div>
              <div className="pt-2">
                <Link href={`/features/news/${p.slug}`} className="inline-block text-accent hover:underline">
                  Read more →
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {items.length === 0 && <div className="text-center text-muted py-10">No posts match your filters.</div>}
    </div>
  );
}
