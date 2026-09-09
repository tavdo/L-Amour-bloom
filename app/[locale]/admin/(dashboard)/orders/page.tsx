import { getPrisma } from "@/lib/db";
import { updateOrderStatusAction } from "../../actions";

const statuses = [
  "PENDING_PAYMENT",
  "PAID",
  "FAILED",
  "CANCELLED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
] as const;

export default async function AdminOrdersPage() {
  const orders = await getPrisma().order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, shippingRegion: true },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-serif text-4xl text-forest">Orders</h1>
      <ul className="mt-6 space-y-3">
        {orders.map((order) => (
          <li key={order.id} className="rounded-3xl border border-line bg-panel p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{order.number}</p>
                <p className="text-sm text-muted">
                  {order.customerName} · {order.customerEmail} · {order.customerPhone}
                </p>
                <p className="text-sm text-muted">
                  {order.city} · {order.shippingRegion.nameEn} · {order.paymentProvider ?? "—"} ·{" "}
                  {(order.totalGel / 100).toFixed(2)} GEL
                </p>
              </div>
              <form
                action={async (formData) => {
                  "use server";
                  await updateOrderStatusAction(order.id, String(formData.get("status")));
                }}
              >
                <select name="status" defaultValue={order.status} className="rounded-xl border border-line px-2 py-1">
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button className="ml-2 text-sm text-forest" type="submit">
                  Update
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
