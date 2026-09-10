import { getPrisma } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { DeleteProductButton } from "./delete-product-button";

export default async function AdminProductsPage() {
  const products = await getPrisma().product.findMany({
    orderBy: { updatedAt: "desc" },
    include: { translations: true, category: { include: { translations: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-4xl text-forest">Products</h1>
        <Link href="/admin/products/new" className="rounded-full bg-forest px-4 py-2 text-panel">
          New product
        </Link>
      </div>
      {products.length === 0 ? (
        <p className="mt-6 rounded-3xl border border-line bg-panel px-4 py-8 text-muted">
          No products yet. Add one to show it on the shop.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-3xl border border-line bg-panel">
          {products.map((product) => {
            const name =
              product.translations.find((item) => item.locale === "en")?.name ?? product.slug;
            return (
              <li key={product.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium">{name}</p>
                  <p className="text-sm text-muted">
                    {product.status} · {product.slug}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Link href={`/admin/products/${product.id}`} className="text-sm text-forest">
                    Edit
                  </Link>
                  <DeleteProductButton id={product.id} name={name} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
