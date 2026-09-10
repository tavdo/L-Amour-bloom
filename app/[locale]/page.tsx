import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCategories, getPublishedProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/catalog/product-card";
import type { AppLocale } from "@/i18n/routing";
import { SetupHint } from "@/components/setup-hint";
import { SectionHeading } from "@/components/layout/section-heading";
import { GlassPanel } from "@/components/layout/glass-panel";

export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Home");

  let categories;
  let featured;
  try {
    [categories, featured] = await Promise.all([
      getCategories(locale as AppLocale),
      getPublishedProducts({ featured: true, locale: locale as AppLocale }),
    ]);
  } catch (error) {
    console.error("[home] database unavailable", error);
    return <SetupHint />;
  }

  return (
      <div>
        <section className="mx-auto flex min-h-[72vh] max-w-6xl items-center px-4 py-16">
          <GlassPanel className="max-w-xl px-8 py-10 md:px-12">
            <p className="text-xs uppercase tracking-[0.28em] text-gold">{t("eyebrow")}</p>
            <h1 className="mt-4 font-serif text-6xl leading-[0.95] text-forest md:text-7xl">
              {t("title")}
            </h1>
            <p className="mt-6 text-lg text-forest/80">{t("subtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/catalog" className="bg-forest px-6 py-3 text-panel">
                {t("shopCta")}
              </Link>
              <a href="#materials" className="border border-forest/40 bg-white/20 px-6 py-3 text-forest backdrop-blur-md">
                {t("storyCta")}
              </a>
            </div>
          </GlassPanel>
        </section>

        <section className="mx-auto max-w-6xl px-4">
          <SectionHeading>{t("categories")}</SectionHeading>
          <nav className="mt-8 grid grid-cols-2 gap-px bg-gold/40 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/catalog/${category.slug}`}
                className="group flex min-h-40 flex-col justify-between bg-forest/20 px-5 py-6 backdrop-blur-xl transition hover:bg-forest/30"
              >
                <span className="font-serif text-sm text-gold">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-serif text-2xl leading-tight text-forest">
                  {category.translations[0]?.name ?? category.slug}
                </span>
              </Link>
            ))}
          </nav>
        </section>

        <section className="mx-auto mt-16 max-w-6xl px-4">
          <SectionHeading>{t("featured")}</SectionHeading>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
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
        </section>

        <section id="materials" className="mx-auto mt-16 max-w-6xl px-4 pb-16">
          <SectionHeading>{t("promiseTitle")}</SectionHeading>
          <div className="mt-8 grid gap-px bg-gold/40 md:grid-cols-3">
            {(
              [
                { title: "promise1Title", body: "promise1Body" },
                { title: "promise2Title", body: "promise2Body" },
                { title: "promise3Title", body: "promise3Body" },
              ] as const
            ).map((item) => (
              <article key={item.title} className="bg-forest/20 px-6 py-7 backdrop-blur-xl">
                <h3 className="font-serif text-2xl text-forest">{t(item.title)}</h3>
                <p className="mt-3 text-forest/75">{t(item.body)}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    );
}
