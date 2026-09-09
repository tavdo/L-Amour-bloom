"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatMoney } from "@/lib/money";
import { useCart } from "@/components/cart/cart-provider";

type ProductCardProps = {
  slug: string;
  name: string;
  category?: string;
  imageUrl?: string;
  priceGel: number;
  priceUsd: number;
};

export function ProductCard({
  slug,
  name,
  category,
  imageUrl,
  priceGel,
  priceUsd,
}: ProductCardProps) {
  const t = useTranslations("Product");
  const { currency } = useCart();
  const price = currency === "USD" ? priceUsd : priceGel;

  return (
    <Link
      href={`/product/${slug}`}
      className="group block overflow-hidden bg-forest/20 ring-1 ring-white/40 backdrop-blur-xl transition hover:bg-forest/25"
    >
      <div className="relative aspect-[4/5] bg-line">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">{name}</div>
        )}
      </div>
      <div className="border-t border-gold/30 px-4 py-3">
        {category ? (
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{category}</p>
        ) : null}
        <h3 className="mt-0.5 font-serif text-xl leading-snug text-forest">{name}</h3>
        <p className="mt-1 text-sm text-muted">
          {t("from")} {formatMoney(price, currency)}
        </p>
      </div>
    </Link>
  );
}
