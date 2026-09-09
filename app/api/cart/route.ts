import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPrisma } from "@/lib/db";
import { normalizeCart } from "@/lib/cart";

export const runtime = "nodejs";

const itemSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1).max(20),
});

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("items");
  if (!raw) {
    return NextResponse.json({ items: [] });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ items: [] }, { status: 400 });
  }

  const items = normalizeCart(z.array(itemSchema).parse(parsed));
  const prisma = getPrisma();
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((item) => item.productId) }, status: "PUBLISHED" },
    include: {
      translations: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: true,
    },
  });

  const resolved = items.flatMap((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product) return [];
    const variant = item.variantId
      ? product.variants.find((entry) => entry.id === item.variantId)
      : product.variants[0];
    const translation =
      product.translations.find((entry) => entry.locale === "en") ??
      product.translations[0];
    return [
      {
        productId: product.id,
        variantId: variant?.id,
        name: translation?.name ?? product.slug,
        imageUrl: product.images[0]?.url,
        quantity: item.quantity,
        unitPriceGel: variant?.priceGel ?? product.priceGel,
        unitPriceUsd: variant?.priceUsd ?? product.priceUsd,
      },
    ];
  });

  return NextResponse.json({ items: resolved });
}
