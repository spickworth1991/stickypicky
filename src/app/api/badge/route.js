import { NextResponse } from "next/server";
import { getSnapshot, increment, setCount } from "@/lib/badgeStore";
export const runtime = 'edge';
export const dynamic = "force-dynamic";

export async function GET() {
  const snap = getSnapshot();
  return NextResponse.json(snap, { headers: { "cache-control": "no-store" } });
}

export async function POST(req) {
  try {
    const { key, delta, set } = await req.json();
    if (!key || typeof key !== "string") {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }
    const snap = (typeof set !== "undefined")
      ? setCount(key, set)
      : increment(key, typeof delta === "number" ? delta : 1);

    return NextResponse.json(snap, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }
}
