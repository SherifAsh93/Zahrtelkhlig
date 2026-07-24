# Project Overview

**زهرة الخليج (Gulf Flower)** — Full Arabic RTL ecommerce + POS + owner analytics platform for a women's fashion store in Egypt.

- **Live URL:** https://zahrtelkhlig.vercel.app
- **GitHub:** https://github.com/SherifAsh93/Zahrtelkhlig
- **Local path:** `/home/sherif/sites/zahrtelkhlig`
- **Status:** COMPLETE & CLOSED (as of 2026-06-08). Maintenance only.
- **Admin password:** `114891`

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

### Admin Panel (`/admin`) — Password: `114891`
- Dashboard with live KPI stats (orders, revenue, low-stock alerts)
- Product CRUD: add/edit/delete with image upload, size-stock grid, color-image variants
- Bulk product deletion
- Order management: view, update status, filter by source/status
- Inventory control: per-size stock editing across all products
- User & staff management (promote to STAFF/OWNER/ADMIN)
- Category management with images and sort order
- Banner management (homepage hero banners)
- Media library: drag-and-drop multi-upload, delete images, browse by folder
- Homepage settings: featured products, category selection
- Daily sales reports: online vs in-store breakdown by date

### POS Terminal (`/pos`) — Staff role
- Staff login (STAFF / ADMIN / OWNER role required)
- Product search and size selection
- Cart with quantity + optional discount field
- Submit sale: deducts stock from DB, creates POS order
- ESC/POS thermal receipt printing via Chrome `--kiosk-printing`
- Tracks which staff member made each sale

### Owner Dashboard (`/owner`) — Open access (no password)
- KPI cards: today / this week / this month / all-time revenue
- 30-day rolling sales chart (online vs in-store)
- Sales split pie: online vs POS
- Top-selling products list
- Low-stock inventory alerts
- Activity feed: latest orders, new customers, stock alerts
- Sub-pages: `/owner/daily` (detailed daily report), `/owner/orders`, `/owner/products`
- Auto-refresh every 15 seconds via `setInterval`

---

## Tech Stack

| Technology | Version | Usage |
|---|---|---|
| Next.js | 16.2.6 | App Router framework |
| React | 19.2.4 | UI library |
| TypeScript | 5 | Language |
| TailwindCSS | 4 | Styling (PostCSS plugin) |
| Prisma | 7.8.0 | ORM |
| @prisma/adapter-neon | 7.8.0 | Neon serverless adapter |
| @neondatabase/serverless | 1.1.0 | Neon HTTP driver |
| PostgreSQL (Neon) | — | Database (cloud, free tier) |
| jose | 6.2.3 | JWT session signing/verification |
| bcryptjs | 3.0.3 | Password hashing |
| Zustand | 5.0.13 | Cart state management |
| Lucide React | 1.16.0 | Icon library |
| GitHub API + jsDelivr CDN | — | Image storage and delivery |
| sharp | 0.34.5 | Server-side image processing |
| Vercel | — | Hosting and CI/CD |

**Dev tools:** ESLint 9, ts-node (for seeding)

---

## Folder Structure

