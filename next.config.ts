import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // When developing with `--hostname 0.0.0.0`, it's common to open the app via
  // `127.0.0.1` or a LAN IP on mobile. Next.js blocks dev-only resources
  // (webpack-hmr, original stack frames, etc.) unless the origin is allowlisted.
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname + '/src',
    };
    return config;
  },
  async headers() {
    return [
      {
        // Service Worker must never be served from cache so updates reach users immediately
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
        ],
      },
    ]
  },

  // Production deployments must never fail due to lint toolchain differences
  // between local Windows and Vercel build environment.
  // Lint can still be run explicitly via `pnpm lint`.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
