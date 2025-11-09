let counts = { views: 1287, orders: 42, signups: 313 };
let updatedAt = Date.now();

function safeNumber(n, fallback = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
}

export function getSnapshot() {
  return { counts, updatedAt };
}

export function increment(key, delta = 1) {
  if (!(key in counts)) counts[key] = 0;
  counts[key] = safeNumber(counts[key]) + safeNumber(delta, 0);
  updatedAt = Date.now();
  return { counts, updatedAt };
}

export function setCount(key, value) {
  counts[key] = safeNumber(value, 0);
  updatedAt = Date.now();
  return { counts, updatedAt };
}

export function resetAll(next = { views: 0, orders: 0, signups: 0 }) {
  counts = { ...next };
  updatedAt = Date.now();
  return { counts, updatedAt };
}
