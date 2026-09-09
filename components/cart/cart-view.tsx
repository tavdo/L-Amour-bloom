"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/components/cart/cart-provider";
import { formatMoney } from "@/lib/money";

type ResolvedItem = {
  productId: string;
  variantId?: string;
  name: string;
  imageUrl?: string;
  quantity: number;
  unitPriceGel: number;
  unitPriceUsd: number;
};

export function CartView() {
  const t = useTranslations("Cart");
  const { items, updateQuantity, removeItem, currency } = useCart();
  const [resolved, setResolved] = useState<ResolvedItem[]>([]);

  useEffect(() => {
    if (items.length === 0) {
      setResolved([]);
      return;
    }
    const params = new URLSearchParams({ items: JSON.stringify(items) });
    fetch(`/api/cart?${params.toString()}`)
      .then((response) => response.json())
      .then((data: { items: ResolvedItem[] }) => setResolved(data.items))
      .catch(() => setResolved([]));
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-serif text-5xl text-forest">{t("title")}</h1>
        <p className="mt-4 text-muted">{t("empty")}</p>
        <Link href="/catalog" className="mt-6 inline-block rounded-full bg-forest px-5 py-2 text-panel">
          {t("continue")}
        </Link>
      </div>
    );
  }

  const subtotal = resolved.reduce((sum, item) => {
    const unit = currency === "USD" ? item.unitPriceUsd : item.unitPriceGel;
    return sum + unit * item.quantity;
  }, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-serif text-5xl text-forest">{t("title")}</h1>
      <ul className="mt-8 divide-y divide-line">
        {resolved.map((item) => {
          const unit = currency === "USD" ? item.unitPriceUsd : item.unitPriceGel;
          return (
            <li key={`${item.productId}:${item.variantId ?? ""}`} className="flex gap-4 py-5">
              <div className="relative h-24 w-20 overflow-hidden rounded-2xl bg-line">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                ) : null}
              </div>
              <div className="flex-1">
                <p className="font-serif text-2xl text-forest">{item.name}</p>
                <p className="text-sm text-muted">{formatMoney(unit, currency)}</p>
                <label className="mt-2 block text-sm">
                  {t("quantity")}
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={item.quantity}
                    onChange={(event) =>
                      updateQuantity(
                        item.productId,
                        item.variantId,
                        Number(event.target.value),
                      )
                    }
                    className="ml-2 w-16 rounded-lg border border-line bg-panel px-2 py-1"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.productId, item.variantId)}
                className="text-sm text-clay"
              >
                {t("remove")}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-8 flex items-end justify-between">
        <p className="text-sm text-muted">{t("shippingHint")}</p>
        <div className="text-right">
          <p className="text-sm text-muted">{t("subtotal")}</p>
          <p className="font-serif text-3xl">{formatMoney(subtotal, currency)}</p>
          <Link href="/checkout" className="mt-4 inline-block rounded-full bg-clay px-6 py-3 text-panel">
            {t("checkout")}
          </Link>
        </div>
      </div>
    </div>
  );
}
