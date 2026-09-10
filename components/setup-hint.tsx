export function SetupHint() {
  const onVercel = process.env.VERCEL === "1";

  return (
    <div className="mx-auto max-w-2xl px-4 py-24">
      <div className="rounded-lg border border-line bg-panel p-8">
        <h1 className="font-serif text-4xl text-forest">Database is not connected yet</h1>
        <p className="mt-4 text-muted">
          {onVercel
            ? "Add a Neon Postgres database in the Vercel dashboard (Storage → Create Database → Neon) and connect it to this project. The next deploy will create tables and seed the catalog."
            : "Create a Neon Postgres database from the Vercel Marketplace, copy the pooled connection string into DATABASE_URL and the direct string into DATABASE_URL_UNPOOLED, then run:"}
        </p>
        {!onVercel ? (
          <pre className="mt-6 overflow-x-auto rounded-2xl bg-forest-deep p-4 text-sm text-panel">
            {`cp .env.example .env.local
npx prisma migrate deploy
npm run db:seed
npm run dev`}
          </pre>
        ) : (
          <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-forest">
            <li>Vercel project → Storage → Create Database → Neon</li>
            <li>Connect it to Production and Preview</li>
            <li>
              Settings → Environment Variables: set <code>SESSION_SECRET</code>,{" "}
              <code>ADMIN_EMAIL</code>, and <code>ADMIN_PASSWORD</code>
            </li>
            <li>Deployments → Redeploy the latest production build</li>
          </ol>
        )}
      </div>
    </div>
  );
}
