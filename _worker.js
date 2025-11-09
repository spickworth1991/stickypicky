// _worker.js (repo root)
import worker from "./.open-next/worker.js";

export default {
  async fetch(request, env, ctx) {
    // First let OpenNext handle the request
    const res = await worker.fetch(request, env, ctx);
    // If OpenNext didn’t return anything useful, fall back to static assets
    if (!res || res.status === 404) {
      return env.ASSETS.fetch(request);
    }
    return res;
  },
};
