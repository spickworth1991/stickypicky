// scripts/copy-worker.cjs
// Mirrors the OpenNext build into the Pages deploy dir and brings along /public.
// Usage: runs after `opennextjs-cloudflare build`
// Output deploy dir: .open-next/assets

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const openNextDir = path.resolve(root, ".open-next");
const toDir = path.join(openNextDir, "assets");

function exists(p) {
  try { return fs.existsSync(p); } catch { return false; }
}
function ensureDirFor(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}
function copyFile(src, dest) {
  ensureDirFor(dest);
  fs.copyFileSync(src, dest);
}
function copyDir(src, dest) {
  if (!exists(src)) return;
  const stat = fs.statSync(src);
  if (!stat.isDirectory()) {
    copyFile(src, dest);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    const st = fs.statSync(s);
    if (st.isDirectory()) {
      copyDir(s, d);
    } else if (st.isFile()) {
      copyFile(s, d);
    } // ignore symlinks for Pages
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

  // 1) Copy the worker (so Pages uses this as the Functions/Worker entry)
  const workerSrc = path.join(openNextDir, "worker.js");
  const workerDest = path.join(toDir, "_worker.js");
  if (exists(workerSrc)) {
    logCopy(workerSrc, workerDest);
    copyFile(workerSrc, workerDest);
  } else {
    console.warn("⚠️  Missing .open-next/worker.js (OpenNext build may have failed?)");
  }

  // 2) Mirror server functions into the assets tree (CF Pages Functions)
  const serverFnsSrc = path.join(openNextDir, "server-functions");
  const serverFnsDest = path.join(toDir, "server-functions");
  if (exists(serverFnsSrc)) {
    logCopy(serverFnsSrc, serverFnsDest);
    copyDir(serverFnsSrc, serverFnsDest);
  } else {
    console.warn("⚠️  Missing .open-next/server-functions (are you using the app router?)");
  }

  // 3) Ensure anything already in .open-next/assets stays (OpenNext puts static/public here)
  // Nothing to do; we just merge more content into `toDir`.

  // 4) NEW: Recursively copy your entire /public into the deploy root
  // This makes /public/og/foo.jpg available as /og/foo.jpg at runtime.
  const publicSrc = path.join(root, "public");
  if (exists(publicSrc)) {
    console.log("📦 Mirroring /public into .open-next/assets …");
    // Copy into the root of assets, not nested under "public"
    for (const entry of fs.readdirSync(publicSrc)) {
      const s = path.join(publicSrc, entry);
      const d = path.join(toDir, entry);
      logCopy(s, d);
      const st = fs.statSync(s);
      if (st.isDirectory()) copyDir(s, d);
      else if (st.isFile()) copyFile(s, d);
    }
  } else {
    console.warn("⚠️  No /public directory found to mirror.");
  }

  // 5) Copy optional _headers (either from /public/_headers or repo root _headers)
  // Pages will read it from the deploy root.
  const headersCandidates = [
    path.join(publicSrc, "_headers"),
    path.join(root, "_headers"),
  ];
  for (const candidate of headersCandidates) {
    if (exists(candidate)) {
      const dest = path.join(toDir, "_headers");
      logCopy(candidate, dest);
      copyFile(candidate, dest);
      break;
    }
  }

  // 6) (Optional best-effort) Bring across any .next/static if OpenNext left it around
  // This helps when CSS/JS assets end up under .next/static in certain toolchains.
  const nextStaticA = path.join(root, ".next", "static");
  const nextStaticB = path.join(openNextDir, ".next", "static"); // rare
  const nextStaticDest = path.join(toDir, "_next", "static");
  if (exists(nextStaticA)) {
    logCopy(nextStaticA, nextStaticDest);
    copyDir(nextStaticA, nextStaticDest);
  } else if (exists(nextStaticB)) {
    logCopy(nextStaticB, nextStaticDest);
    copyDir(nextStaticB, nextStaticDest);
  }

  // 7) Sanity pings
  [
    path.join(toDir, "_worker.js"),
    path.join(toDir, "server-functions", "default", "handler.mjs"),
  ].forEach(p => {
    if (!exists(p)) console.warn("⚠️  Not found (may be fine depending on your app):", p);
  });

  console.log("✅ Copy complete. Deploy with: wrangler pages deploy .open-next/assets");
})();
