"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { formatMoney } from "@/lib/money";
import { useCart } from "@/components/cart/cart-provider";

type Variant = {
  id: string;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  stock: number;
  priceGel: number | null;
  priceUsd: number | null;
};

type ImageItem = { id: string; url: string; alt: string };

export function ProductPurchase({
  productId,
  name,
  basePriceGel,
  basePriceUsd,
  images,
  variants,
}: {
  productId: string;
  name: string;
  basePriceGel: number;
  basePriceUsd: number;
  images: ImageItem[];
  variants: Variant[];
}) {
  const t = useTranslations("Product");
  const { addItem, currency } = useCart();
  const [activeImage, setActiveImage] = useState(images[0]?.url);
  const [variantId, setVariantId] = useState(variants[0]?.id);
  const [added, setAdded] = useState(false);

  const variant = variants.find((item) => item.id === variantId) ?? variants[0];
  const sizes = useMemo(
    () => [...new Set(variants.map((item) => item.size).filter(Boolean))] as string[],
    [variants],
  );
  const colors = useMemo(
    () => [...new Set(variants.map((item) => item.color).filter(Boolean))] as string[],
    [variants],
  );

  const priceGel = variant?.priceGel ?? basePriceGel;
  const priceUsd = variant?.priceUsd ?? basePriceUsd;
  const price = currency === "USD" ? priceUsd : priceGel;
  const outOfStock = variants.length > 0 && (variant?.stock ?? 0) <= 0;

  function selectSize(size: string) {
    const next =
      variants.find((item) => item.size === size && (!variant?.color || item.color === variant.color)) ??
      variants.find((item) => item.size === size);
    if (next) setVariantId(next.id);
  }

  function selectColor(color: string) {
    const next =
      variants.find((item) => item.color === color && (!variant?.size || item.size === variant.size)) ??
      variants.find((item) => item.color === color);
    if (next) setVariantId(next.id);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-line">
          {activeImage ? (
            <Image
              src={activeImage}
              alt={name}
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          ) : null}
        </div>
        {images.length > 1 ? (
          <div className="mt-3 flex gap-2">
            {images.map((image) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveImage(image.url)}
                className={`relative h-20 w-16 overflow-hidden rounded-2xl border ${activeImage === image.url ? "border-forest" : "border-transparent"}`}
              >
                <Image src={image.url} alt={image.alt} fill className="object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div>
        <p className="text-sm text-muted">{t("shippingNote")}</p>
        <h1 className="mt-3 font-serif text-5xl text-forest">{name}</h1>
        <p className="mt-4 text-2xl">{formatMoney(price, currency)}</p>

        {sizes.length > 0 ? (
          <fieldset className="mt-8">
            <legend className="mb-2 text-sm text-muted">{t("size")}</legend>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => selectSize(size)}
                  className={`rounded-full border px-4 py-2 text-sm ${variant?.size === size ? "border-forest bg-forest text-panel" : "border-line"}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {colors.length > 0 ? (
          <fieldset className="mt-6">
            <legend className="mb-2 text-sm text-muted">{t("color")}</legend>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => selectColor(color)}
                  className={`rounded-full border px-4 py-2 text-sm ${variant?.color === color ? "border-forest bg-forest text-panel" : "border-line"}`}
                >
                  {color}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        <button
          type="button"
          disabled={outOfStock}
          onClick={() => {
            addItem({ productId, variantId: variant?.id, quantity: 1 });
            setAdded(true);
            window.setTimeout(() => setAdded(false), 1600);
          }}
          className="mt-8 w-full rounded-full bg-clay px-6 py-3 text-panel disabled:opacity-50"
        >
          {outOfStock ? t("outOfStock") : added ? t("added") : t("addToCart")}
        </button>
      </div>
    </div>
  );
}
