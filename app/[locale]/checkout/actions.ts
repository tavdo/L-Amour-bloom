"use server";

import { z } from "zod";
import { updateTag } from "next/cache";
import { getPrisma } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { startPayment } from "@/lib/payments";
import type { PaymentProvider } from "@/generated/prisma";

const checkoutSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  phone: z.string().min(5),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  regionId: z.string().min(1),
  notes: z.string().optional(),
  provider: z.enum(["BOG", "TBC"]),
  currency: z.enum(["GEL", "USD"]),
  locale: z.enum(["en", "ka"]),
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string().optional(),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1),
});

export async function placeOrder(input: z.infer<typeof checkoutSchema>) {
  const data = checkoutSchema.parse(input);
  const prisma = getPrisma();
  const region = await prisma.shippingRegion.findFirst({
    where: { id: data.regionId, active: true },
  });
  if (!region) {
    throw new Error("Unknown shipping region");
  }

  const lines = [];
  let subtotalGel = 0;
  let subtotalUsd = 0;

  for (const item of data.items) {
    const product = await prisma.product.findFirst({
      where: { id: item.productId, status: "PUBLISHED" },
      include: { translations: true, variants: true },
    });
    if (!product) {
      throw new Error("A product in the cart is no longer available");
    }
    const variant = item.variantId
      ? product.variants.find((entry) => entry.id === item.variantId)
      : product.variants[0];
    if (variant && variant.stock < item.quantity) {
      throw new Error("Insufficient stock");
    }
    const unitGel = variant?.priceGel ?? product.priceGel;
    const unitUsd = variant?.priceUsd ?? product.priceUsd;
    const translation =
      product.translations.find((entry) => entry.locale === data.locale) ??
      product.translations[0];
    subtotalGel += unitGel * item.quantity;
    subtotalUsd += unitUsd * item.quantity;
    lines.push({
      productId: product.id,
      variantId: variant?.id,
      name: translation?.name ?? product.slug,
      quantity: item.quantity,
      unitPriceGel: unitGel,
      unitPriceUsd: unitUsd,
    });
  }

  const number = `AF-${Date.now().toString(36).toUpperCase()}`;
  const order = await prisma.order.create({
    data: {
      number,
      locale: data.locale,
      customerName: data.name,
      customerEmail: data.email,
      customerPhone: data.phone,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2 ?? "",
      city: data.city,
      notes: data.notes ?? "",
      shippingRegionId: region.id,
      subtotalGel,
      shippingGel: region.priceGel,
      totalGel: subtotalGel + region.priceGel,
      subtotalUsd,
      shippingUsd: region.priceUsd,
      totalUsd: subtotalUsd + region.priceUsd,
      displayCurrency: data.currency,
      paymentProvider: data.provider as PaymentProvider,
      items: { create: lines },
    },
  });

  const payment = await startPayment(data.provider, {
    orderId: order.id,
    orderNumber: order.number,
    totalGelMajor: (subtotalGel + region.priceGel) / 100,
    locale: data.locale,
    description: order.number,
    basket: lines.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      unitPriceGelMajor: line.unitPriceGel / 100,
    })),
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { providerOrderId: payment.providerOrderId },
  });

  updateTag(CACHE_TAGS.orders);

  return { redirectUrl: payment.redirectUrl, orderId: order.id };
}
