import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { incrementKV } from "@/lib/badgeKV";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET(req) {
  const key = new URL(req.url).searchParams.get("key") || "views";
  const { env } = getRequestContext();
  const kv = env?.BADGE_KV;

  await incrementKV(kv, key, 1);
  return new NextResponse(null, { status: 204, headers: { "cache-control": "no-store" } });
}
