import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/catalog";
import { ProductPurchase } from "@/components/product/product-purchase";
import type { AppLocale } from "@/i18n/routing";
import { storeName } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug, locale as AppLocale);
  if (!product) return {};
  const name = product.translations[0]?.name ?? product.slug;
  const description = product.translations[0]?.description ?? "";
  const image = product.images[0]?.url;
  return {
    title: name,
    description,
    openGraph: {
      title: `${name} · ${storeName()}`,
      description,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug, locale as AppLocale);
  if (!product) notFound();
  const translation = product.translations[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <ProductPurchase
        productId={product.id}
        name={translation?.name ?? product.slug}
        basePriceGel={product.priceGel}
        basePriceUsd={product.priceUsd}
        images={product.images}
        variants={product.variants}
      />
      <section className="mt-12 max-w-2xl">
        <h2 className="font-serif text-3xl text-forest">
          {locale === "ka" ? "ნამუშევრის შესახებ" : "About this piece"}
        </h2>
        <p className="mt-4 whitespace-pre-wrap text-muted">
          {translation?.description}
        </p>
      </section>
    </div>
  );
}
