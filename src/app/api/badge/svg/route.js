import { NextResponse } from "next/server";
import { getSnapshot } from "@/lib/badgeStore";
export const runtime = 'edge';

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
  const w = Math.round(text.length * approxChar + padding * 2);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" role="img" aria-label="${text}">
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="${color}" flood-opacity="0.45" />
    </filter>
  </defs>
  <rect x="0" y="0" width="${w}" height="${h}" rx="${r}" fill="${hexA(color, 0.12)}" stroke="${hexA(color, 0.55)}"/>
  <circle cx="${r}" cy="${r}" r="4" fill="${color}" filter="url(#glow)"/>
  <text x="${r + 8}" y="${h/2 + 4}" fill="${color}" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" font-size="12">${esc(
    text
  )}</text>
</svg>`.trim();

  return new NextResponse(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function esc(s = "") {
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
