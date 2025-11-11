import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getSnapshotKV } from "@/lib/badgeKV";

export const runtime = "edge";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const key   = searchParams.get("key")   || "views";
  const label = searchParams.get("label") || key;
  const color = searchParams.get("color") || "#22d3ee";

  const { env } = getRequestContext();
  const kv = env?.BADGE_KV;

  const snap = await getSnapshotKV(kv);
  const val = snap.counts?.[key] ?? 0;
  const text = `${label}: ${val.toLocaleString()}`;

  const padding = 16;
  const approxChar = 7.2;
  const textWidth = Math.max(80, Math.ceil(text.length * approxChar) + padding * 2);
  const height = 28;
  const radius = 6;

  const svg = `
<svg width="${textWidth}" height="${height}" viewBox="0 0 ${textWidth} ${height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(text)}">
  <title>${escapeXml(text)}</title>
  <defs>
    <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="${hexA(color, 0.95)}"/>
      <stop offset="1" stop-color="${hexA(color, 0.75)}"/>
    </linearGradient>
    <filter id="s" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="${hexA("#000000", 0.35)}"/>
    </filter>
  </defs>
  <g filter="url(#s)">
    <rect rx="${radius}" width="${textWidth}" height="${height}" fill="url(#g)"/>
    <rect rx="${radius}" width="${textWidth}" height="${height}" fill="${hexA("#ffffff", 0.05)}"/>
  </g>
  <g font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial" font-size="14" text-anchor="middle" dominant-baseline="central">
    <text x="${textWidth/2}" y="${height/2}" fill="#08121A">${escapeXml(text)}</text>
  </g>
</svg>`.trim();

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", "&": "&amp;", ">": "&gt;", "'": "&apos;", '"': "&quot;" }[c]));
}
function hexA(hex, a = 1) {
  try {
    const c = hex.replace("#", "");
    if (c.length !== 6) return hex;
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  } catch {
    return hex;
  }
}
