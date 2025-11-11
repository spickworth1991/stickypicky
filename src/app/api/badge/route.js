import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getSnapshotKV } from "@/lib/badgeKV";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  // next-on-pages gives us bindings here:
  const { env } = getRequestContext();
  const kv = env?.BADGE_KV;

  const snap = await getSnapshotKV(kv);
  return NextResponse.json(snap, { headers: { "cache-control": "no-store" } });
}
