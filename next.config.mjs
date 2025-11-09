/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { 
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'stayinmotionpt.com' }, // your PT site OG
      { protocol: 'https', hostname: 'og-image.vercel.app' }, // generic fallback OGs if you want
      // add more domains as you feature more client sites
    ],
  },
};

export default nextConfig;
