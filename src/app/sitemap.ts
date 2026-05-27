import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getAllProductSlugs } from "@/lib/products/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.NEXT_PUBLIC_SITE_URL;
  const slugs = await getAllProductSlugs().catch(() => []);

  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/collections/all`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.4 },
    ...slugs.map((s) => ({
      url: `${base}/products/${s.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
