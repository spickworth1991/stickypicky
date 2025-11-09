// open-next.config.ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
// Optional: enable Next.js Incremental Cache via R2 later
// import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
  // incrementalCache: r2IncrementalCache, // uncomment after you bind an R2 bucket
});
