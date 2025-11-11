export const runtime = "edge";

import { NextResponse } from "next/server";
import { incrementIdempotent } from "@/lib/badgeStore";

// Fast stable hash (no crypto API dependency needed for Edge):
function simpleHash(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

export async function POST(req) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") || "views";
  const path = url.searchParams.get("path") || ""; // caller can pass the logical page/slug

  // derive event ID from: IP (cf-connecting-ip), UA, logical path, and 5-minute bucket
  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "";
  const ua = req.headers.get("user-agent") || "";
  const minutesBucket = Math.floor(Date.now() / (5 * 60 * 1000)); // 5-min window

  const rawId = `${ip}::${ua}::${path}::${key}::${minutesBucket}`;
  const eventId = simpleHash(rawId);

  const env = {
    BADGE_KV: globalThis.BINDINGS?.BADGE_KV,
    UPSTREAM_JSON: process.env.UPSTREAM_JSON,
    BADGE_SEED_VIEWS: process.env.BADGE_SEED_VIEWS,
    BADGE_SEED_CLICKS: process.env.BADGE_SEED_CLICKS,
    BADGE_SEED_EMBEDS: process.env.BADGE_SEED_EMBEDS,
  };

  const counts = await incrementIdempotent(env, key, eventId, 1);
  return NextResponse.json({ ok: true, counts, key, eventId }, { headers: { "cache-control": "no-store" } });
}
