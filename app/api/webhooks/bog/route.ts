import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  idempotencyKey,
  markOrderFailed,
  markOrderPaid,
  recordPaymentEvent,
  verifyBogCallbackSignature,
} from "@/lib/payments";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";
export const maxDuration = 30;

type BogCallback = {
  event?: string;
  body?: {
    order_id?: string;
    external_order_id?: string;
    order_status?: { key?: string; value?: string } | string;
  };
};

function bogStatus(payload: BogCallback): string {
  const status = payload.body?.order_status;
  if (!status) return "";
  if (typeof status === "string") return status.toLowerCase();
  return (status.key ?? status.value ?? "").toLowerCase();
}

export async function POST(request: Request) {
  const raw = Buffer.from(await request.arrayBuffer());
  const signature = request.headers.get("Callback-Signature");
  if (!verifyBogCallbackSignature(raw, signature)) {
    return new Response("invalid signature", { status: 401 });
  }

  const payload = JSON.parse(raw.toString("utf8")) as BogCallback;
  const key = idempotencyKey("BOG", raw.toString("utf8"));
  const prisma = getPrisma();
  const order =
    (payload.body?.external_order_id
      ? await prisma.order.findUnique({ where: { id: payload.body.external_order_id } })
      : null) ??
    (payload.body?.order_id
      ? await prisma.order.findFirst({ where: { providerOrderId: payload.body.order_id } })
      : null);

  const inserted = await recordPaymentEvent({
    provider: "BOG",
    idempotencyKey: key,
    payload,
    orderId: order?.id,
  });
  if (!inserted) {
    return new Response("ok", { status: 200 });
  }

  const status = bogStatus(payload);
  if (order) {
    if (["completed", "success", "captured", "partial_completed"].includes(status)) {
      await markOrderPaid(order.id, payload.body?.order_id);
    } else if (["rejected", "failed", "expired", "cancelled"].includes(status)) {
      await markOrderFailed(order.id);
    }
    revalidateTag(CACHE_TAGS.orders, "max");
  }

  return new Response("ok", { status: 200 });
}
