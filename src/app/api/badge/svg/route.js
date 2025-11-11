export const runtime = "edge";
import { NextResponse } from "next/server";
import { getCounts } from "@/lib/badgeStore";

function svg({ label = "Views", value = 0 }) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="44" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${value}</title>
  <rect rx="8" width="160" height="44" fill="#111827"/>
  <text x="14" y="28" fill="#22d3ee" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace" font-size="16">${label}</text>
  <text x="146" y="28" fill="#e5e7eb" text-anchor="end" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" font-size="16">${value.toLocaleString()}</text>
</svg>
  `.trim();
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key") || "views";
  const label = searchParams.get("label") || key;

  const env = {
    BADGE_KV: globalThis.BINDINGS?.BADGE_KV,
    UPSTREAM_JSON: process.env.UPSTREAM_JSON,
    BADGE_SEED_VIEWS: process.env.BADGE_SEED_VIEWS,
    BADGE_SEED_CLICKS: process.env.BADGE_SEED_CLICKS,
    BADGE_SEED_EMBEDS: process.env.BADGE_SEED_EMBEDS,
  };

  const counts = await getCounts(env);
  const value = counts?.[key] ?? 0;
  return new NextResponse(svg({ label, value }), {
    headers: { "content-type": "image/svg+xml", "cache-control": "no-store" },
  });
}
