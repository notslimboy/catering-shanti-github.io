import type { MetadataRoute } from "next";
import { getActivePackages } from "@/lib/catalog";
import { SEO_PACKAGE_SLUGS, getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const updatedAt = new Date();
  let packageSlugs: string[] = [];

  try {
    packageSlugs = (await getActivePackages()).map((item) => item.slug);
  } catch {
    // Keep the essential sitemap available if the dashboard catalogue is
    // temporarily unavailable. The static service pages remain indexable.
  }

  const allPackageSlugs = [...new Set([...SEO_PACKAGE_SLUGS, ...packageSlugs])];

  return [
    {
      url: new URL("/", siteUrl).toString(),
      lastModified: updatedAt,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: new URL("/menu", siteUrl).toString(),
      lastModified: updatedAt,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: new URL("/galeri", siteUrl).toString(),
      lastModified: updatedAt,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: new URL("/catering-harian", siteUrl).toString(),
      lastModified: updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...allPackageSlugs.map((slug) => ({
      url: new URL(`/paket/${slug}`, siteUrl).toString(),
      lastModified: updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