```
zahrtelkhlig/
├── src/
│   ├── app/
│   │   ├── (store)/             # Customer-facing storefront (Arabic RTL)
│   │   │   ├── page.tsx         # Homepage
│   │   │   ├── products/        # Product listing + detail pages
│   │   │   ├── cart/            # Shopping cart
│   │   │   ├── checkout/        # Checkout flow
│   │   │   ├── orders/          # Order history & tracking
│   │   │   ├── profile/         # User profile & settings
│   │   │   ├── login/           # Customer login
│   │   │   ├── register/        # Customer registration
│   │   │   └── wishlist/        # Wishlist page
│   │   ├── admin/               # Admin panel (password: 114891)
│   │   │   ├── page.tsx         # Admin dashboard + stats
│   │   │   ├── products/        # Product CRUD + bulk delete
│   │   │   ├── orders/          # Order management
│   │   │   ├── inventory/       # Per-size stock control
│   │   │   ├── users/           # User & staff management
│   │   │   ├── categories/      # Category CRUD
│   │   │   ├── banners/         # Homepage banner management
│   │   │   ├── media/           # Image library (upload/delete)
│   │   │   ├── homepage/        # Homepage customization
│   │   │   └── reports/         # Daily sales reports
│   │   ├── admin-login/         # Admin login page
│   │   ├── pos/                 # POS terminal for staff
│   │   ├── owner/               # Owner analytics dashboard
│   │   │   ├── page.tsx         # Main KPI dashboard
│   │   │   ├── daily/           # Daily sales report
│   │   │   ├── orders/          # Owner order view
│   │   │   └── products/        # Owner product view
│   │   ├── api/                 # REST API routes
│   │   │   ├── auth/            # Login, logout, register, session
│   │   │   ├── products/        # Product listing, detail
│   │   │   ├── orders/          # Customer order creation & tracking
│   │   │   ├── cart/            # Cart sync
│   │   │   ├── wishlist/        # Wishlist CRUD
│   │   │   ├── categories/      # Category listing
│   │   │   ├── banners/         # Banner listing
│   │   │   ├── profile/         # Profile update
│   │   │   ├── admin/           # Admin-protected API routes
│   │   │   │   ├── products/    # Admin product CRUD
│   │   │   │   ├── orders/      # Admin order management
│   │   │   │   ├── inventory/   # Inventory management
│   │   │   │   ├── users/       # User management
│   │   │   │   ├── staff/       # Staff management
│   │   │   │   ├── categories/  # Category management
│   │   │   │   ├── banners/     # Banner management
│   │   │   │   ├── media/       # Image library API (GitHub API)
│   │   │   │   ├── upload/      # Image upload to GitHub
│   │   │   │   ├── reports/     # Sales reports
│   │   │   │   ├── stats/       # Dashboard stats
│   │   │   │   └── seed/        # Category seed endpoint
│   │   │   ├── pos/             # POS-protected API routes
│   │   │   │   ├── me/          # POS staff session
│   │   │   │   ├── products/    # POS product lookup
│   │   │   │   └── sale/        # POS sale submission
│   │   │   └── owner/           # Owner analytics API routes
│   │   │       ├── stats/       # KPI stats
│   │   │       ├── daily/       # Daily report data
│   │   │       ├── latest/      # Latest orders
│   │   │       ├── orders/      # Orders list
│   │   │       ├── products/    # Products list
│   │   │       └── activity/    # Activity feed
│   │   └── actions/             # Next.js Server Actions
│   ├── components/
│   │   ├── admin/               # Admin panel components
│   │   ├── layout/              # Header, footer, navigation
│   │   ├── store/               # Customer storefront components
│   │   └── ui/                  # Shared UI primitives
│   ├── lib/                     # Utility functions, Prisma client, auth helpers
│   ├── hooks/                   # Custom React hooks
│   ├── store/                   # Zustand stores (cart)
│   ├── types/                   # TypeScript type definitions
│   └── generated/prisma/        # Prisma generated client (do not edit)
├── prisma/
│   ├── schema.prisma            # Full DB schema
│   ├── seed.ts                  # TypeScript seed script
│   └── seed-categories.cjs      # CJS seed for Vercel build step
├── public/
│   └── images/                  # Product/category/banner images (synced to GitHub, served via jsDelivr)
│       ├── products/
│       ├── categories/
│       └── banners/
├── docs/                        # Additional documentation
├── vercel.json                  # Vercel build configuration
├── next.config.ts               # Next.js configuration
├── prisma.config.ts             # Prisma configuration
├── package.json
└── .env.local                   # Secrets (never commit)
```

---

## Database

**Provider:** Neon PostgreSQL (free tier, serverless HTTP driver)
**ORM:** Prisma 7 with `@prisma/adapter-neon`

### Models

| Model | Key Fields | Notes |
|---|---|---|
| `User` | id (cuid), email (unique), username, password (bcrypt), name, phone, address, city, role | Roles: USER, STAFF, OWNER, ADMIN |
| `Category` | id, nameAr, nameEn, slug (unique), image, seasonal, sortOrder | Bilingual. Linked to products. |
| `Product` | id, nameAr, nameEn, descriptionAr/En, sku (unique), price, season, sizes[], sizeStock (JSON), variants (JSON), colorImages (JSON), stock, images[], featured, active, categoryId | Season: WINTER/SUMMER. sizeStock is per-size quantity map. |
| `Order` | id, orderNumber (unique), userId?, customerName, customerPhone, address, city, notes, status, source, paymentMethod, subtotal, discount, shipping, total | source: ONLINE/POS. status: PENDING→DELIVERED/CANCELLED |
| `OrderItem` | id, orderId, productId, nameAr, nameEn, price, quantity, size?, color?, image? | Snapshot of product at time of sale |
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

---

## Environment Variables

Names only — never commit values.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string (with `?sslmode=require`) |
| `SESSION_SECRET` | JWT signing key — minimum 32 characters, random string |
| `GITHUB_TOKEN` | GitHub PAT with `repo` scope — for image upload/delete via GitHub API |

Set in:
- `.env.local` for local development
- Vercel Dashboard → Settings → Environment Variables for production

---

## Local Development

```bash
git clone https://github.com/SherifAsh93/Zahrtelkhlig.git
cd Zahrtelkhlig
npm install
cp .env.example .env.local
# Fill: DATABASE_URL, SESSION_SECRET, GITHUB_TOKEN
npx prisma generate
npx prisma db push
npm run dev    # http://localhost:3000
```

