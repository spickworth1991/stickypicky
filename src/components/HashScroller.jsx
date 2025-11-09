"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function HashScroller() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // scroll when the route (or params) change and there is a hash
  useEffect(() => {
    const id = window.location.hash?.slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [pathname, searchParams]);

  // also handle in-page hash changes
  useEffect(() => {
    const onHash = () => {
      const id = window.location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return null;
}
