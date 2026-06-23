import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // Allow /api/media so Facebook/Google can fetch product OG images,
        // but keep admin + sensitive API routes private.
        allow: ["/", "/api/media"],
        disallow: ["/admin", "/api/admin", "/api/checkout"],
      },
    ],
    sitemap: `${env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  };
}