Useful scripts:
```bash
npm run db:studio   # Prisma Studio at http://localhost:5555
npm run db:generate # Regenerate Prisma client
npm run seed        # Run TypeScript seed (ts-node required)
```

Dev port defaults to 3000 (was 3001 during development — check `package.json` `dev` script).

---

## Deployment

**Platform:** Vercel (auto-deploy on `git push origin main`)

**Build command (vercel.json):**
```
npx prisma generate && npx prisma db push --accept-data-loss && node prisma/seed-categories.cjs && npm run build
```

The build step:
1. Generates Prisma client
2. Pushes schema to Neon (non-destructive via `--accept-data-loss` flag)
3. Seeds default categories if missing
4. Builds Next.js app

**Manual deploy:**
```bash
vercel --prod --yes
```

**Image delivery:** Images stored in `public/images/` in the GitHub repo via GitHub API, served via jsDelivr CDN:
```
https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/{folder}/{filename}
```

---

## Current Status

- **COMPLETE & CLOSED** as of 2026-06-08
- All core features implemented and live
- No active development — maintenance mode only
- Admin password: `114891`
- Owner dashboard: open access at `/owner`
- POS: staff role required at `/pos`

---

## Known Issues

- `GITHUB_TOKEN` must be set in Vercel environment variables or image uploads/deletes will fail silently
- Owner dashboard auto-refresh is every 15s (coded) — original spec said 5 minutes; actual behavior in production may differ from README description
- `--accept-data-loss` flag in build command means schema-destructive changes on Vercel builds are permanent with no rollback
- No email notifications for order status changes (manual process)
- No payment gateway integration — payment methods are manual (Vodafone Cash / InstaPay with confirmation workflow)

---

## Future Improvements

(For reference if the project is ever reopened)

- Payment gateway integration (Fawry, PayMob)
- Email/SMS order notifications
- Customer-facing order cancellation
- Product reviews and ratings
- Promo code / coupon system
- Multi-image carousel on product detail page
- Sales analytics export (CSV/Excel)
- Push notifications for low stock
- PWA / mobile app wrapper

---

## Reusable Assets

These modules can be extracted and reused in similar ecommerce projects:

| Module | Location | Description |
|---|---|---|
| Jose JWT auth middleware | `src/lib/` | Cookie-based session with role check (USER/STAFF/OWNER/ADMIN) |
| GitHub image upload API | `src/app/api/admin/upload/` | Upload images to GitHub repo via API, return jsDelivr CDN URL |
| GitHub media library | `src/app/api/admin/media/` | List and delete images from GitHub repo |
| POS terminal UI | `src/app/pos/` | Staff sales terminal with receipt printing |
| Owner analytics dashboard | `src/app/owner/` | Real-time KPI dashboard with auto-refresh |
| Zustand cart store | `src/store/` | Persistent guest cart with localStorage |
| Admin product CRUD | `src/app/admin/products/` | Full product management with size/color variants |
| RTL Arabic UI layout | `src/components/layout/` | Arabic RTL header, footer, navigation |
| Prisma + Neon setup | `prisma/`, `prisma.config.ts` | Serverless PostgreSQL with Prisma 7 adapter |
| Daily sales report | `src/app/api/admin/reports/` | Aggregated sales by date, source, product |

---

## Lessons Learned

- **Neon serverless adapter** requires `@prisma/adapter-neon` + `@neondatabase/serverless` — the standard Prisma client will not work in Vercel Edge/serverless without it
- **jsDelivr CDN cache** can take up to 24 hours to invalidate after image updates — use `?t={timestamp}` busting in critical UI or use the GitHub raw URL for admin previews
- **`--accept-data-loss` in build** is necessary to push schema changes without interactive confirmation on Vercel, but it bypasses migration safety — use with care
- **Zustand v5** has a changed API compared to v4 — `create` import path and middleware usage differ
- **TailwindCSS 4** uses the PostCSS plugin approach instead of a config file — `tailwind.config.js` is not used; all configuration is in `postcss.config.mjs`
- **Next.js 16** App Router behavior may differ from training data — always check `node_modules/next/dist/docs/` (see AGENTS.md)
- **Arabic RTL** requires `dir="rtl"` on the HTML root and careful flex/grid direction handling — `flex-row-reverse` is often needed
- **POS receipt printing**: Chrome `--kiosk-printing` flag bypasses the print dialog for silent thermal receipt printing — works on Chromium-based browsers only

---

## WebistryDev Metadata

- **Category:** Ecommerce + POS + Analytics
- **Complexity:** High
- **Template Candidate:** Yes — the core ecommerce + admin + POS pattern is reusable for other retail clients
- **Priority:** Maintenance (closed, no active development)
- **Reusable Modules:**
  - Jose JWT role-based auth (USER/STAFF/OWNER/ADMIN)
  - GitHub + jsDelivr image storage/delivery pipeline
  - POS terminal with ESC/POS receipt printing
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
