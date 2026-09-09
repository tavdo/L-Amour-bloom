"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/components/cart/cart-provider";
import { formatMoney } from "@/lib/money";
import { placeOrder } from "./actions";

type Region = {
  id: string;
  nameEn: string;
  nameKa: string;
  priceGel: number;
  priceUsd: number;
};

export function CheckoutForm({ regions }: { regions: Region[] }) {
  const t = useTranslations("Checkout");
  const locale = useLocale();
  const { items, currency, clear } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [regionId, setRegionId] = useState(regions[0]?.id ?? "");
  const region = regions.find((item) => item.id === regionId);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <h1 className="font-serif text-5xl text-forest">{t("title")}</h1>
        <p className="mt-4 text-muted">{t("emptyCart")}</p>
        <Link href="/catalog" className="mt-6 inline-block text-forest underline">
          Catalog
        </Link>
      </div>
    );
  }

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      const result = await placeOrder({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        addressLine1: String(formData.get("addressLine1") ?? ""),
        addressLine2: String(formData.get("addressLine2") ?? ""),
        city: String(formData.get("city") ?? ""),
        regionId,
        notes: String(formData.get("notes") ?? ""),
        provider: formData.get("provider") === "TBC" ? "TBC" : "BOG",
        currency,
        locale: locale === "ka" ? "ka" : "en",
        items,
      });
      clear();
      window.location.href = result.redirectUrl;
    } catch {
      setError(t("error"));
      setPending(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[1.2fr_0.8fr]">
      <form action={onSubmit} className="space-y-6">
        <h1 className="font-serif text-5xl text-forest">{t("title")}</h1>
        <section className="rounded-3xl border border-line bg-panel/40 p-6 backdrop-blur-md">
          <h2 className="font-serif text-2xl">{t("contact")}</h2>
          <div className="mt-4 grid gap-3">
            <input name="name" required placeholder={t("name")} className="rounded-xl border border-line px-3 py-2" />
            <input name="email" type="email" required placeholder={t("email")} className="rounded-xl border border-line px-3 py-2" />
            <input name="phone" required placeholder={t("phone")} className="rounded-xl border border-line px-3 py-2" />
          </div>
        </section>
        <section className="rounded-3xl border border-line bg-panel/40 p-6 backdrop-blur-md">
          <h2 className="font-serif text-2xl">{t("address")}</h2>
          <div className="mt-4 grid gap-3">
            <input name="addressLine1" required placeholder={t("line1")} className="rounded-xl border border-line px-3 py-2" />
            <input name="addressLine2" placeholder={t("line2")} className="rounded-xl border border-line px-3 py-2" />
            <input name="city" required placeholder={t("city")} className="rounded-xl border border-line px-3 py-2" />
            <label className="text-sm text-muted">
              {t("region")}
              <select
                value={regionId}
                onChange={(event) => setRegionId(event.target.value)}
                className="mt-1 block w-full rounded-xl border border-line px-3 py-2"
              >
                {regions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {locale === "ka" ? item.nameKa : item.nameEn} —{" "}
                    {formatMoney(currency === "USD" ? item.priceUsd : item.priceGel, currency)}
                  </option>
                ))}
              </select>
            </label>
            <textarea name="notes" placeholder={t("notes")} className="rounded-xl border border-line px-3 py-2" />
          </div>
        </section>
        <section className="rounded-3xl border border-line bg-panel/40 p-6 backdrop-blur-md">
          <h2 className="font-serif text-2xl">{t("payment")}</h2>
          <p className="mt-2 text-sm text-muted">{t("payInGel")}</p>
          <div className="mt-4 grid gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-line px-3 py-3">
              <input type="radio" name="provider" value="BOG" defaultChecked />
              {t("payBog")}
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-line px-3 py-3">
              <input type="radio" name="provider" value="TBC" />
              {t("payTbc")}
            </label>
          </div>
        </section>
        {error ? <p className="text-clay">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-clay px-6 py-3 text-panel disabled:opacity-60"
        >
          {t("submit")}
        </button>
      </form>
      <aside className="h-fit rounded-3xl border border-line bg-panel/40 p-6 backdrop-blur-md">
        <p className="text-sm text-muted">{t("shipping")}</p>
        <p className="font-serif text-2xl">
          {region
            ? formatMoney(currency === "USD" ? region.priceUsd : region.priceGel, currency)
            : "—"}
        </p>
        <p className="mt-4 text-sm text-muted">{t("total")} {t("payInGel")}</p>
      </aside>
    </div>
  );
}
