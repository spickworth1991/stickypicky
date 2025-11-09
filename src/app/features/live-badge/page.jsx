export const metadata = {
  title: "Live Value Badge | StickyPicky",
  description:
    "Tiny badge that shows live counts (orders, signups, views) via a lightweight API cache — with copyable embed code.",
};

import LiveBadgeShowcase from "@/components/LiveBadgeShowcase";

export default function LiveBadgePage() {
  return (
    <section className="relative overflow-clip">
      <div className="pointer-events-none absolute inset-0">
        <div className="hero-glow" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-16">
        <h1 className="text-4xl md:text-5xl font-semibold">
          Live Value <span className="text-accent">Badge</span>
        </h1>
        <p className="text-muted mt-2">
          Embed live counters (views, orders, signups) anywhere. Copy the exact code below.
        </p>

        <LiveBadgeShowcase />
      </div>
    </section>
  );
}
