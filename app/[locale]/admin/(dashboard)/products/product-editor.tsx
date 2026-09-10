"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { deleteProductAction, saveProductAction, uploadImageAction } from "../../actions";

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
  stock: number;
  nameEn: string;
  nameKa: string;
  descriptionEn: string;
  descriptionKa: string;
  imageUrls: string[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductEditor({
  categories,
  product,
  hasMultipleVariants = false,
}: {
  categories: Category[];
  product?: ProductInput;
  hasMultipleVariants?: boolean;
}) {
  const router = useRouter();
  const isNew = !product?.id;
  const [slugLocked, setSlugLocked] = useState(!isNew);
  const [form, setForm] = useState<ProductInput>(
    product ?? {
      slug: "",
      sku: "",
      categoryId: categories[0]?.id ?? "",
      status: "PUBLISHED",
      featured: false,
      priceGel: 0,
      priceUsd: 0,
      stock: 10,
      nameEn: "",
      nameKa: "",
      descriptionEn: "",
      descriptionKa: "",
      imageUrls: [],
    },
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onUpload(file: File) {
    const data = new FormData();
    data.set("file", file);
    const result = await uploadImageAction(data);
    setForm((current) => ({ ...current, imageUrls: [...current.imageUrls, result.url] }));
  }

  async function onDelete() {
    if (!form.id) return;
    if (!window.confirm("Remove this product from the shop?")) return;
    setError(null);
    try {
      await deleteProductAction(form.id);
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Remove failed");
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setSaving(true);
        try {
          const saved = await saveProductAction({
            ...form,
            slug: form.slug || slugify(form.nameEn),
            sku: form.sku || undefined,
            priceGel: Number(form.priceGel),
            priceUsd: Number(form.priceUsd),
            stock: Math.round(Number(form.stock)),
          });
          router.push(`/admin/products/${saved.id}`);
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Save failed");
        } finally {
          setSaving(false);
        }
      }}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <input
          value={form.nameEn}
          onChange={(event) => {
            const nameEn = event.target.value;
            setForm((current) => ({
              ...current,
              nameEn,
              slug: slugLocked ? current.slug : slugify(nameEn),
            }));
          }}
          placeholder="Name (EN)"
          required
          className="rounded-xl border border-line px-3 py-2"
        />
        <input
          value={form.nameKa}
          onChange={(event) => setForm({ ...form, nameKa: event.target.value })}
          placeholder="სახელი (KA)"
          required
          className="rounded-xl border border-line px-3 py-2"
        />
        <input
          value={form.slug}
          onChange={(event) => {
            setSlugLocked(true);
            setForm({ ...form, slug: event.target.value });
          }}
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
          Price (GEL)
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.priceGel}
            onChange={(event) => setForm({ ...form, priceGel: Number(event.target.value) })}
            className="mt-1 block w-full rounded-xl border border-line px-3 py-2 text-forest"
          />
        </label>
        <label className="text-sm text-muted">
          Price (USD)
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.priceUsd}
            onChange={(event) => setForm({ ...form, priceUsd: Number(event.target.value) })}
            className="mt-1 block w-full rounded-xl border border-line px-3 py-2 text-forest"
          />
        </label>
        {!hasMultipleVariants ? (
          <label className="text-sm text-muted">
            Stock
            <input
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(event) => setForm({ ...form, stock: Number(event.target.value) })}
              className="mt-1 block w-full rounded-xl border border-line px-3 py-2 text-forest"
            />
          </label>
        ) : (
          <p className="self-center text-sm text-muted">
            This product has size/color options. Stock stays on those options.
          </p>
        )}
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
          <option value="DRAFT">Draft (hidden)</option>
          <option value="PUBLISHED">Published (on the shop)</option>
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
        Featured on the home page
      </label>
      <div>
        <p className="text-sm text-muted">Images (upload or paste an https URL)</p>
        <input
          type="file"
          accept="image/*"
          className="mt-2"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void onUpload(file);
            event.target.value = "";
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
            <li key={url} className="flex items-center justify-between gap-3 truncate text-muted">
              <span className="truncate">{url}</span>
              <button
                type="button"
                className="shrink-0 text-clay"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    imageUrls: current.imageUrls.filter((item) => item !== url),
                  }))
                }
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
      {error ? <p className="text-clay">{error}</p> : null}
      <div className="flex flex-wrap gap-3">
        <button className="rounded-full bg-forest px-5 py-2 text-panel" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        {form.id ? (
          <button
            className="rounded-full border border-clay px-5 py-2 text-clay"
            type="button"
            onClick={() => void onDelete()}
          >
            Remove from shop
          </button>
        ) : null}
      </div>
    </form>
  );
}
