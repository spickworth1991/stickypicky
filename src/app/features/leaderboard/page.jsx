export const metadata = {
  title: "Leaderboard Demo | StickyPicky",
  description: "Sortable leaderboard preview with week window and stable tiebreakers.",
};

import LeaderboardDemo from "@/components/LeaderboardDemo";

export default function LeaderboardPage() {
  return (
    <section className="relative overflow-clip">
      <div className="pointer-events-none absolute inset-0">
        <div className="hero-glow" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-16 space-y-6">
        <h1 className="text-4xl md:text-5xl font-semibold">
          Leaderboard <span className="text-accent">Demo</span>
        </h1>
        <p className="text-muted">Compact preview here; we can expand this into its own full-featured app view.</p>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <LeaderboardDemo />
        </div>
      </div>
    </section>
  );
}
