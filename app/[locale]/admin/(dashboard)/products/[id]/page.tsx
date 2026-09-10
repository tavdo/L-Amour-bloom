import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/db";
import { ProductEditor } from "../product-editor";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const prisma = getPrisma();
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        translations: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { id: "asc" } },
      },
    }),
    prisma.category.findMany({ include: { translations: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  if (!product) notFound();
  const en = product.translations.find((item) => item.locale === "en");
  const ka = product.translations.find((item) => item.locale === "ka");

  return (
    <div>
      <h1 className="mb-6 font-serif text-4xl text-forest">Edit product</h1>
      <ProductEditor
        categories={categories}
        hasMultipleVariants={product.variants.length > 1}
        product={{
          id: product.id,
          slug: product.slug,
          sku: product.sku,
          categoryId: product.categoryId,
          status: product.status,
          featured: product.featured,
          priceGel: product.priceGel / 100,
          priceUsd: product.priceUsd / 100,
          stock: product.variants[0]?.stock ?? 0,
          nameEn: en?.name ?? "",
          nameKa: ka?.name ?? "",
          descriptionEn: en?.description ?? "",
          descriptionKa: ka?.description ?? "",
          imageUrls: product.images.map((image) => image.url),
        }}
      />
    </div>
  );
}
