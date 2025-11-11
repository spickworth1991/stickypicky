// src/lib/badgeStore.js
// Uses Cloudflare KV if bound (BADGE_KV). Seeds once from UPSTREAM_JSON or env defaults.
// Keeps everything in JS and Edge-safe for next-on-pages.

const KV_KEY = "badge_counts_v1";

// Read numeric from env string
function numEnv(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

// build seed counts from env
function seedFromEnv(env) {
  return {
    views: numEnv(env?.BADGE_SEED_VIEWS, 0),
    clicks: numEnv(env?.BADGE_SEED_CLICKS, 0),
    embeds: numEnv(env?.BADGE_SEED_EMBEDS, 0),
  };
}

// Attempt to seed from upstream JSON; expected either:
// { counts: { views, clicks, embeds } } OR { views, clicks, embeds }
async function seedFromUpstream(env) {
  if (!env?.UPSTREAM_JSON) return null;
  try {
    const res = await fetch(env.UPSTREAM_JSON, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && typeof data === "object") {
      if (data.counts && typeof data.counts === "object") return normalizeCounts(data.counts);
      return normalizeCounts(data);
    }
  } catch {}
  return null;
}

function normalizeCounts(obj) {
  const out = {};
  for (const k of ["views", "clicks", "embeds"]) {
    const n = Number(obj?.[k]);
    out[k] = Number.isFinite(n) ? n : 0;
  }
  return out;
}

async function readKV(env) {
  const raw = await env?.BADGE_KV?.get(KV_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return normalizeCounts(parsed);
  } catch {
    return null;
  }
}

async function writeKV(env, counts) {
  if (!env?.BADGE_KV) return;
  await env.BADGE_KV.put(KV_KEY, JSON.stringify(normalizeCounts(counts)));
}

// Ensure KV has an initial value; return current counts
export async function ensureCounts(env) {
  // 1) read KV
  const existing = await readKV(env);
  if (existing) return existing;

  // 2) seed from upstream JSON (if provided)
  const upstream = await seedFromUpstream(env);
  if (upstream) {
    await writeKV(env, upstream);
    return upstream;
  }

  // 3) fall back to env defaults
  const seeded = seedFromEnv(env);
  await writeKV(env, seeded);
  return seeded;
}

export async function getCounts(env) {
  const counts = await ensureCounts(env);
  return { ...counts };
}

// Note: KV doesn't support atomic increments; this is get-modify-put.
// For low volume it's fine; for high contention we'd move to Durable Objects.
export async function increment(env, key = "views", by = 1) {
  const counts = await ensureCounts(env);
  const n = Number(by);
  if (Number.isFinite(n)) {
    counts[key] = (counts[key] ?? 0) + n;
    await writeKV(env, counts);
  }
  return { ...counts };
}
