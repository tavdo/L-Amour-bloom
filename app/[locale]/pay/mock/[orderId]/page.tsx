import { notFound, redirect } from "next/navigation";
import { paymentsMode } from "@/lib/site";
import { getPrisma } from "@/lib/db";
import { markOrderFailed, markOrderPaid } from "@/lib/payments";
import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";

export default async function MockPayPage({
  params,
}: {
  params: Promise<{ locale: string; orderId: string }>;
}) {
  if (paymentsMode() !== "mock") notFound();
  const { orderId, locale } = await params;
  const order = await getPrisma().order.findUnique({ where: { id: orderId } });
  if (!order) notFound();

  async function succeed() {
    "use server";
    await markOrderPaid(orderId, `mock_${orderId}`);
    revalidateTag(CACHE_TAGS.orders, "max");
    redirect(locale === "ka" ? `/ka/order/${orderId}` : `/order/${orderId}`);
  }

  async function fail() {
    "use server";
    await markOrderFailed(orderId);
    revalidateTag(CACHE_TAGS.orders, "max");
    redirect(locale === "ka" ? `/ka/order/${orderId}?payment=fail` : `/order/${orderId}?payment=fail`);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-serif text-4xl text-forest">Mock payment</h1>
      <p className="mt-3 text-muted">
        PAYMENTS_MODE=mock. No money is moved. Confirm or fail order {order.number}.
      </p>
      <div className="mt-8 flex gap-3">
        <form action={succeed}>
          <button className="rounded-full bg-forest px-5 py-2 text-panel" type="submit">
            Mark paid
          </button>
        </form>
        <form action={fail}>
          <button className="rounded-full border border-line px-5 py-2" type="submit">
            Mark failed
          </button>
        </form>
      </div>
    </div>
  );
}
