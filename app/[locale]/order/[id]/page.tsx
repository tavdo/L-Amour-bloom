import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPrisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import type { Currency } from "@/lib/money";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { id } = await params;
  const { payment } = await searchParams;
  const t = await getTranslations("Order");
  const st = await getTranslations("Status");
  const prisma = getPrisma();
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, shippingRegion: true },
  });
  if (!order) notFound();

  const currency = (order.displayCurrency === "USD" ? "USD" : "GEL") as Currency;
  const paid = order.paymentStatus === "COMPLETED";
  const failed = order.paymentStatus === "FAILED" || payment === "fail";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">{t("thanks")}</p>
      <h1 className="mt-3 font-serif text-5xl text-forest">
        {paid ? t("paid") : failed ? t("failed") : t("pending")}
      </h1>
      <p className="mt-4 text-muted">
        {paid ? t("paidHint") : failed ? t("failedHint") : t("pendingHint")}
      </p>
      <dl className="mt-8 space-y-2 rounded-3xl border border-line bg-panel/40 p-6 backdrop-blur-md">
        <div className="flex justify-between">
          <dt>{t("number")}</dt>
          <dd>{order.number}</dd>
        </div>
        <div className="flex justify-between">
          <dt>{t("status")}</dt>
          <dd>{st(order.status)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Total</dt>
          <dd>
            {formatMoney(currency === "USD" ? order.totalUsd : order.totalGel, currency)}
          </dd>
        </div>
      </dl>
      <Link href="/" className="mt-8 inline-block text-forest underline">
        {t("backHome")}
      </Link>
    </div>
  );
}
