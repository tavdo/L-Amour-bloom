import { getPrisma } from "@/lib/db";
import { Link } from "@/i18n/navigation";

export default async function AdminHomePage() {
  const prisma = getPrisma();
  const [products, orders, pending] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING_PAYMENT" } }),
  ]);

  return (
    <div>
      <h1 className="font-serif text-4xl text-forest">Overview</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Link href="/admin/products" className="rounded-3xl border border-line bg-panel p-6">
          <p className="text-sm text-muted">Products</p>
          <p className="font-serif text-4xl">{products}</p>
        </Link>
        <Link href="/admin/orders" className="rounded-3xl border border-line bg-panel p-6">
          <p className="text-sm text-muted">Orders</p>
          <p className="font-serif text-4xl">{orders}</p>
        </Link>
        <div className="rounded-3xl border border-line bg-panel p-6">
          <p className="text-sm text-muted">Awaiting payment</p>
          <p className="font-serif text-4xl">{pending}</p>
        </div>
      </div>
    </div>
  );
}
