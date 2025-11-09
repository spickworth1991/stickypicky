"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function CouponBox({ code, expiresAt, cta = "Redeem", link = "#" }) {
  const [copied, setCopied] = useState(false);

  // ✅ Lazy initializer keeps render pure (no impure Date.now() at render)
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { expired, left } = useMemo(() => {
    const end = new Date(expiresAt).getTime();
    const diff = Math.max(0, end - now);
    const expired = diff <= 0;
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    return { expired, left: `${d}d ${h}h ${m}m ${s}s` };
  }, [now, expiresAt]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }

  return (
    <div className="rounded-2xl border border-green-400/30 bg-green-400/10 p-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="space-y-1">
          <div className="text-sm text-green-200/90">Coupon Code</div>
          <div className="text-2xl font-mono tracking-wide">{code}</div>
          <div className="text-xs text-green-200/80">
            {expired ? "Expired" : `Expires in ${left}`}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copy}
            className="px-3 py-2 rounded-xl border border-white/10 bg-zinc-900 hover:bg-zinc-800"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <Link
            href={link}
            className="px-3 py-2 rounded-xl border border-green-400/40 bg-green-400/20 hover:bg-green-400/30 text-green-100"
          >
            {cta}
          </Link>
        </div>
      </div>
    </div>
  );
}
