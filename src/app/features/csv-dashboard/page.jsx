export const metadata = {
  title: "Data Workbench | StickyPicky",
  description: "Upload CSV/JSON/TSV, edit inline, filter, chart, and export.",
};

import DataWorkbench from "@/components/DataWorkbench";

export default function CsvDashboardPage() {
  return (
    <section className="relative overflow-clip">
      <div className="pointer-events-none absolute inset-0">
        <div className="hero-glow" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-16">
        <h1 className="text-4xl md:text-5xl font-semibold mb-6">
          Data <span className="text-accent">Workbench</span>
        </h1>

        {/* App first. No bulky instructions. */}
        <DataWorkbench />
      </div>
    </section>
  );
}
