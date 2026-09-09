import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { logoutAction } from "../actions";

export default async function AdminDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect(locale === "ka" ? "/ka/admin/login" : "/admin/login");
  }
  const t = await getTranslations("Admin");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-3 text-sm">
          <Link href="/admin" className="text-forest">
            {t("dashboard")}
          </Link>
          <Link href="/admin/products">{t("products")}</Link>
          <Link href="/admin/orders">{t("orders")}</Link>
          <Link href="/admin/shipping">{t("shipping")}</Link>
          <Link href="/admin/admins">{t("admins")}</Link>
        </nav>
        <form action={logoutAction}>
          <button className="text-sm text-muted" type="submit">
            {t("signOut")} · {admin.email}
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
