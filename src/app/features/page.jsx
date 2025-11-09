export const metadata = {
  title: "Features | StickyPicky Portfolio",
  description:
    "Hands-on demos of custom features: a News system usable as blog/coupons, a sortable Leaderboard app, and a gallery of smaller projects.",
  openGraph: {
    title: "Features | StickyPicky Portfolio",
    description:
      "Try the News demo (blog/coupons) and a mini Leaderboard. See smaller projects, too.",
    images: [{ url: "/og/features.jpg", width: 1200, height: 630 }],
    type: "website",
  },
  alternates: { canonical: "https://your-domain.com/features" },
};

import Link from "next/link";
import FeatureCardPreview from "@/components/FeatureCardPreview";
import FeaturePreviewNews from "@/components/FeaturePreviewNews";
import FeaturePreviewBadges from "@/components/FeaturePreviewBadges";
// You already have these:
import NewsIndex from "@/components/NewsIndex";
import LeaderboardDemo from "@/components/LeaderboardDemo";

export default function FeaturesPage() {
  return (
    <section className="relative overflow-clip">
      {/* subtle cyan glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="hero-glow" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-20 space-y-10">
        {/* Header */}
        <header className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-semibold leading-tight">
            Explore <span className="text-accent">Features</span>
          </h1>
          <p className="mt-5 text-muted">
            Live, client-ready blocks: a flexible News system (blogs, promos, coupons),
            a fast Leaderboard, a CSV→Dashboard workbench, and lightweight live badges.
          </p>
        </header>

        {/* Cards grid with mini previews */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* News / Blog / Coupons */}
          <FeatureCardPreview
            title="News / Blog (Coupons-ready)"
            blurb="Dark, clean cards like StayInMotion PT. Draft preview, coupon codes, and markdown."
            href="/features/news"
            cta="Open Full Demo"
            preview={<FeaturePreviewNews limit={3} />}
          />

          {/* Leaderboard – keep your inline demo visible on the hub */}
          <FeatureCardPreview
            title="Leaderboard App"
            blurb="Sortable, week-window aware, stable tiebreakers. Scales to many leagues/seasons."
            href="/features/leaderboard"
            cta="Open Full Demo"
            preview={
              <div className="rounded-xl border border-white/10 bg-black/20 p-2">
                <LeaderboardDemo />
              </div>
            }
          />

          {/* CSV → Dashboard */}
          <FeatureCardPreview
            title="CSV / JSON → Dashboard"
            blurb="Upload CSV/TSV/JSON, edit inline, filter, pick series/colors, export CSV/TSV/JSON."
            href="/features/csv-dashboard"
            cta="Open Full Demo"
            preview={
              <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-muted">
                Upload in the full demo to generate charts + table. Exports included.
              </div>
            }
          />

          {/* Live Value Badge */}
          <FeatureCardPreview
            title="Live Value Badge"
            blurb="Tiny counters (views, orders, signups) with copyable embed/fetch code + SVG."
            href="/features/live-badge"
            cta="Open Full Demo"
            preview={<FeaturePreviewBadges />}
          />

          {/* Smaller utilities (link out with screenshots or widgets) */}
          <FeatureCardPreview
            title="Promo Code Widget"
            blurb="Embeddable promo rotator with click tracking and auto-expiry."
            href="/features/news#promo"
            cta="See In News"
            preview={
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs text-muted">Shown inside coupon posts.</div>
              </div>
            }
          />

          <FeatureCardPreview
            title="Screenshots: Leaderboard UI"
            blurb="Production styling examples."
            href="/features/leaderboard"
            cta="Open Full Demo"
            preview={
              <div className="grid grid-cols-3 gap-2">
                <img src="/features/leaderboard-1.jpg" alt=""
                     className="rounded-lg aspect-video object-cover border border-white/10" />
                <img src="/features/leaderboard-2.jpg" alt=""
                     className="rounded-lg aspect-video object-cover border border-white/10" />
                <img src="/features/leaderboard-3.jpg" alt=""
                     className="rounded-lg aspect-video object-cover border border-white/10" />
              </div>
            }
          />
        </div>

        {/* Optional: keep a full-width section if you want one demo big on this page */}
        {/* <div className="rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-6">
          <h2 className="text-2xl font-medium mb-2">News Demo (Inline)</h2>
          <NewsIndex limit={6} hidePreviewToggle />
        </div> */}
      </div>
    </section>
  );
}
