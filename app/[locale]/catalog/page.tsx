import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCategories, getPublishedProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/catalog/product-card";
import type { AppLocale } from "@/i18n/routing";
import { SetupHint } from "@/components/setup-hint";
import { SectionHeading } from "@/components/layout/section-heading";

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  const t = await getTranslations("Catalog");

  let categories;
  let products;
  try {
    [categories, products] = await Promise.all([
      getCategories(locale as AppLocale),
      getPublishedProducts({
        locale: locale as AppLocale,
        categorySlug: category,
      }),
    ]);
  } catch (error) {
    console.error("[catalog] database unavailable", error);
    return <SetupHint />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <SectionHeading as="h1">{t("title")}</SectionHeading>
      <div className="mt-8 flex flex-wrap gap-px bg-gold/40">
        <Link
          href="/catalog"
          className={`bg-forest/20 px-4 py-2 font-serif text-lg backdrop-blur-xl ${!category ? "text-forest ring-1 ring-gold" : "text-muted hover:bg-forest/30"}`}
        >
          {t("all")}
        </Link>
        {categories.map((item) => (
          <Link
            key={item.id}
            href={`/catalog/${item.slug}`}
            className={`bg-forest/20 px-4 py-2 font-serif text-lg backdrop-blur-xl ${category === item.slug ? "text-forest ring-1 ring-gold" : "text-muted hover:bg-forest/30"}`}
          >
            {item.translations[0]?.name ?? item.slug}
          </Link>
        ))}
      </div>
      {products.length === 0 ? (
        <p className="mt-12 text-muted">{t("empty")}</p>
      ) : (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              slug={product.slug}
              name={product.translations[0]?.name ?? product.slug}
              category={product.category.translations[0]?.name}
              imageUrl={product.images[0]?.url}
              priceGel={product.priceGel}
              priceUsd={product.priceUsd}
            />
          ))}
        </div>
      )}
    </div>
  );
}
