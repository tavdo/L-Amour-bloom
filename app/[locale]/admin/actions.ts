"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { updateTag } from "next/cache";
import {
  createAdminSession,
  destroyAdminSession,
  getCurrentAdmin,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { uploadProductImage } from "@/lib/blob";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const password = String(formData.get("password") ?? "");
  const locale = String(formData.get("locale") ?? "en");
  const prisma = getPrisma();
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    redirect(locale === "ka" ? "/ka/admin/login?error=1" : "/admin/login?error=1");
  }
  await createAdminSession(admin.id);
  redirect(locale === "ka" ? "/ka/admin" : "/admin");
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}

const productSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(2),
  sku: z.string().optional(),
  categoryId: z.string(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  featured: z.boolean(),
  priceGel: z.number().int().nonnegative(),
  priceUsd: z.number().int().nonnegative(),
  nameEn: z.string().min(2),
  nameKa: z.string().min(2),
  descriptionEn: z.string(),
  descriptionKa: z.string(),
  imageUrls: z.array(z.string().url()).max(8),
});

export async function saveProductAction(input: z.infer<typeof productSchema>) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("Unauthorized");
  const data = productSchema.parse(input);
  const prisma = getPrisma();

  const payload = {
    slug: data.slug,
    sku: data.sku || null,
    categoryId: data.categoryId,
    status: data.status,
    featured: data.featured,
    priceGel: data.priceGel,
    priceUsd: data.priceUsd,
  };

  const product = data.id
    ? await prisma.product.update({
        where: { id: data.id },
        data: payload,
      })
    : await prisma.product.create({ data: payload });

  await prisma.productTranslation.deleteMany({ where: { productId: product.id } });
  await prisma.productTranslation.createMany({
    data: [
      { productId: product.id, locale: "en", name: data.nameEn, description: data.descriptionEn },
      { productId: product.id, locale: "ka", name: data.nameKa, description: data.descriptionKa },
    ],
  });

  await prisma.productImage.deleteMany({ where: { productId: product.id } });
  await prisma.productImage.createMany({
    data: data.imageUrls.map((url, index) => ({
      productId: product.id,
      url,
      alt: data.nameEn,
      sortOrder: index,
    })),
  });

  updateTag(CACHE_TAGS.products);
  updateTag(CACHE_TAGS.product(product.slug));
  return { id: product.id };
}

export async function uploadImageAction(formData: FormData) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("Unauthorized");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Missing file");
  }
  return { url: await uploadProductImage(file) };
}

export async function updateOrderStatusAction(orderId: string, status: string) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("Unauthorized");
  const allowed = ["PENDING_PAYMENT", "PAID", "FAILED", "CANCELLED", "PROCESSING", "SHIPPED", "DELIVERED"] as const;
  if (!allowed.includes(status as (typeof allowed)[number])) {
    throw new Error("Invalid status");
  }
  const prisma = getPrisma();
  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as (typeof allowed)[number] },
  });
  updateTag(CACHE_TAGS.orders);
}

export async function saveRegionAction(formData: FormData) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("Unauthorized");
  const prisma = getPrisma();
  const id = String(formData.get("id") ?? "");
  const data = {
    slug: String(formData.get("slug") ?? ""),
    nameEn: String(formData.get("nameEn") ?? ""),
    nameKa: String(formData.get("nameKa") ?? ""),
    priceGel: Math.round(Number(formData.get("priceGel")) * 100),
    priceUsd: Math.round(Number(formData.get("priceUsd")) * 100),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    active: formData.get("active") === "on",
  };
  if (id) {
    await prisma.shippingRegion.update({ where: { id }, data });
  } else {
    await prisma.shippingRegion.create({ data });
  }
  updateTag(CACHE_TAGS.shipping);
}

export async function createAdminAction(formData: FormData) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("Unauthorized");
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const name = String(formData.get("name") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < 10) throw new Error("Password too short");
  const prisma = getPrisma();
  await prisma.adminUser.create({
    data: {
      email,
      name,
      passwordHash: await hashPassword(password),
    },
  });
}
