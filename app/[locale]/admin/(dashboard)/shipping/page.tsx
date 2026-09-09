import { getPrisma } from "@/lib/db";
import { saveRegionAction } from "../../actions";

export default async function AdminShippingPage() {
  const regions = await getPrisma().shippingRegion.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <h1 className="font-serif text-4xl text-forest">Shipping regions</h1>
      <ul className="mt-6 space-y-4">
        {regions.map((region) => (
          <li key={region.id} className="rounded-3xl border border-line bg-panel p-4">
            <form action={saveRegionAction} className="grid gap-2 md:grid-cols-3">
              <input type="hidden" name="id" value={region.id} />
              <input name="slug" defaultValue={region.slug} className="rounded-xl border border-line px-3 py-2" />
              <input name="nameEn" defaultValue={region.nameEn} className="rounded-xl border border-line px-3 py-2" />
              <input name="nameKa" defaultValue={region.nameKa} className="rounded-xl border border-line px-3 py-2" />
              <label className="text-sm">
                GEL
                <input
                  name="priceGel"
                  type="number"
                  step="0.01"
                  defaultValue={(region.priceGel / 100).toFixed(2)}
                  className="mt-1 w-full rounded-xl border border-line px-3 py-2"
                />
              </label>
              <label className="text-sm">
                USD
                <input
                  name="priceUsd"
                  type="number"
                  step="0.01"
                  defaultValue={(region.priceUsd / 100).toFixed(2)}
                  className="mt-1 w-full rounded-xl border border-line px-3 py-2"
                />
              </label>
              <label className="text-sm">
                Sort
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={region.sortOrder}
                  className="mt-1 w-full rounded-xl border border-line px-3 py-2"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="active" defaultChecked={region.active} />
                Active
              </label>
              <button className="rounded-full bg-forest px-4 py-2 text-panel" type="submit">
                Save
              </button>
            </form>
          </li>
        ))}
      </ul>
      <form action={saveRegionAction} className="mt-8 grid gap-2 rounded-3xl border border-dashed border-line p-4 md:grid-cols-3">
        <input name="slug" placeholder="slug" className="rounded-xl border border-line px-3 py-2" />
        <input name="nameEn" placeholder="Name EN" className="rounded-xl border border-line px-3 py-2" />
        <input name="nameKa" placeholder="სახელი" className="rounded-xl border border-line px-3 py-2" />
        <input name="priceGel" type="number" step="0.01" placeholder="GEL" className="rounded-xl border border-line px-3 py-2" />
        <input name="priceUsd" type="number" step="0.01" placeholder="USD" className="rounded-xl border border-line px-3 py-2" />
        <input name="sortOrder" type="number" defaultValue={10} className="rounded-xl border border-line px-3 py-2" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked />
          Active
        </label>
        <button className="rounded-full border border-forest px-4 py-2" type="submit">
          Add region
        </button>
      </form>
    </div>
  );
}
