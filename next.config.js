// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // If you’re not using Cloudflare’s image service, leave unoptimized on:
  images: { unoptimized: true },

  // Optional: force edge runtime for app routes (works well on Cloudflare)
  // experimental: { runtime: 'edge' },
};

module.exports = nextConfig;
