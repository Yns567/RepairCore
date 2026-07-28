# RepairCore

RepairCore is a Next.js storefront for mobile-repair technicians. It includes:

- Hardware products, categories, cart, checkout and customer orders
- Software subscriptions and short-term tool rentals
- Internal USD store balance with an immutable transaction history
- IMEI/device checks, external tool-credit packs and rental requests
- Customer and administrator dashboards

RepairCore does not offer IMEI alteration or spoofing, and service orders require
the customer to confirm ownership or authorization.

## Live demo

The current public demo is available at
[repaircore.vercel.app](https://repaircore.vercel.app). It runs on Vercel with a
Neon PostgreSQL database.

## Local setup

Requirements: Node.js, PostgreSQL and npm.

1. Copy `.env.example` to `.env` and enter the local database URL and strong secrets.
2. Install packages with `npm install`.
3. Apply the database migrations:

   ```powershell
   npx prisma migrate deploy
   ```

4. Add the demo catalog:

   ```powershell
   npm run db:seed
   ```

5. Create the first administrator:

   ```powershell
   $env:ADMIN_EMAIL="owner@example.com"
   $env:ADMIN_PASSWORD="choose-a-long-unique-password"
   npm run admin:create
   ```

6. Start the site on the computer and local Wi-Fi:

   ```powershell
   npm run dev -- --hostname 0.0.0.0 --port 3001
   ```

Open `http://localhost:3001`. A phone on the same Wi-Fi can use the computer's
local IPv4 address, for example `http://192.168.1.20:3001`.

## Production checks

Before every deployment:

```powershell
npm run lint
npx tsc --noEmit
npm run build
npx prisma migrate deploy
```

Keep `.env` private. Production must use unique values for `AUTH_SECRET`,
`NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` and `DATA_ENCRYPTION_KEY`. Rotating
`DATA_ENCRYPTION_KEY` without migrating existing records makes encrypted IMEI
values unreadable.

## Free internet demo

The simplest demo stack for this project is:

- [Vercel Hobby](https://vercel.com/docs/plans/hobby) for Next.js and the free
  `*.vercel.app` HTTPS address
- [Neon Free](https://neon.com/pricing) for PostgreSQL

Vercel Hobby is intended for personal, non-commercial use. Use it only to test
the site; move to a commercial plan before accepting real orders or payments.

Deployment outline:

1. Create a Neon project and copy both the pooled and direct connection strings.
2. Add all values from `.env.example` to the Vercel project's environment variables.
3. Set `DATABASE_URL` to the pooled Neon URL and `DIRECT_URL` to the direct URL.
4. Apply migrations and seed data against Neon from this project folder.
5. Create a public Vercel Blob store named `product-images` and connect it to
   the Production and Preview environments of this Vercel project.
6. Import the GitHub repository into Vercel and deploy it.
7. Set `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to the final `https://...vercel.app`
   address, then redeploy.

For a commercial store, a paid hosting plan and a purchased domain are safer than
a free-domain service. A platform subdomain is the most reliable free test address.

## Product images

Only images with clear reuse terms should be published. Attribution for the
licensed demo photographs is available at `/image-credits`. Branded products keep
the neutral placeholder until the supplier provides authorized product photos.
New images uploaded from the production admin dashboard are stored permanently
in the connected public Vercel Blob store. JPG, PNG and WebP files up to 4 MB are
accepted.
