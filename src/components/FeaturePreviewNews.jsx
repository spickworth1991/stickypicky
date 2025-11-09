"use client";

import Link from "next/link";
import { listNews } from "@/lib/newsData";

export default function FeaturePreviewNews({ limit = 3 }) {
  const items = listNews({}).slice(0, limit);
  return (
    <div className="grid grid-cols-1 gap-3">
      {items.map(p => (
        <Link
          key={p.slug}
          href={`/features/news/${p.slug}`}
          className="rounded-xl border border-white/10 bg-black/20 p-3 hover:bg-black/30 transition"
        >
          <div className="text-xs text-muted">
            {p.category} • {new Date(p.publishedAt).toLocaleDateString()}
          </div>
          <div className="font-medium">{p.title}</div>
          <div className="text-xs text-muted line-clamp-2">{p.excerpt}</div>
        </Link>
      ))}
    </div>
  );
}
