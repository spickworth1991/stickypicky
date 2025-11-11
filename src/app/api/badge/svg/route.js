export const runtime = 'edge';

import { NextResponse } from "next/server";
import { getSnapshot } from "@/lib/badgeStore";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const key   = searchParams.get("key")   || "views";
  const label = searchParams.get("label") || key;
  const color = searchParams.get("color") || "#22d3ee";

  const snap = getSnapshot();
  const val = snap.counts?.[key] ?? 0;
  const text = `${label}: ${val.toLocaleString()}`;

  const padding = 16;
  const approxChar = 7.2;
  const h = 24, r = h / 2;
  const w = Math.ceil(padding * 2 + text.length * approxChar);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect x="0" y="0" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="${hexA(color, 0.14)}" stroke="${hexA(color, 0.6)}" />
  <text x="${w/2}" y="${h/2 + 4}" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" font-size="12" fill="${hexA(color, 0.95)}">${escapeXml(text)}</text>
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
