# Project Overview

**زهرة الخليج (Gulf Flower)** — Full Arabic RTL ecommerce + POS + owner analytics platform for a women's fashion store in Egypt.

- **Live URL:** https://zahrtelkhlig.vercel.app
- **GitHub:** https://github.com/SherifAsh93/Zahrtelkhlig
- **Vercel project:** https://vercel.com/sherifs-projects-75c57a99/zahrtelkhlig
- **Status:** Active — POS is the primary day-to-day surface for in-store staff; storefront/admin/owner areas are maintenance-mode
- **Admin password:** `12311` (rotated 2026-08-02; was `114891`)
- **Last major update:** 2026-08-02 — see [Recent Changes](#recent-changes-2026-08-02) below

---

## Prerequisites

To run or modify this project you need:

| Requirement | Notes |
|---|---|
| **Node.js** | v20+ (tested with v24.14.0). `npm` ships with it. |
| **Git** | Repo is at github.com/SherifAsh93/Zahrtelkhlig |
| **Vercel account** | Owns the deployment + all production secrets. Login: `sherifash93` |
| **Vercel CLI** | `npx vercel` — no global install needed |
| **A Neon Postgres database** | Already provisioned and linked to the Vercel project; you don't need to create one to work on this repo |
| **GitHub Personal Access Token** (`repo` scope) | Only needed if testing image upload/media library locally — production already has one configured |

You do **not** need to know any database URLs or secrets yourself to develop locally — see [Getting Environment Variables](#getting-environment-variables-without-knowing-any-secrets) below.

---

## Features

### Customer Storefront (`/`)
- Full Arabic RTL UI with Tailwind CSS 4
- Product catalog with category filter, search, season filter
- Product detail with size/color selection and per-variant stock
- Shopping cart (Zustand 5 + localStorage, persists without login)
- Wishlist (requires login)
- Checkout flow: Vodafone Cash / InstaPay / Cash on Delivery / Bank Transfer
- Order tracking with status timeline
- Customer account: register, login, profile management
- Homepage with live banners, featured categories, featured products

### Admin Panel (`/admin`) — Password: `12311`
- Dashboard with live KPI stats (orders, revenue, low-stock alerts)
- Product CRUD: add/edit/delete with image upload, size-stock grid, color-image variants
- Bulk product deletion (blocked by design once a product has real order/return history — see [Known Issues](#known-issues))
- Order management: view, update status, filter by source/status
- Inventory control: per-size stock editing across all products
- User & staff management (promote to STAFF/OWNER/ADMIN)
- Category management with images and sort order
- Banner management (homepage hero banners)
- Media library: drag-and-drop multi-upload, delete images, browse by folder
- Homepage settings: featured products, category selection
- Daily sales reports: online vs in-store breakdown by date
- **Admin is the only place that can edit or delete existing products, categories, banners, users, or media** — staff can only *add* new products (see POS below)

### POS Terminal (`/pos`) — Staff role
The primary tool store employees use for every in-person sale.

- **Login:** staff log in with `username` + password (STAFF role in DB). The username `admin` + admin password also works, logging in as the real admin account.
- **Sell:** product grid with search/season filter, size/color variant picker, cart with quantity + discount, checkout with 4 payment method options, automatic thermal receipt printing.
- **Add product** (`/pos/products/new`): staff can add brand-new products with full detail — bilingual name, price, SKU, season, color+size+quantity variants, images (upload from device, drag-and-drop, paste a URL, or pick from the shared media library). Products go live immediately. Each product is stamped with `createdByName` so admin can see which staff member added it — admin-created products leave this `null`.
- **Returns** (`/pos/returns`): staff search a past sale by order number, see per-item sold/already-returned/returnable quantities, pick what's being returned, optionally record a reason and refund method, and confirm. This:
  - decrements that order's `total`/`subtotal` by the refunded amount (floored at 0), so every revenue report (admin, owner, daily) reflects it automatically — no report code needed to change
  - restocks the returned quantity back into inventory
  - is blocked from over-returning (can't return more than was actually sold, even across multiple partial returns) — enforced server-side against prior `ReturnItem` records, not just client-side
- **Mobile fallback:** `/pos` works from any phone browser with its own internet connection (not just the store PC) — useful if the PC loses connectivity. No separate app; same URL, touch-optimized (16px inputs to avoid iOS zoom-on-focus, 32px+ tap targets, safe-area padding for notches/home indicators). Printing on a phone surfaces the OS's native print sheet (AirPrint/AndroidPrint) since there's no phone equivalent of Chrome's `--kiosk-printing`.
- **Silent thermal printing:** the page auto-triggers `window.print()` right after every sale. For it to be fully silent (no dialog) on the store PC, Chrome must be launched with `--kiosk-printing` — see `docs/11_POS_Silent_Printing_Setup.md` and the ready-made `docs/pos-launcher.bat` for the one-time setup.
- Tracks which staff member made each sale (`Order.userId` → the logged-in staff account)

### Owner Dashboard (`/owner`) — Open access (no password)
- KPI cards: today / this week / this month / all-time revenue
- 30-day rolling sales chart (online vs in-store)
- Sales split pie: online vs POS
- Top-selling products list
- Low-stock inventory alerts
- Activity feed: latest orders, new customers, stock alerts
- Sub-pages: `/owner/daily` (detailed daily report), `/owner/orders`, `/owner/products`
- Auto-refresh (`/owner` and `/owner/orders` every 15s; `/owner/daily` every 2 min) via `setInterval`

---

## Tech Stack

| Technology | Version | Usage |
|---|---|---|
| Next.js | 16.2.6 | App Router framework (Turbopack build) |
| React | 19.2.4 | UI library |
| TypeScript | 5 | Language |
| TailwindCSS | 4 | Styling (PostCSS plugin) |
| Prisma | 7.8.0 | ORM |
| @prisma/adapter-neon | 7.8.0 | Neon serverless adapter |
| @neondatabase/serverless | 1.1.0 | Neon HTTP driver |
| PostgreSQL (Neon) | — | Database (cloud, serverless) |
| jose | 6.2.3 | JWT session signing/verification |
| bcryptjs | 3.0.3 | Password hashing |
| Zustand | 5.0.13 | Cart state management |
| Lucide React | 1.16.0 | Icon library |
| GitHub API + jsDelivr CDN | — | Image storage and delivery |
| sharp | 0.34.5 | Server-side image processing |
| Vercel | — | Hosting and CI/CD |

**Dev tools:** ESLint 9, ts-node (for seeding), Vercel CLI

---

## Folder Structure

```
zahrtelkhlig/
├── src/
│   ├── app/
│   │   ├── (store)/             # Customer-facing storefront (Arabic RTL)
│   │   ├── admin/                # Admin panel (password: 12311)
│   │   │   ├── products/         # Product CRUD + bulk delete
│   │   │   ├── orders/, inventory/, users/, categories/, banners/, media/, homepage/, reports/
│   │   ├── admin-login/          # Admin login page
│   │   ├── pos/                  # POS terminal for staff
│   │   │   ├── page.tsx          # Main sell screen
│   │   │   ├── layout.tsx        # STAFF/ADMIN session gate, mobile viewport config
│   │   │   ├── POSLoginView.tsx  # Login form (shown when not authenticated)
│   │   │   ├── products/new/     # Staff "add product" page (reuses admin ProductForm)
│   │   │   └── returns/          # Staff "process return" page
│   │   ├── owner/                # Owner analytics dashboard (open access)
│   │   ├── api/                  # REST API routes
│   │   │   ├── admin/            # Admin-protected (admin_session cookie)
│   │   │   │   ├── products/     # POST widened to accept POS STAFF/ADMIN too (see Auth Model)
│   │   │   │   ├── upload/, media/  # Image upload/library — POST/GET widened for POS staff
│   │   │   │   └── orders/, inventory/, users/, staff/, categories/, banners/, reports/, stats/, seed/
│   │   │   ├── pos/              # POS-protected (session cookie, role STAFF/ADMIN)
│   │   │   │   ├── me/           # Current staff session info
│   │   │   │   ├── products/     # Product search/lookup for the sell screen
│   │   │   │   ├── sale/         # Process a sale
│   │   │   │   ├── returns/      # Process a return
│   │   │   │   └── orders/lookup/ # Look up a past order by number (for returns)
│   │   │   └── owner/            # Owner analytics API routes (open access)
│   │   └── actions/               # Next.js Server Actions (login, logout, staff/user mgmt)
│   ├── components/
│   │   ├── admin/                 # Admin panel components (ProductForm is shared with POS)
│   │   ├── layout/, store/, ui/
│   ├── lib/                       # prisma.ts, session.ts (auth), utils.ts, homepage.ts
│   ├── store/                     # Zustand stores (cart)
│   ├── types/
│   └── generated/prisma/          # Prisma generated client (gitignored, regenerated on build)
├── prisma/
│   ├── schema.prisma               # Full DB schema
│   ├── migrations/                 # Tracked migration history (informational — see Database)
│   ├── seed.ts, seed.mjs, seed-categories.cjs
├── public/images/                  # Product/category/banner images (synced to GitHub, served via jsDelivr)
├── docs/                           # Additional documentation (numbered guides + POS printing setup)
├── vercel.json                     # Vercel build configuration
├── prisma.config.ts                # Prisma configuration (reads DATABASE_URL from env)
└── package.json
```

---

## Auth Model

There are **two independent auth mechanisms** — easy to mix up:

1. **`session` cookie** (JWT, `src/lib/session.ts` `createSession`/`getSession`) — used by the storefront, POS, and owner login. Payload carries `{ userId, email, role, name }`. Role is one of `USER`, `STAFF`, `OWNER`, `ADMIN`, checked per-route (e.g. POS requires `STAFF` or `ADMIN`).
2. **`admin_session` cookie** (separate JWT, `createAdminSession`/`getAdminSession`) — gates `/admin`, checked purely against the hardcoded password (`12311` in `src/app/actions/auth.ts`), unrelated to any `User` row.

**`getProductManagerSession()`** (`src/lib/session.ts`) bridges the two for product-management endpoints: it accepts *either* a valid `admin_session` *or* a `session` with role `STAFF`/`ADMIN`. This is what lets POS staff create products and upload images through the same admin API routes/components without a full duplicate implementation — see `/api/admin/products` (POST only), `/api/admin/upload`, `/api/admin/media` (GET only). Editing/deleting existing products, and everything else in `/admin`, still requires the real `admin_session`.

---

## Database

**Provider:** Neon PostgreSQL (serverless HTTP driver)
**ORM:** Prisma 7 with `@prisma/adapter-neon`
**Note:** there is only **one** database — no separate staging/dev database exists. Testing "locally" means testing against the same data real customers and staff use.

### Models

| Model | Key Fields | Notes |
|---|---|---|
| `User` | id (cuid), email (unique), username, password (bcrypt), name, phone, address, city, role | Roles: USER, STAFF, OWNER, ADMIN |
| `Category` | id, nameAr, nameEn, slug (unique), image, seasonal, sortOrder | Bilingual. Linked to products. |
| `Product` | id, nameAr, nameEn, descriptionAr/En, sku (unique), price, season, sizes[], sizeStock (JSON), variants (JSON), colorImages (JSON), stock, images[], featured, active, categoryId, **createdByName** | Season: WINTER/SUMMER. `createdByName` is set when a POS staff member creates the product (null for admin-created ones). |
| `Order` | id, orderNumber (unique), userId?, customerName, customerPhone, address, city, notes, status, source, paymentMethod, subtotal, discount, shipping, total | source: ONLINE/POS. status: PENDING→DELIVERED/CANCELLED. `total`/`subtotal` are decremented (not left immutable) when a return is processed against this order. |
| `OrderItem` | id, orderId, productId, nameAr, nameEn, price, quantity, size?, color?, image? | Snapshot of product at time of sale |
| `SaleReturn` | id, returnNumber (unique, `RET-XXXX`), orderId, orderNumber, staffName, reason?, refundMethod?, subtotal, createdAt | One record per return transaction, always tied to an original `Order` |
| `ReturnItem` | id, returnId, orderItemId, productId, nameAr, price, quantity, size?, color? | One row per returned line item, tied to the specific `OrderItem` — used to prevent over-returning |
| `Wishlist` | userId + productId (unique pair) | |
| `CartItem` | userId + productId (unique pair), quantity | Server-side cart (also Zustand for guests) |
| `Banner` | titleAr/En, subtitleAr/En, image, link, active, sortOrder | Homepage hero banners |
| `SiteSettings` | key (PK), value | Key-value store for homepage config |

### Enums

| Enum | Values |
|---|---|
| `Role` | USER, STAFF, OWNER, ADMIN |
| `OrderStatus` | PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED |
| `OrderSource` | ONLINE, POS |
| `Season` | WINTER, SUMMER |
| `PaymentMethod` | CASH_ON_DELIVERY, VODAFONE_CASH, INSTAPAY, BANK_TRANSFER |

### Referential integrity

`Order`, `OrderItem`, `SaleReturn`, `ReturnItem`, and `Product` are linked with `RESTRICT` foreign keys, not `CASCADE`. This is intentional: **a product that has ever been sold or returned cannot be deleted** — the admin bulk-delete/DELETE endpoints will fail with a 500 (Postgres FK violation) rather than silently corrupting order history. To retire a product that's already been transacted, set it inactive (`active: false`) instead of deleting it.

### Migrations

`prisma/migrations/` contains tracked migration SQL, but **production deploys via `prisma db push --accept-data-loss`** (see `vercel.json`), not `prisma migrate deploy` — so the migration files are informational/for local `prisma migrate dev` parity, not what actually runs on Vercel. `db push` applies `schema.prisma` directly to the database on every deploy.

---

## Getting Environment Variables (without knowing any secrets)

You never need to be told or paste `DATABASE_URL`, `SESSION_SECRET`, or `GITHUB_TOKEN` — pull them straight from Vercel, which already has them configured:

```bash
npx vercel link          # links this folder to the existing Vercel project (interactive first time)
npx vercel env pull .env.local --environment=production
```

**Important caveat:** these specific variables are marked **Sensitive** in the Vercel dashboard, which means `vercel env pull` returns them as **empty strings** (`DATABASE_URL=""`) — Vercel deliberately never lets a sensitive variable's value be retrieved again after creation, by anyone, via any method, including the account owner's own CLI. This is a security feature, not a bug. It means:
- You cannot get a working `.env.local` this way for these particular variables.
- Anyone needing to run this app against the real database locally must go into the Vercel Dashboard → Project → Settings → Environment Variables and manually reveal/copy the values themselves (if the account owner marked them non-recoverable even that may not be possible — the more common setup is they're just hidden from `env pull`/API but still viewable once in the dashboard UI by an authenticated team member).
- **The practical way to verify behavior is to test against the live/production site directly** (or ask the account owner to paste the values into a local `.env.local` themselves) rather than relying on CLI env pulling.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `SESSION_SECRET` | JWT signing key — minimum 32 characters, random string |
| `GITHUB_TOKEN` | GitHub PAT with `repo` scope — for image upload/delete via GitHub API |
| `MEDIA_UPLOAD_API_KEY` | Present in Vercel env but not currently referenced by any route in the codebase |

---

## Local Development

```bash
git clone https://github.com/SherifAsh93/Zahrtelkhlig.git
cd Zahrtelkhlig
npm install
npx vercel link
npx vercel env pull .env.local --environment=production   # see caveat above
npx prisma generate
npm run dev    # http://localhost:3000
```

Useful scripts:
```bash
npm run build        # prisma generate && prisma db push --accept-data-loss && next build
npm run lint         # eslint .
npm run db:studio    # Prisma Studio at http://localhost:5555
npm run db:generate  # Regenerate Prisma client (prisma generate)
npm run seed         # Run TypeScript seed (ts-node required)
```

**Windows/cross-platform note:** running `npm install` on a different OS than Vercel's Linux build environment can rewrite `package-lock.json`, stripping Linux-specific `libc`/`musl` platform markers for optional native dependencies (Next.js's Rust compiler binaries, `sharp`, etc.). **Do not commit `package-lock.json` changes from a non-Linux `npm install`** unless you've verified the diff is safe — check `git diff package-lock.json` before staging it.

Verifying changes without a database connection: `npx prisma generate` (schema-only, no DB needed) + `npx tsc --noEmit` + `npx next build` catch the large majority of real bugs (type errors, broken imports, bad Prisma schema) without ever touching the live database.

---

## Deployment

**Platform:** Vercel (auto-deploy on `git push origin main`)

**Build command (`vercel.json`):**
```
npx prisma generate && npx prisma db push --accept-data-loss && node prisma/seed-categories.cjs && npm run build
```

1. Generates Prisma client
2. Pushes `schema.prisma` to Neon directly (`--accept-data-loss` — no migration history, no rollback)
3. Seeds default categories if missing
4. Builds Next.js app

**Manual deploy:** `npx vercel --prod`

**Checking a live deployment's logs** (useful for debugging a 500 with no client-visible error body):
```bash
npx vercel logs zahrtelkhlig.vercel.app --json
```

**Image delivery:** images live in `public/images/` in the GitHub repo (pushed via the GitHub API, not git — each admin/staff image upload is its own commit), served via jsDelivr CDN:
```
https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/{folder}/{filename}
```
jsDelivr's cache can take up to 24h to invalidate after an update.

---

## Known Issues

- **Order/return numbering** (`POS-XXXX`, `RET-XXXX`) is generated from `count()+1`, which is not fully atomic under very high concurrency — as of 2026-08-02 both `/api/pos/sale` and `/api/pos/returns` retry on a unique-constraint collision (up to 5 attempts), which resolves the collision case that was actually observed in production, but a theoretical extreme-concurrency race still isn't 100% eliminated (would need a DB sequence or transaction-level locking for that).
- Products/orders/returns that have any transaction history **cannot be deleted** (FK `RESTRICT`) — this is intentional (protects accounting integrity), not a bug, but the admin delete UI doesn't currently explain *why* a delete failed, it just fails.
- `GITHUB_TOKEN` must be valid in Vercel or image uploads/deletes fail silently.
- `--accept-data-loss` in the build command means schema-destructive changes deploy without confirmation and without rollback.
- No email/SMS notifications for order status changes (manual process).
- No payment gateway integration — payment methods are informational only (Vodafone Cash / InstaPay require manual confirmation).
- A handful of pre-existing admin/owner/storefront pages (12 files, not POS-related) trigger the `react-hooks/set-state-in-effect` ESLint rule (`useEffect(() => { load() }, [load])` pattern) — not a functional bug, just flagged by a stricter lint rule; not yet cleaned up.

---

## Future Improvements

- Payment gateway integration (Fawry, PayMob)
- Email/SMS order notifications
- Customer-facing order cancellation
- Product reviews and ratings
- Promo code / coupon system
- Sales analytics export (CSV/Excel)
- Push notifications for low stock
- Admin UI surfacing `SaleReturn` history and staff-added-product filtering directly (data already exists, no dedicated screen yet)
- Installable PWA for POS (manifest + service worker) — currently just a mobile-friendly browser page, not an installable/offline app

---

## Recent Changes (2026-08-02)

- **Security:** admin password rotated `114891` → `12311` (all code paths, seed scripts, and docs updated together)
- **POS receipt printing fix:** the print window now opens synchronously on click instead of after `await fetch(...)`, which was silently triggering the browser's popup blocker and preventing the automatic receipt print entirely
- **POS mobile fallback:** viewport/safe-area handling, larger touch targets, 16px inputs (iOS zoom-on-focus fix) — `/pos` is now a viable fallback on a staff member's own phone if the store PC loses internet
- **Staff product creation:** new `/pos/products/new`, reusing the full admin `ProductForm`; `getProductManagerSession()` widens just enough admin API surface (product creation, image upload, media browsing) for POS staff without touching edit/delete
- **Returns:** new `SaleReturn`/`ReturnItem` models, `/pos/returns` UI, `/api/pos/orders/lookup` + `/api/pos/returns` APIs — order-linked (not freeform), over-return protected, revenue-neutral reporting with zero changes to existing report queries
- **Concurrency bug fix:** found via live production testing (not hypothetical — caught mid-session via `vercel logs`) that concurrent sales could collide on `orderNumber` generation and silently fail; both sale and return endpoints now retry on collision

---

## Lessons Learned

- **Neon serverless adapter** requires `@prisma/adapter-neon` + `@neondatabase/serverless` — the standard Prisma client will not work in Vercel Edge/serverless without it
- **jsDelivr CDN cache** can take up to 24 hours to invalidate after image updates — use `?t={timestamp}` busting in critical UI or use the GitHub raw URL for admin previews
- **`--accept-data-loss` in build** is necessary to push schema changes without interactive confirmation on Vercel, but it bypasses migration safety — use with care
- **Zustand v5** has a changed API compared to v4 — `create` import path and middleware usage differ
- **TailwindCSS 4** uses the PostCSS plugin approach instead of a config file — `tailwind.config.js` is not used; all configuration is in `postcss.config.mjs`
- **Next.js 16** App Router behavior may differ from training data — always check `node_modules/next/dist/docs/` (see AGENTS.md)
- **Arabic RTL** requires `dir="rtl"` on the HTML root and careful flex/grid direction handling — `flex-row-reverse` is often needed
- **POS receipt printing**: Chrome `--kiosk-printing` flag bypasses the print dialog for silent thermal receipt printing — works on Chromium-based browsers only, and only when Chrome is *launched* with the flag (a running Chrome instance won't pick it up retroactively)
- **`window.open()` after an `await`** loses the browser's user-gesture context and gets silently blocked as a popup — open windows synchronously in the click handler, populate them after the async work completes
- **Vercel "Sensitive" env vars** can never be retrieved via `vercel env pull` or any CLI/API, by design, even by the authenticated owner — plan around this by testing against the deployed environment directly rather than assuming local secret access
- **`npm install` on Windows vs. Vercel's Linux build** can silently rewrite `package-lock.json`'s platform-specific optional-dependency metadata — always diff before committing a lockfile change made on a different OS
- **Prisma model names that are JS reserved words** (e.g. a model literally called `Return`) are risky — `prisma.return` is syntactically legal but avoidable friction; this project's return model is named `SaleReturn` for that reason
- Foreign keys default to `RESTRICT` in this schema — deliberate, to keep order/return history immutable, but it means "just delete the test data" is never actually available once a product has real transactions against it

---

## Reusable Assets

| Module | Location | Description |
|---|---|---|
| Jose JWT auth middleware | `src/lib/session.ts` | Cookie-based session with role check (USER/STAFF/OWNER/ADMIN), plus a bridged `getProductManagerSession()` pattern for sharing capability across two different auth cookies |
| GitHub image upload API | `src/app/api/admin/upload/` | Upload images to GitHub repo via API, return jsDelivr CDN URL |
| GitHub media library | `src/app/api/admin/media/` | List and delete images from GitHub repo |
| POS terminal UI | `src/app/pos/` | Staff sales terminal with receipt printing, mobile fallback, product creation, and returns |
| Owner analytics dashboard | `src/app/owner/` | Real-time KPI dashboard with auto-refresh |
| Zustand cart store | `src/store/` | Persistent guest cart with localStorage |
| Admin product CRUD | `src/app/admin/products/`, `src/components/admin/ProductForm.tsx` | Full product management with size/color variants, reused as-is by the POS staff add-product flow |
| RTL Arabic UI layout | `src/components/layout/` | Arabic RTL header, footer, navigation |
| Prisma + Neon setup | `prisma/`, `prisma.config.ts` | Serverless PostgreSQL with Prisma 7 adapter |
| Daily sales report | `src/app/api/admin/reports/` | Aggregated sales by date, source, product |
| Order-linked returns | `src/app/api/pos/returns/`, `SaleReturn`/`ReturnItem` models | Return processing pattern that stays revenue-consistent with zero changes to existing report queries |

---

## WebistryDev Metadata

- **Category:** Ecommerce + POS + Analytics
- **Complexity:** High
- **Template Candidate:** Yes — the core ecommerce + admin + POS pattern is reusable for other retail clients
- **Priority:** Active (POS actively used day-to-day by store staff)
- **Reusable Modules:**
  - Jose JWT role-based auth (USER/STAFF/OWNER/ADMIN) with cross-cookie capability bridging
  - GitHub + jsDelivr image storage/delivery pipeline
  - POS terminal with ESC/POS receipt printing, mobile fallback, staff product creation, and order-linked returns
  - Owner analytics dashboard with auto-refresh KPIs
  - Zustand guest cart with localStorage persistence
  - Arabic RTL storefront layout
  - Admin panel with product CRUD, bulk delete, inventory control
  - Prisma 7 + Neon PostgreSQL serverless setup
  - Daily sales report API (online vs in-store breakdown)
- **Similar Projects:**
  - `/home/sherif/sites/Montelle` — Montelle Couture: same Next.js 16 + Neon + Vercel stack, luxury bridal ecommerce, no POS
  - `/home/sherif/sites/Qoya Furniture` — QOYA Furniture: same stack, product catalog + contact form, no ecommerce checkout
  - `/home/sherif/sites/Ahmed-Elakad` — Fashion designer portfolio site, similar RTL Arabic UI patterns
