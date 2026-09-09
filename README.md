# L'Amour Bloom

Handmade, mixed-media flower shop for Georgia-wide delivery (**სიყვარულის ყვავილობა**). Built for **Vercel** (Next.js 16 App Router, serverless-safe storage, pooled Postgres).

## Stack

- Next.js 16 (App Router, Turbopack, no custom Webpack config)
- TypeScript strict
- Tailwind CSS
- PostgreSQL on **Neon** via Vercel Marketplace (not the retired “Vercel Postgres” product)
- Prisma with `@prisma/adapter-neon` and Neon’s **pooled** connection string
- Images: Vercel Blob for admin uploads; catalog seed uses remote placeholder photos
- Payments: **Bank of Georgia** and **TBC E-Commerce** (buyer chooses). Local/dev can use `PAYMENTS_MODE=mock`
- i18n: English default (`/`), Georgian at `/ka`
- Prices stored in GEL (tetri) and USD (cents). Card charges always go out in **GEL**

Node.js **>= 20.9** locally (see `.nvmrc`).

## Local setup

```bash
cp .env.example .env.local
```

Fill at least:

- `DATABASE_URL` — Neon **pooled** URL (hostname contains `-pooler`)
- `DATABASE_URL_UNPOOLED` — Neon **direct** URL (for migrations)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — first admin, used by seed
- `SESSION_SECRET` — long random string
- `PAYMENTS_MODE=mock` until BOG/TBC credentials exist

Then:

```bash
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin: `/admin/login`.

Without a database, the storefront shows a short setup hint instead of crashing the whole app.

## Deploy on Vercel

1. Push the repo and import the project in Vercel. Framework preset: Next.js. Node 20.x or 22.x.
2. **Postgres:** Vercel Dashboard → the project → **Storage** / **Marketplace** → add **Neon**. Copy:
   - pooled connection → `DATABASE_URL`
   - direct connection → `DATABASE_URL_UNPOOLED`
3. **Blob:** Marketplace → **Blob** store → add `BLOB_READ_WRITE_TOKEN`.
4. Set the remaining env vars from `.env.example` (empty names only in git). Production should use `PAYMENTS_MODE=live` once bank keys work.
5. Deploy. Vercel runs `prisma generate` on install (`postinstall`) and `prisma generate && next build`.
6. Apply schema once (Vercel CLI, Neon SQL editor, or a one-off command):

```bash
npx prisma migrate deploy
npm run db:seed
```

7. Bank webhooks (Node.js runtime, not Edge):
   - BOG `callback_url`: `https://YOUR_DOMAIN/api/webhooks/bog`
   - TBC callback: `https://YOUR_DOMAIN/api/webhooks/tbc` (also register it on [ecom.tbcpayments.ge](https://ecom.tbcpayments.ge/); allow POST from TBC’s documented IPs)

Do **not** write uploads or SQLite to the local filesystem. Serverless disks are ephemeral.

## Payments

| Mode | Behaviour |
| --- | --- |
| `PAYMENTS_MODE=mock` | Checkout redirects to an in-site confirm/fail page. No bank calls. |
| `PAYMENTS_MODE=live` | Redirects to BOG or TBC hosted checkout. Webhooks mark the order paid. |

Webhooks are **idempotent** (`PaymentEvent.idempotencyKey`). Repeating the same payload does not double-complete an order. BOG callbacks verify `Callback-Signature` (RSA-SHA256) on the **raw** body. TBC callbacks acknowledge 200 and then **fetch payment status** from TBC’s API.

Heavy work (bulk email) is not on the checkout request path.

## Project layout

```
app/[locale]/     storefront, checkout, admin
app/api/          cart resolver + payment webhooks (nodejs)
components/       UI
lib/              db, auth, payments, catalog
prisma/           schema + migration
messages/         en.json, ka.json
proxy.ts          Next 16 request proxy (next-intl routing)
```
