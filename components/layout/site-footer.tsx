import { getTranslations } from "next-intl/server";
import { storeName } from "@/lib/site";
import { BrandLogo } from "@/components/brand/logo";

export async function SiteFooter() {
  const t = await getTranslations("Footer");
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-line/40 bg-forest-deep/80 text-panel backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-block rounded-2xl bg-panel p-3">
            <BrandLogo className="h-28 w-auto" />
          </div>
          <p className="mt-4 max-w-md text-sm text-panel/70">{t("tagline")}</p>
        </div>
        <div className="text-sm text-panel/70">
          <p>{t("shipping")}</p>
          <p className="mt-1">
            © {year} {storeName()}. {t("rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
