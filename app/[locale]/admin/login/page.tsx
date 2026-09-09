import { getTranslations } from "next-intl/server";
import { loginAction } from "../actions";

export default async function AdminLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const { error } = await searchParams;
  const t = await getTranslations("Admin");

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <h1 className="font-serif text-4xl text-forest">{t("loginTitle")}</h1>
      <form action={loginAction} className="mt-8 space-y-3 rounded-3xl border border-line bg-panel p-6">
        <input type="hidden" name="locale" value={locale} />
        <input name="email" type="email" required placeholder={t("email")} className="w-full rounded-xl border border-line px-3 py-2" />
        <input name="password" type="password" required placeholder={t("password")} className="w-full rounded-xl border border-line px-3 py-2" />
        {error ? <p className="text-sm text-clay">{t("invalid")}</p> : null}
        <button className="w-full rounded-full bg-forest py-2 text-panel" type="submit">
          {t("signIn")}
        </button>
      </form>
    </div>
  );
}
