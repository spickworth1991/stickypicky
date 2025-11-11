export const runtime = "edge";
import { NextResponse } from "next/server";
import { getCounts } from "@/lib/badgeStore";

export async function GET() {
  const env = {
    BADGE_KV: globalThis.BINDINGS?.BADGE_KV,
    UPSTREAM_JSON: process.env.UPSTREAM_JSON,
    BADGE_SEED_VIEWS: process.env.BADGE_SEED_VIEWS,
    BADGE_SEED_CLICKS: process.env.BADGE_SEED_CLICKS,
    BADGE_SEED_EMBEDS: process.env.BADGE_SEED_EMBEDS,
  };

  const counts = await getCounts(env);
  return NextResponse.json({ counts, now: new Date().toISOString() }, { headers: { "cache-control": "no-store" } });
}
