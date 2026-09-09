import { getPrisma } from "@/lib/db";
import { createAdminAction } from "../../actions";

export default async function AdminUsersPage() {
  const admins = await getPrisma().adminUser.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h1 className="font-serif text-4xl text-forest">Admins</h1>
      <ul className="mt-6 divide-y divide-line rounded-3xl border border-line bg-panel">
        {admins.map((admin) => (
          <li key={admin.id} className="px-4 py-3">
            <p className="font-medium">{admin.name}</p>
            <p className="text-sm text-muted">{admin.email}</p>
          </li>
        ))}
      </ul>
      <form action={createAdminAction} className="mt-8 max-w-md space-y-3 rounded-3xl border border-line bg-panel p-4">
        <input name="name" required placeholder="Name" className="w-full rounded-xl border border-line px-3 py-2" />
        <input name="email" type="email" required placeholder="Email" className="w-full rounded-xl border border-line px-3 py-2" />
        <input
          name="password"
          type="password"
          required
          minLength={10}
          placeholder="Password (10+ chars)"
          className="w-full rounded-xl border border-line px-3 py-2"
        />
        <button className="rounded-full bg-forest px-4 py-2 text-panel" type="submit">
          Add admin
        </button>
      </form>
    </div>
  );
}
