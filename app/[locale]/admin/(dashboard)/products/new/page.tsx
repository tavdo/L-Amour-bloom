import { getPrisma } from "@/lib/db";
import { ProductEditor } from "../product-editor";

export default async function NewProductPage() {
  const categories = await getPrisma().category.findMany({
    include: { translations: true },
    orderBy: { sortOrder: "asc" },
  });
  return (
    <div>
      <h1 className="mb-6 font-serif text-4xl text-forest">New product</h1>
      <ProductEditor categories={categories} />
    </div>
  );
}
