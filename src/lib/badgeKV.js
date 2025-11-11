// src/lib/badgeKV.js
// KV-backed helpers with in-memory fallback

import { getSnapshot as memGet, increment as memInc } from "@/lib/badgeStore";

/**
 * Read current snapshot from KV, fallback to in-memory if no binding.
 */
export async function getSnapshotKV(kv) {
  if (!kv) return memGet(); // fallback for local/dev without KV
  const data = await kv.get("badgeState", "json");
  return data || { counts: {}, updatedAt: new Date().toISOString() };
}

/**
 * Increment a key in KV atomically-ish (get/put). If no KV, fallback to memory.
 */
export async function incrementKV(kv, key, delta = 1) {
  if (!kv) {
    memInc(key, delta);
    return;
  }
  const cur = (await kv.get("badgeState", "json")) || { counts: {}, updatedAt: new Date().toISOString() };
  cur.counts[key] = (cur.counts[key] || 0) + delta;
  cur.updatedAt = new Date().toISOString();
  await kv.put("badgeState", JSON.stringify(cur), { expirationTtl: 60 * 60 * 24 * 365 });
}
