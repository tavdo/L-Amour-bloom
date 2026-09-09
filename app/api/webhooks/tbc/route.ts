import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  fetchTbcPaymentStatus,
  idempotencyKey,
  markOrderFailed,
  markOrderPaid,
  recordPaymentEvent,
  tbcCallbackAllowed,
} from "@/lib/payments";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 30;

function clientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? null;
  return request.headers.get("x-real-ip");
}

export async function POST(request: Request) {
  if (!tbcCallbackAllowed(clientIp(request))) {
    return new Response("forbidden", { status: 403 });
  }

  const raw = await request.text();
  let payId: string | undefined;
  try {
    const json = JSON.parse(raw) as { PaymentId?: string; paymentId?: string; payId?: string };
    payId = json.PaymentId ?? json.paymentId ?? json.payId;
  } catch {
    return new Response("ok", { status: 200 });
  }
  if (!payId) {
    return new Response("ok", { status: 200 });
  }

  const key = idempotencyKey("TBC", raw);
  const prisma = getPrisma();
  const order = await prisma.order.findFirst({
    where: { providerOrderId: payId },
  });

  const inserted = await recordPaymentEvent({
    provider: "TBC",
    idempotencyKey: key,
    payload: { payId, raw },
    orderId: order?.id,
  });
  if (!inserted) {
    return new Response("ok", { status: 200 });
  }

  const status = (await fetchTbcPaymentStatus(payId)).toLowerCase();
  if (order) {
    if (["succeeded", "success", "completed"].includes(status)) {
      await markOrderPaid(order.id, payId);
    } else if (["failed", "expired", "cancelled", "canceled"].includes(status)) {
      await markOrderFailed(order.id);
    }
    revalidateTag(CACHE_TAGS.orders, "max");
  }

  return new Response("ok", { status: 200 });
}
