"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useCart } from "@/components/cart/cart-provider";
import { BrandLogo } from "@/components/brand/logo";

const nav = [
  { href: "/", key: "home" as const },
  { href: "/catalog", key: "catalog" as const },
  { href: "/cart", key: "cart" as const },
];

export function SiteHeader({ storeName }: { storeName: string }) {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const { count, currency, setCurrency } = useCart();

  return (
    <header className="sticky top-0 z-30 border-b border-gold/30 bg-forest/20 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5">
        <Link href="/" aria-label={storeName} className="shrink-0">
          <BrandLogo priority />
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                pathname === item.href
                  ? "text-forest font-medium"
                  : "text-muted hover:text-forest"
              }
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 text-sm">
          <div className="flex rounded-full border border-line p-0.5">
            <button
              type="button"
              onClick={() => setCurrency("GEL")}
              className={`rounded-full px-2.5 py-1 ${currency === "GEL" ? "bg-forest text-panel" : "text-muted"}`}
            >
              ₾
            </button>
            <button
              type="button"
              onClick={() => setCurrency("USD")}
              className={`rounded-full px-2.5 py-1 ${currency === "USD" ? "bg-forest text-panel" : "text-muted"}`}
            >
              $
            </button>
          </div>
          <Link
            href={pathname}
            locale="en"
            className="rounded-full border border-line px-2.5 py-1 text-muted hover:text-forest"
          >
            EN
          </Link>
          <Link
            href={pathname}
            locale="ka"
            className="rounded-full border border-line px-2.5 py-1 text-muted hover:text-forest"
          >
            ქარ
          </Link>
          <Link
            href="/cart"
            className="rounded-full bg-forest px-3 py-1.5 text-panel"
          >
            {t("cart")} {count > 0 ? `(${count})` : ""}
          </Link>
        </div>
      </div>
    </header>
  );
}
