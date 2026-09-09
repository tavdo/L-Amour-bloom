import type { MetadataRoute } from "next";
import { getPrisma } from "@/lib/db";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteUrl();
  const staticRoutes = ["", "/catalog", "/cart", "/checkout"];
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of ["en", "ka"] as const) {
    const prefix = locale === "en" ? "" : "/ka";
    for (const route of staticRoutes) {
      entries.push({
        url: `${origin}${prefix}${route || "/"}`,
        changeFrequency: "weekly",
        priority: route === "" ? 1 : 0.7,
      });
    }
  }

  try {
    const prisma = getPrisma();
    const [products, categories] = await Promise.all([
      prisma.product.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
      prisma.category.findMany({ select: { slug: true } }),
    ]);
    for (const locale of ["en", "ka"] as const) {
      const prefix = locale === "en" ? "" : "/ka";
      for (const product of products) {
        entries.push({
          url: `${origin}${prefix}/product/${product.slug}`,
          lastModified: product.updatedAt,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
      for (const category of categories) {
        entries.push({
          url: `${origin}${prefix}/catalog/${category.slug}`,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }
  } catch {
    // Sitemap still lists marketing routes when the database is not configured.
  }

  return entries;
}
