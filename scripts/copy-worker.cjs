// Ensure the Pages runtime worker is present at .open-next/assets/_worker.js
const fs = require("fs");
const path = require("path");

const from = path.resolve(".open-next/worker.js");
const toDir = path.resolve(".open-next/assets");
const to = path.join(toDir, "_worker.js");

if (!fs.existsSync(from)) {
  console.error("OpenNext worker not found at", from);
  process.exit(1);
}

fs.mkdirSync(toDir, { recursive: true });
fs.copyFileSync(from, to);
console.log("✅ Copied worker to", to);
