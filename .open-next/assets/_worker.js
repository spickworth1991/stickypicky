import openNextWorker from "../worker.js";
export default {
  async fetch(request, env, ctx) {
    const res = await openNextWorker.fetch(request, env, ctx);
    if (!res || res.status === 404) return env.ASSETS.fetch(request);
    return res;
  },
};