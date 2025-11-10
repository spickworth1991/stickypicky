// Mirror the OpenNext worker + runtime deps into the Pages assets dir
// AND ensure public assets, _headers, and _next/static are present.

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const fromBase = path.resolve(root, ".open-next");
const toBase = path.resolve(root, ".open-next", "assets");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}
function copyFile(from, to) {
  if (!fs.existsSync(from)) {
    console.error("❌ Missing file:", from);
    process.exit(1);
  }
  ensureDir(path.dirname(to));
  fs.copyFileSync(from, to);
  console.log("✅ Copied file:", to);
}
function copyDir(from, to) {
  if (!fs.existsSync(from)) {
    console.log("↪︎ (skip) dir not found:", from);
    return false;
  }
  ensureDir(path.dirname(to));
  fs.cpSync(from, to, { recursive: true, force: true });
  console.log("✅ Copied dir :", to);
  return true;
}
function mergeDirContents(from, to) {
  if (!fs.existsSync(from)) return false;
  ensureDir(to);
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyDir(src, dst);
    } else {
      copyFile(src, dst);
    }
  }
  return true;
}

// 1) Worker + runtime that _worker.js imports
const NEEDS = [
  { type: "file", from: path.join(fromBase, "worker.js"), to: path.join(toBase, "_worker.js") },
  { type: "dir",  from: path.join(fromBase, "cloudflare"),        to: path.join(toBase, "cloudflare") },
  { type: "dir",  from: path.join(fromBase, "middleware"),        to: path.join(toBase, "middleware") },
  { type: "dir",  from: path.join(fromBase, ".build"),            to: path.join(toBase, ".build") },
  { type: "dir",  from: path.join(fromBase, "server-functions"),  to: path.join(toBase, "server-functions") },
];

for (const item of NEEDS) {
  if (item.type === "file") copyFile(item.from, item.to);
  else copyDir(item.from, item.to);
}

// 2) Copy public/ into the **root** of assets so /foo.jpg is accessible as /foo.jpg
const publicDir = path.join(root, "public");
if (mergeDirContents(publicDir, toBase)) {
  console.log("✅ Merged public/ into .open-next/assets");
} else {
  console.log("ℹ️ No public/ dir to merge");
}

// 3) Ensure _headers at the output root (strip CRLF & guarantee newline)
(function ensureHeaders() {
  const candidates = [path.join(root, "public", "_headers"), path.join(root, "_headers")];
  const dest = path.join(toBase, "_headers");
  let src = null;
  for (const c of candidates) if (fs.existsSync(c)) { src = c; break; }
  if (!src) return console.log("ℹ️ No _headers found");
  try {
    let text = fs.readFileSync(src, "utf8").replace(/\r\n/g, "\n");
    if (!text.endsWith("\n")) text += "\n";
    ensureDir(path.dirname(dest));
    fs.writeFileSync(dest, text, "utf8");
    console.log("✅ Copied _headers to .open-next/assets/_headers");
  } catch (e) {
    console.warn("⚠️ Failed to copy _headers:", e?.message || e);
  }
})();

// 4) Make sure the Next static bundle is present at .open-next/assets/_next/static
(function ensureNextStatic() {
  const destStatic = path.join(toBase, "_next", "static");
  if (fs.existsSync(destStatic)) {
    console.log("✅ _next/static already present");
    return;
  }

  // Attempt sources in order of likelihood:
  const sources = [
    path.join(fromBase, "_next", "static"),   // OpenNext sometimes emits this
    path.join(root, ".next", "static"),       // Next.js default
  ];

  for (const src of sources) {
    if (fs.existsSync(src)) {
      copyDir(src, destStatic);
      break;
    }
  }

  if (!fs.existsSync(destStatic)) {
    console.warn("⚠️ Could not find a source for _next/static. CSS may 404.");
  } else {
    // quick check for css presence
    const cssDir = path.join(destStatic, "css");
    if (!fs.existsSync(cssDir)) {
      console.warn("⚠️ _next/static present, but no css/ directory yet. If pages reference a css hash that isn't here, purge cache & redeploy.");
    }
  }
})();

// 5) Friendly sanity messages
const mustExist = [
  path.join(toBase, "_worker.js"),
  path.join(toBase, "_next", "static"),
];
for (const p of mustExist) {
  if (!fs.existsSync(p)) console.warn("⚠️ Not found (may be ok depending on features):", p);
}

console.log("✅ Mirror step complete.");
