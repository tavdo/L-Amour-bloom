import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Noto_Sans_Georgian,
  Noto_Serif_Georgian,
  Outfit,
} from "next/font/google";
import { routing } from "@/i18n/routing";
import { CartProvider } from "@/components/cart/cart-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteBackdrop } from "@/components/layout/site-backdrop";
import { storeName } from "@/lib/site";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const displayKa = Noto_Serif_Georgian({
  subsets: ["georgian"],
  variable: "--font-display-ka",
  weight: ["500", "600", "700"],
});

const body = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

const bodyKa = Noto_Sans_Georgian({
  subsets: ["georgian"],
  variable: "--font-body-ka",
  weight: ["400", "500", "600"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: {
      default: t("title"),
      template: `%s · ${storeName()}`,
    },
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      locale: locale === "ka" ? "ka_GE" : "en_US",
      type: "website",
      images: [
        {
          url: "/brand/lamour-bloom-logo.jpg",
          alt: storeName(),
        },
      ],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${display.variable} ${displayKa.variable} ${body.variable} ${bodyKa.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col text-foreground">
        <SiteBackdrop />
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
            <div className="relative z-10 flex min-h-full flex-1 flex-col">
              <SiteHeader storeName={storeName()} />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
