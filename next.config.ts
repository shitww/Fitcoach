import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // When developing with `--hostname 0.0.0.0`, it's common to open the app via
  // `127.0.0.1` or a LAN IP on mobile. Next.js blocks dev-only resources
  // (webpack-hmr, original stack frames, etc.) unless the origin is allowlisted.
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
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

};

export default nextConfig;
