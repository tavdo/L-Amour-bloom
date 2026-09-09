export function SetupHint() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24">
      <div className="rounded-lg border border-line bg-panel p-8">
        <h1 className="font-serif text-4xl text-forest">Database is not connected yet</h1>
        <p className="mt-4 text-muted">
          Create a Neon Postgres database from the Vercel Marketplace, copy the pooled
          connection string into <code>DATABASE_URL</code> and the direct string into{" "}
          <code>DATABASE_URL_UNPOOLED</code>, then run:
        </p>
        <pre className="mt-6 overflow-x-auto rounded-2xl bg-forest-deep p-4 text-sm text-panel">
          {`cp .env.example .env.local
npx prisma migrate deploy
npm run db:seed
npm run dev`}
        </pre>
      </div>
    </div>
  );
}
