import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://atlastrustcore.com";

/**
 * Search-engine instructions. Marketing + auth pages are crawlable;
 * everything behind authentication (`/dashboard`, `/admin`, `/api`) is
 * blocked because it's user-specific and not useful to surface in
 * search results.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/admin/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
