import { getPrisma } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { AppLocale } from "@/i18n/routing";

export async function getCategories(locale: AppLocale) {
  const prisma = getPrisma();
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      translations: { where: { locale } },
    },
  });
}

export async function getPublishedProducts(options?: {
  categorySlug?: string;
  featured?: boolean;
  locale?: AppLocale;
}) {
  const locale = options?.locale ?? "en";
  const prisma = getPrisma();

  return prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      ...(options?.featured ? { featured: true } : {}),
      ...(options?.categorySlug
        ? { category: { slug: options.categorySlug } }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      translations: { where: { locale } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      category: {
        include: { translations: { where: { locale } } },
      },
    },
  });
}

export async function getProductBySlug(slug: string, locale: AppLocale) {
  const prisma = getPrisma();
  return prisma.product.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      translations: { where: { locale } },
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { size: "asc" } },
      category: {
        include: { translations: { where: { locale } } },
      },
    },
  });
}

export async function getShippingRegions() {
  const prisma = getPrisma();
  return prisma.shippingRegion.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getProductForCart(productId: string, variantId?: string) {
  const prisma = getPrisma();
  return prisma.product.findFirst({
    where: { id: productId, status: "PUBLISHED" },
    include: {
      translations: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: variantId ? { where: { id: variantId } } : true,
    },
  });
}

export { CACHE_TAGS };
