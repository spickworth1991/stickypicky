// scripts/copy-worker.cjs
// Mirror OpenNext output + bring along /public and all worker deps
// Usage: runs after `opennextjs-cloudflare build`

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const openNextDir = path.resolve(root, ".open-next");
const toDir = path.join(openNextDir, "assets");

function exists(p) { try { return fs.existsSync(p); } catch { return false; } }
function ensureDirFor(filePath) { fs.mkdirSync(path.dirname(filePath), { recursive: true }); }
function copyFile(src, dest) { ensureDirFor(dest); fs.copyFileSync(src, dest); }
function copyDir(src, dest) {
  if (!exists(src)) return;
  const stat = fs.statSync(src);
  if (!stat.isDirectory()) { copyFile(src, dest); return; }
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    const st = fs.statSync(s);
    if (st.isDirectory()) copyDir(s, d);
    else if (st.isFile()) copyFile(s, d);
  }
}
function logCopy(src, dest) {
  console.log(`→ Copy ${path.relative(root, src)} -> ${path.relative(root, dest)}`);
}

(function main() {
  if (!exists(openNextDir)) {
    console.error("❌ .open-next not found. Run `opennextjs-cloudflare build` first.");
    process.exit(1);
  }
  fs.mkdirSync(toDir, { recursive: true });

  // 1) Core worker
  const workerSrc = path.join(openNextDir, "worker.js");
  const workerDest = path.join(toDir, "_worker.js");
  if (exists(workerSrc)) { logCopy(workerSrc, workerDest); copyFile(workerSrc, workerDest); }
  else console.warn("⚠️ Missing .open-next/worker.js");

  // 2) Worker runtime deps (these are what your error log complained about)
  const deps = [
    // keep same relative layout as in .open-next so imports resolve
    ["cloudflare", "cloudflare"],
    ["middleware", "middleware"],
    [".build/durable-objects", ".build/durable-objects"],
  ];
  for (const [relSrc, relDest] of deps) {
    const src = path.join(openNextDir, relSrc);
    const dest = path.join(toDir, relDest);
    if (exists(src)) { logCopy(src, dest); copyDir(src, dest); }
    else console.warn(`⚠️ Missing .open-next/${relSrc} (may be fine depending on build)`);
  }

  // 3) Server functions (CF Pages Functions)
  const serverFnsSrc = path.join(openNextDir, "server-functions");
  const serverFnsDest = path.join(toDir, "server-functions");
  if (exists(serverFnsSrc)) { logCopy(serverFnsSrc, serverFnsDest); copyDir(serverFnsSrc, serverFnsDest); }
  else console.warn("⚠️ Missing .open-next/server-functions");

  // 4) Public assets at the deploy root
  const publicSrc = path.join(root, "public");
  if (exists(publicSrc)) {
    console.log("📦 Mirroring /public into .open-next/assets …");
    for (const entry of fs.readdirSync(publicSrc)) {
      const s = path.join(publicSrc, entry);
      const d = path.join(toDir, entry);
      logCopy(s, d);
      const st = fs.statSync(s);
      if (st.isDirectory()) copyDir(s, d);
      else if (st.isFile()) copyFile(s, d);
    }
  } else console.warn("⚠️ No /public directory found to mirror.");

  // 5) _headers (either in /public or repo root) → deploy root
  const headersCandidates = [path.join(publicSrc, "_headers"), path.join(root, "_headers")];
  for (const candidate of headersCandidates) {
    if (exists(candidate)) { const dest = path.join(toDir, "_headers"); logCopy(candidate, dest); copyFile(candidate, dest); break; }
  }

  // 6) Best-effort: copy any .next/static assets (helps with CSS/JS not emitted by OpenNext)
  const nextStaticCandidates = [
    path.join(root, ".next", "static"),
    path.join(openNextDir, ".next", "static"),
  ];
  const nextStaticDest = path.join(toDir, "_next", "static");
  for (const cand of nextStaticCandidates) {
    if (exists(cand)) { logCopy(cand, nextStaticDest); copyDir(cand, nextStaticDest); break; }
  }

  // 7) Sanity hints
  [
    path.join(toDir, "_worker.js"),
    path.join(toDir, "cloudflare"),
    path.join(toDir, "middleware"),
    path.join(toDir, ".build", "durable-objects"),
  ].forEach(p => { if (!exists(p)) console.warn("ℹ️ Not found (may be fine):", path.relative(root, p)); });

  console.log("✅ Copy complete. Deploy with: wrangler pages deploy .open-next/assets");
})();
