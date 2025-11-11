// src/lib/badgeStore.js
// Robust KV counter with seeding + idempotent increments via per-event dedupe key.
// Keeps JS only. Works on next-on-pages Edge.

const KV_KEY = "badge_counts_v1";
const DEDUPE_PREFIX = "badge_seen_"; // KV entries: badge_seen_<eventId>
const DEDUPE_TTL_SECONDS = 15 * 60;  // 15 minutes

function toNum(x, d = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : d;
}

function normalizeCounts(obj) {
  return {
    views: toNum(obj?.views, 0),
    clicks: toNum(obj?.clicks, 0),
    embeds: toNum(obj?.embeds, 0),
  };
}

function seedFromEnv(env) {
  return normalizeCounts({
    views: env?.BADGE_SEED_VIEWS,
    clicks: env?.BADGE_SEED_CLICKS,
    embeds: env?.BADGE_SEED_EMBEDS,
  });
}

async function seedFromUpstream(env) {
  if (!env?.UPSTREAM_JSON) return null;
  try {
    const res = await fetch(env.UPSTREAM_JSON, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const payload = data?.counts && typeof data.counts === "object" ? data.counts : data;
    return normalizeCounts(payload);
  } catch {
    return null;
  }
}

async function readKV(env) {
  const raw = await env?.BADGE_KV?.get(KV_KEY);
  if (!raw) return null;
  try {
    return normalizeCounts(JSON.parse(raw));
  } catch {
    return null;
  }
}

async function writeKV(env, counts) {
  if (!env?.BADGE_KV) return;
  await env.BADGE_KV.put(KV_KEY, JSON.stringify(normalizeCounts(counts)));
}

export async function ensureCounts(env) {
  const existing = await readKV(env);
  if (existing) return existing;

  const upstream = await seedFromUpstream(env);
  if (upstream) { await writeKV(env, upstream); return upstream; }

  const seeded = seedFromEnv(env);
  await writeKV(env, seeded);
  return seeded;
}

export async function getCounts(env) {
  const counts = await ensureCounts(env);
  return { ...counts };
}

// ---- Dedup helpers ----
async function alreadySeen(env, eventId) {
  if (!env?.BADGE_KV) return false;
  const key = DEDUPE_PREFIX + eventId;
  const hit = await env.BADGE_KV.get(key);
  return !!hit;
}

async function markSeen(env, eventId) {
  if (!env?.BADGE_KV) return;
  const key = DEDUPE_PREFIX + eventId;
  // KV put with expiration
  const expirationTtl = DEDUPE_TTL_SECONDS;
  await env.BADGE_KV.put(key, "1", { expirationTtl });
}

// ---- Increment with tiny retry to reduce races ----
export async function incrementIdempotent(env, key, eventId, by = 1) {
  key = ["views", "clicks", "embeds"].includes(key) ? key : "views";

  // If we have seen this exact event recently, skip increment.
  if (await alreadySeen(env, eventId)) {
    return getCounts(env);
  }

  // Read-modify-write with small retry window.
  let attempts = 0;
  while (attempts < 3) {
    attempts++;
    const counts = await ensureCounts(env);
    counts[key] = toNum(counts[key]) + toNum(by, 1);
    try {
      await writeKV(env, counts);
      // Mark dedupe after successful write
      await markSeen(env, eventId);
      return { ...counts };
    } catch {
      // brief backoff before retrying
      await new Promise(r => setTimeout(r, 25 * attempts));
    }
  }

  // If we failed to write repeatedly, return current (non-fatal)
  return getCounts(env);
}
