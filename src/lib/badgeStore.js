import { getRequestContext } from "@cloudflare/next-on-pages/adapter";

function nowISO() {
  return new Date().toISOString();
}

async function readAll() {
  const env = getRequestContext().env;
  const raw = await env.BADGE_KV.get("SNAPSHOT", "json");
  if (raw && typeof raw === "object") return raw;
  return { updatedAt: nowISO(), counts: {} };
}

async function writeAll(snap) {
  const env = getRequestContext().env;
  snap.updatedAt = nowISO();
  await env.BADGE_KV.put("SNAPSHOT", JSON.stringify(snap));
}

export async function getSnapshot() {
  return readAll();
}

export async function increment(key, delta = 1) {
  const snap = await readAll();
  const v = Number(snap.counts[key] ?? 0);
  snap.counts[key] = v + delta;
  await writeAll(snap);
  return snap;
}

export async function setCount(key, value) {
  const snap = await readAll();
  snap.counts[key] = Number(value) || 0;
  await writeAll(snap);
  return snap;
}
