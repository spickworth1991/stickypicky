// copies the compiled worker to Pages' assets root
const fs = require("fs");
const path = require("path");

const src = path.join(".open-next", "worker.js");
const outDir = path.join(".open-next", "assets");
const dst = path.join(outDir, "_worker.js");

fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(src, dst);
console.log(`Copied ${src} -> ${dst}`);
