// scripts/copy-worker.cjs
// Mirror the OpenNext worker + runtime deps into the Pages assets dir
// AND ensure _headers is present at the output root for Cloudflare Pages.

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const fromBase = path.resolve(root, ".open-next");
const toBase = path.resolve(root, ".open-next", "assets");

// Files/dirs that _worker.js imports via relative paths
const NEEDED = [
  // worker entry (file -> _worker.js)
  { type: "file", from: path.join(fromBase, "worker.js"), to: path.join(toBase, "_worker.js") },

  // folders used by the worker at runtime (copy if they exist)
  { type: "dir", from: path.join(fromBase, "cloudflare"), to: path.join(toBase, "cloudflare") },
  { type: "dir", from: path.join(fromBase, "middleware"), to: path.join(toBase, "middleware") },
  { type: "dir", from: path.join(fromBase, ".build"), to: path.join(toBase, ".build") },
  { type: "dir", from: path.join(fromBase, "server-functions"), to: path.join(toBase, "server-functions") },
];

// Node 16+ has fs.cpSync; Node 22 is fine.
function copyFile(from, to) {
  if (!fs.existsSync(from)) {
    console.error("❌ Missing file:", from);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  console.log("✅ Copied file:", to);
}

function copyDir(from, to) {
  if (!fs.existsSync(from)) {
    console.log("↪︎ (skip) dir not found:", from);
    return;
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to, { recursive: true, force: true });
  console.log("✅ Copied dir :", to);
}

for (const item of NEEDED) {
  if (item.type === "file") copyFile(item.from, item.to);
  else copyDir(item.from, item.to);
}

// Ensure the most important imports now exist relative to assets
const mustExist = [
  path.join(toBase, "_worker.js"),
  path.join(toBase, "cloudflare", "images.js"),
  path.join(toBase, "cloudflare", "init.js"),
  path.join(toBase, "cloudflare", "skew-protection.js"),
  path.join(toBase, "middleware", "handler.mjs"),
  path.join(toBase, ".build", "durable-objects", "queue.js"),
  path.join(toBase, ".build", "durable-objects", "sharded-tag-cache.js"),
  path.join(toBase, ".build", "durable-objects", "bucket-cache-purge.js"),
  path.join(toBase, "server-functions", "default", "handler.mjs"),
];

for (const p of mustExist) {
  if (!fs.existsSync(p)) {
    console.warn("⚠️  Not found (may be OK if not imported in this build):", p);
  }
}

/**
 * Ensure `_headers` is at `.open-next/assets/_headers`.
 * We look in `public/_headers` first (common), then project root.
 * We also normalize line endings and guarantee a trailing newline,
 * because CF Pages can be picky.
 */
(function ensureHeadersAtAssetsRoot() {
  const candidates = [
    path.join(root, "public", "_headers"),
    path.join(root, "_headers"),
  ];
  const dest = path.join(toBase, "_headers");

  let src = null;
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      src = c;
      break;
    }
  }

  if (!src) {
    console.log("ℹ️ No _headers file found in public/ or project root — skipping.");
    return;
  }

  try {
    let text = fs.readFileSync(src, "utf8");
    // normalize CRLF -> LF
    text = text.replace(/\r\n/g, "\n");
    // ensure trailing newline
    if (!text.endsWith("\n")) text += "\n";

    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, text, "utf8");
    console.log("✅ Copied _headers to .open-next/assets/_headers");
  } catch (e) {
    console.warn("⚠️ Failed to copy _headers:", e?.message || e);
  }
})();

console.log("✅ Mirror step complete.");
