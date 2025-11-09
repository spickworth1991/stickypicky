import { NextResponse } from "next/server";
import { increment } from "@/lib/badgeStore";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const key = new URL(req.url).searchParams.get("key") || "views";
  increment(key, 1);
  return new NextResponse(null, { status: 204, headers: { "cache-control": "no-store" } });
}
