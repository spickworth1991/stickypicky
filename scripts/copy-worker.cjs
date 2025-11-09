// Mirror the OpenNext worker + its runtime deps into the Pages assets dir
// so Wrangler can bundle _worker.js successfully.

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const fromBase = path.resolve(root, ".open-next");
const toBase = path.resolve(root, ".open-next", "assets");

// Files/dirs that _worker.js imports via relative paths
const NEEDED = [
  // the worker entry itself (file -> _worker.js)
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

// Quick sanity: ensure the most important imports now exist relative to assets
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

let ok = true;
for (const p of mustExist) {
  if (!fs.existsSync(p)) {
    // Not every OpenNext build emits every file (depends on what features you use),
    // but if _worker.js is importing them, they should be there.
    console.warn("⚠️  Not found (may be OK if not imported in this build):", p);
  }
}
console.log("✅ Mirror step complete.");
