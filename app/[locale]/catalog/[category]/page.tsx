import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCategories, getPublishedProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/catalog/product-card";
import type { AppLocale } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/layout/section-heading";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  const t = await getTranslations("Catalog");
  const categories = await getCategories(locale as AppLocale);
  const current = categories.find((item) => item.slug === category);
  if (!current) notFound();

  const products = await getPublishedProducts({
    locale: locale as AppLocale,
    categorySlug: category,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <SectionHeading as="h1">
        {current.translations[0]?.name ?? current.slug}
      </SectionHeading>
      <p className="mt-4 max-w-2xl border-l-[3px] border-gold bg-forest/15 px-5 py-4 text-forest/80 backdrop-blur-xl">
        {current.translations[0]?.description}
      </p>
      <div className="mt-8 flex flex-wrap gap-px bg-gold/40">
        <Link href="/catalog" className="bg-forest/20 px-4 py-2 font-serif text-lg text-muted backdrop-blur-xl hover:bg-forest/30">
          {t("all")}
        </Link>
        {categories.map((item) => (
          <Link
            key={item.id}
            href={`/catalog/${item.slug}`}
          className={`bg-forest/20 px-4 py-2 font-serif text-lg backdrop-blur-xl ${item.slug === category ? "text-forest ring-1 ring-gold" : "text-muted hover:bg-forest/30"}`}
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
