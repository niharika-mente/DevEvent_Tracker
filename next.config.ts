import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  cacheComponents: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Company logos via UI Avatars fallback
      { protocol: 'https', hostname: 'ui-avatars.com' },
      // Unstop CDN for opportunity banners & logos
      { protocol: 'https', hostname: 'd8it4huxumps7.cloudfront.net' },
      { protocol: 'https', hostname: 'unstop.com' },
      // Clearbit logo API
      { protocol: 'https', hostname: 'logo.clearbit.com' },
      // GitHub avatars (YC companies)
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      // Wikipedia (used in seed data logos)
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      // Generic image hosts
      { protocol: 'https', hostname: '**.cloudfront.net' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      // Devfolio
      { protocol: 'https', hostname: 'devfolio.co' },
      // HackerEarth
      { protocol: 'https', hostname: 'www.hackerearth.com' },
    ],
  },
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
      { source: "/ingest/:path*", destination: "https://us.i.posthog.com/:path*" },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;