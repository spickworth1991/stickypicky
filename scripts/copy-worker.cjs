import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = ".open-next/assets";
mkdirSync(dir, { recursive: true });

const worker = `import openNextWorker from "../worker.js";
export default { async fetch(request, env, ctx) {
  const res = await openNextWorker.fetch(request, env, ctx);
  if (!res || res.status === 404) return env.ASSETS.fetch(request);
  return res;
}};`;

writeFileSync(join(dir, "_worker.js"), worker);
console.log("✅ Wrote .open-next/assets/_worker.js");
