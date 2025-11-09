import { Suspense } from "react";
import NewsIndex from "@/components/NewsIndex";

export const metadata = {
  title: "News & Blog | StickyPicky",
  description: "Announcements, tips, and coupons — demo without login.",
};

export default function NewsPage() {
  return (
    <section className="relative overflow-clip">
      <div className="pointer-events-none absolute inset-0">
        <div className="hero-glow" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-16">
        <header className="mb-6">
          <h1 className="text-4xl md:text-5xl font-semibold">
            News & <span className="text-accent">Blog</span>
          </h1>
          <p className="text-muted mt-2">
            Lightweight, clean, and coupon-ready. Drafts visible via <code>?preview=1</code>.
          </p>
        </header>

        {/* Next 16 requires a Suspense boundary around any client component using useSearchParams */}
        <Suspense
          fallback={
            <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-sm text-muted">
              Loading news…
            </div>
          }
        >
          <NewsIndex />
        </Suspense>
      </div>
    </section>
  );
}
