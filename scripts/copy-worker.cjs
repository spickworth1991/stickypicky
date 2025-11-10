// scripts/copy-worker.cjs
// Mirror the OpenNext worker + runtime deps into the Pages assets dir
// AND ensure Next static assets + public/ are present in the final output.
// Also copy _headers to the output root for Cloudflare Pages.

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const fromBase = path.resolve(root, ".open-next");
const toBase = path.resolve(root, ".open-next", "assets");

// Utility helpers
const exists = p => fs.existsSync(p);
const ensureDir = p => fs.mkdirSync(path.dirname(p), { recursive: true });
const copyDir = (from, to) => {
  if (!exists(from)) {
    console.log("↪︎ (skip) dir not found:", from);
    return false;
  }
  fs.mkdirSync(to, { recursive: true });
  fs.cpSync(from, to, { recursive: true, force: true });
  console.log("✅ Copied dir :", to);
  return true;
};
const copyFile = (from, to) => {
  if (!exists(from)) {
    console.error("❌ Missing file:", from);
    process.exit(1);
  }
  ensureDir(to);
  fs.copyFileSync(from, to);
  console.log("✅ Copied file:", to);
};

// 1) Copy the OpenNext worker + runtime deps that it imports
const NEEDED = [
  { type: "file", from: path.join(fromBase, "worker.js"), to: path.join(toBase, "_worker.js") },
  { type: "dir",  from: path.join(fromBase, "cloudflare"),        to: path.join(toBase, "cloudflare") },
  { type: "dir",  from: path.join(fromBase, "middleware"),        to: path.join(toBase, "middleware") },
  { type: "dir",  from: path.join(fromBase, ".build"),            to: path.join(toBase, ".build") },
  { type: "dir",  from: path.join(fromBase, "server-functions"),  to: path.join(toBase, "server-functions") },
];

for (const item of NEEDED) {
  if (item.type === "file") copyFile(item.from, item.to);
  else copyDir(item.from, item.to);
}

// 2) Copy Next’s static output so URLs like /_next/static/css/*.css resolve
const nextStaticSrc = path.join(root, ".next", "static");
const nextStaticDest = path.join(toBase, "_next", "static");
const copiedNextStatic = copyDir(nextStaticSrc, nextStaticDest);
if (!copiedNextStatic) {
  console.warn("⚠️  .next/static not found. If CSS 404s, this is why.");
} else {
  // sanity: list a couple of files if present
  try {
    const cssDir = path.join(nextStaticDest, "css");
    if (exists(cssDir)) {
      const sample = (fs.readdirSync(cssDir) || []).slice(0, 5);
      console.log("ℹ️  static/css files:", sample);
    } else {
      console.warn("⚠️  No /_next/static/css directory after copy.");
    }
  } catch {}
}

// 3) Copy public/* into the output so /hero-shot.png, /og/*, etc. are served
const publicSrc = path.join(root, "public");
const copiedPublic = copyDir(publicSrc, toBase);
if (!copiedPublic) {
  console.log("ℹ️ No public/ directory found — skipping.");
}

// 4) Copy _headers to the output root (prefer public/_headers, otherwise project root)
(function ensureHeadersAtAssetsRoot() {
  const candidates = [
    path.join(publicSrc, "_headers"),
    path.join(root, "_headers"),
  ];
  const dest = path.join(toBase, "_headers");

  let src = null;
  for (const c of candidates) {
    if (exists(c)) {
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
    // Cloudflare Pages expects plain text; normalize endings and ensure trailing newline
    text = text.replace(/\r\n/g, "\n");
    if (!text.endsWith("\n")) text += "\n";
    ensureDir(dest);
    fs.writeFileSync(dest, text, "utf8");
    console.log("✅ Copied _headers to .open-next/assets/_headers");
  } catch (e) {
    console.warn("⚠️ Failed to copy _headers:", e?.message || e);
  }
})();

// 5) Sanity checks for the most common imports
[
  path.join(toBase, "_worker.js"),
  path.join(toBase, "server-functions", "default", "handler.mjs"),
].forEach(p => {
  if (!exists(p)) console.warn("⚠️  Not found (may be OK if not imported):", p);
});

console.log("✅ Mirror step complete.");
