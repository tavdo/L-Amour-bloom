"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { saveProductAction, uploadImageAction } from "../../actions";

type Category = { id: string; slug: string; translations: { locale: string; name: string }[] };

type ProductInput = {
  id?: string;
  slug: string;
  sku?: string | null;
  categoryId: string;
  status: "DRAFT" | "PUBLISHED";
  featured: boolean;
  priceGel: number;
  priceUsd: number;
  nameEn: string;
  nameKa: string;
  descriptionEn: string;
  descriptionKa: string;
  imageUrls: string[];
};

export function ProductEditor({
  categories,
  product,
}: {
  categories: Category[];
  product?: ProductInput;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ProductInput>(
    product ?? {
      slug: "",
      sku: "",
      categoryId: categories[0]?.id ?? "",
      status: "DRAFT",
      featured: false,
      priceGel: 0,
      priceUsd: 0,
      nameEn: "",
      nameKa: "",
      descriptionEn: "",
      descriptionKa: "",
      imageUrls: [],
    },
  );
  const [error, setError] = useState<string | null>(null);

  async function onUpload(file: File) {
    const data = new FormData();
    data.set("file", file);
    const result = await uploadImageAction(data);
    setForm((current) => ({ ...current, imageUrls: [...current.imageUrls, result.url] }));
  }

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        try {
          const saved = await saveProductAction({
            ...form,
            sku: form.sku || undefined,
            priceGel: Math.round(Number(form.priceGel)),
            priceUsd: Math.round(Number(form.priceUsd)),
          });
          router.push(`/admin/products/${saved.id}`);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Save failed");
        }
      }}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={form.nameEn}
          onChange={(event) => setForm({ ...form, nameEn: event.target.value })}
          placeholder="Name (EN)"
          className="rounded-xl border border-line px-3 py-2"
        />
        <input
          value={form.nameKa}
          onChange={(event) => setForm({ ...form, nameKa: event.target.value })}
          placeholder="სახელი (KA)"
          className="rounded-xl border border-line px-3 py-2"
        />
        <input
          value={form.slug}
          onChange={(event) => setForm({ ...form, slug: event.target.value })}
          placeholder="slug"
          className="rounded-xl border border-line px-3 py-2"
        />
        <input
          value={form.sku ?? ""}
          onChange={(event) => setForm({ ...form, sku: event.target.value })}
          placeholder="SKU"
          className="rounded-xl border border-line px-3 py-2"
        />
        <label className="text-sm text-muted">
          Price GEL (tetri)
          <input
            type="number"
            value={form.priceGel}
            onChange={(event) => setForm({ ...form, priceGel: Number(event.target.value) })}
            className="mt-1 block w-full rounded-xl border border-line px-3 py-2"
          />
        </label>
        <label className="text-sm text-muted">
          Price USD (cents)
          <input
            type="number"
            value={form.priceUsd}
            onChange={(event) => setForm({ ...form, priceUsd: Number(event.target.value) })}
            className="mt-1 block w-full rounded-xl border border-line px-3 py-2"
          />
        </label>
        <select
          value={form.categoryId}
          onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
          className="rounded-xl border border-line px-3 py-2"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.translations.find((item) => item.locale === "en")?.name ?? category.slug}
            </option>
          ))}
        </select>
        <select
          value={form.status}
          onChange={(event) =>
            setForm({ ...form, status: event.target.value as ProductInput["status"] })
          }
          className="rounded-xl border border-line px-3 py-2"
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </div>
      <textarea
        value={form.descriptionEn}
        onChange={(event) => setForm({ ...form, descriptionEn: event.target.value })}
        placeholder="Description EN"
        className="w-full rounded-xl border border-line px-3 py-2"
      />
      <textarea
        value={form.descriptionKa}
        onChange={(event) => setForm({ ...form, descriptionKa: event.target.value })}
        placeholder="აღწერა KA"
        className="w-full rounded-xl border border-line px-3 py-2"
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.featured}
          onChange={(event) => setForm({ ...form, featured: event.target.checked })}
        />
        Featured
      </label>
      <div>
        <p className="text-sm text-muted">Images (Vercel Blob or pasted https URL)</p>
        <input
          type="file"
          accept="image/*"
          className="mt-2"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void onUpload(file);
          }}
        />
        <input
          placeholder="https://..."
          className="mt-2 w-full rounded-xl border border-line px-3 py-2"
          onBlur={(event) => {
            const value = event.target.value.trim();
            if (!value) return;
            setForm((current) => ({ ...current, imageUrls: [...current.imageUrls, value] }));
            event.target.value = "";
          }}
        />
        <ul className="mt-2 space-y-1 text-sm">
          {form.imageUrls.map((url) => (
            <li key={url} className="truncate text-muted">
              {url}
            </li>
          ))}
        </ul>
      </div>
      {error ? <p className="text-clay">{error}</p> : null}
      <button className="rounded-full bg-forest px-5 py-2 text-panel" type="submit">
        Save
      </button>
    </form>
  );
}
