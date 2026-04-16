import type { NextConfig } from "next";

/**
 * Production canonical: https://atlastrustcore.com (no www).
 *
 * Vercel handles the www → root redirect at the edge automatically when
 * `atlastrustcore.com` is set as the primary domain in the project's
 * domain settings. The redirect below is a defensive code-level layer —
 * if the Vercel domain config ever drifts (or the app gets deployed
 * somewhere else), the application itself still enforces the canonical
 * hostname.
 */
const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.atlastrustcore.com",
          },
        ],
        destination: "https://atlastrustcore.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
