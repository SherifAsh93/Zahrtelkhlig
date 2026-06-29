# Zahrtelkhlig — Project Overview

## What This Project Is

**زهرة الخليج (Zahrt El Khalig)** is a full-stack Arabic-language RTL ecommerce platform serving modest women's fashion in Egypt. The brand has operated since the year 2000 and primarily sells through a physical store in Damietta (دمياط). This platform adds an online storefront, a point-of-sale terminal for in-store staff, an owner analytics view for business insights, and a full admin control panel.

**Live URL:** zahrtelkhlig.vercel.app  
**Local dev:** `next dev --port 3000`  
**GitHub repo:** SherifAsh93/Zahrtelkhlig  
**Deployment:** Vercel (serverless)  
**Language:** Arabic RTL, with English decorative type  
**Currency:** Egyptian Pound (EGP)  
**Target market:** Egyptian women shopping for modest fashion — abayat, dresses, seasonal collections

---

## Four Dashboards

### 1. Store (Customer-Facing)
Route group: `(store)` — Navbar + Footer layout applied to all routes in this group.

- **Homepage** — configurable sections driven by `SiteSettings["homepage_config"]` JSON blob: hero banners, features bar, new arrivals, at-a-glance tiles, featured products, category tabs, brand story block, and Instagram feed-style gallery. Section visibility and order are controlled via the admin homepage editor.
- **Product catalog** — `/products` with filters by category, season, search query, and price range. Pagination 12 per page. Displays Arabic names, Egyptian Pound pricing.
- **Product detail** — `/products/[id]` shows all images, description (Arabic + English), size/color selection tied to the 3-mode stock system, add to cart/wishlist actions.
- **Cart** — `/cart` — Zustand + localStorage store; no DB until checkout. Shows live totals with shipping calculation (free above 500 EGP).
- **Checkout** — `/checkout` — CheckoutForm serializes Zustand cart into a hidden `cart` field, submits to the `createOrder` server action. Four payment methods: Cash on Delivery, Vodafone Cash, InstaPay, Bank Transfer. Non-COD orders go to PENDING status and require admin manual confirmation.
- **Order history** — `/orders` (session required) + `/orders/[id]` (public by order ID, used for post-checkout confirmation).
- **Wishlist** — `/wishlist` — persisted to localStorage. No backend DB involvement.
- **Profile** — `/profile` — session-gated. Shows user info and past orders. Allows name/phone/address/city updates.
- **Auth** — `/login`, `/register` — server action forms.

### 2. Admin Dashboard
Route: `/admin` — layout gates entirely on `admin_session` cookie; shows `AdminLoginView` inline if absent.

- **Dashboard** — stats cards (total orders, revenue, product count, user count), recent 5 orders.
- **Products** — full CRUD. Create at `/admin/products/new`, edit at `/admin/products/[id]/edit`. ProductForm handles all 3 stock modes.
- **Orders** — list all orders with status filter and pagination. Order detail at `/admin/orders/[id]` allows status update (PATCH) and customer info edit (PUT) and deletion (DELETE).
- **Categories** — CRUD for product categories. Each category has `nameAr`, `nameEn`, `slug`, optional `image`, `seasonal` flag, `sortOrder`.
- **Inventory** — `/admin/inventory` — shows all active products with variant-level stock. PATCH endpoint updates specific size+color variant and re-calculates aggregate `stock`.
- **Reports** — `/admin/reports` — daily report with sold items, revenue breakdown (online vs POS), per-product performance. Date picker supported.
- **Homepage Editor** — `/admin/homepage` — reorders sections, enables/disables them, edits headings, sets manual vs auto product selection. Persists via `saveHomepageConfig` server action to `SiteSettings`.
- **Banners** — CRUD for hero banners. Each banner has Arabic + English title/subtitle, image, optional link, active toggle, sortOrder.
- **Media** — `/admin/media` — lists images stored in the GitHub repo under `public/images/{products,banners,categories}`. Supports upload and deletion (deletion calls GitHub API to remove the file).
- **Users** — list all users with role filter. Edit name/phone/address/city/role. Delete (cascades: nullifies userId on orders, deletes cartItems and wishlist).
- **Staff Accounts** — create and delete staff accounts. Staff accounts use username (not email) for login.

### 3. Owner Dashboard
Route: `/owner` — layout is a transparent pass-through; auth is handled client-side in `OwnerLoginView.tsx`. Owner password is stored in `SiteSettings["owner_password"]` (default: `ashraf2024`).

- **Dashboard** — dark-themed analytics UI. KPI cards: today, week, month revenue/orders with MoM growth %. Online vs POS channel breakdown. Revenue trend chart (7-day / 30-day). Top 8 products by quantity sold. Low-stock alerts (stock < 10).
- **Orders** — filterable by today/week/month/all. Read-only list view.
- **Order detail** — `/owner/orders/[id]` — read-only. Includes product stock state at time of view.
- **Products** — filterable by search, season, stock status (low/out). Read-only with sold totals and per-size revenue.
- **Product detail** — `/owner/products/[id]` — sold total, total revenue, orders count, per-size breakdown.
- **Auto-refresh** — the owner dashboard refreshes its stats data every 5 minutes automatically.

### 4. POS Terminal
Route: `/pos` — layout gates on `session` cookie with role `STAFF` or `ADMIN`; shows `POSLoginView` inline if absent.

- Product search by name or SKU, filterable by season.
- Variant picker — size + color selection driven by `product.variants` JSON.
- POS cart — separate from the Zustand customer cart. Managed as local component state.
- Checkout — calls `POST /api/pos/sale`. Creates order with `source: POS`, `status: DELIVERED` (immediate), `shipping: 0`. Reduces stock atomically in the same request.
- POS order number format: `POS-{padded sequence}` (e.g. `POS-0042`).
- Login: Staff log in with `username` + password. Admin can log in with `username: "admin"` + admin password `114891`.

---

## Technology Stack Summary

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js | 16.2.6 |
| UI Runtime | React | 19.2.4 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| ORM | Prisma | ^7.8.0 |
| Database | PostgreSQL (Neon serverless) | — |
| Auth | Jose JWT (HS256) | ^6.2.3 |
| State | Zustand (with persist) | ^5.0.13 |
| Password hashing | bcryptjs | ^3.0.3 |
| Icons | lucide-react | ^1.16.0 |
| DB adapter | @prisma/adapter-pg | ^7.8.0 |
| Image storage | GitHub API → jsDelivr CDN | — |
| Deployment | Vercel (serverless) | — |

---

## Annotated Folder Tree

```
zahrtelkhlig/
├── prisma/
│   ├── schema.prisma          # Source of truth for all 9 models + enums
│   ├── seed.ts                # TypeScript seed (ts-node, full demo data)
│   ├── seed.mjs               # ESM seed variant
│   └── seed-categories.cjs    # CommonJS seed for categories only
├── prisma.config.ts           # Prisma CLI config (schema path, migrations path, datasource URL)
├── public/
│   └── images/
│       ├── products/          # Product images (GitHub-stored, jsDelivr CDN)
│       ├── banners/           # Banner images
│       └── categories/        # Category images
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout: lang="ar" dir="rtl", Cairo+Cormorant fonts, StoreHydration
│   │   ├── globals.css        # Tailwind v4 @theme, brand palette, RTL line-heights, animations
│   │   ├── (store)/           # Route group — Navbar+Footer layout wraps all customer routes
│   │   │   ├── layout.tsx     # Renders Navbar (with session) + Footer
│   │   │   ├── page.tsx       # Homepage: reads homepage_config, renders ordered sections
│   │   │   ├── products/
│   │   │   │   ├── page.tsx               # Product listing with filters
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx           # SSR product fetch
│   │   │   │       └── ProductDetailClient.tsx  # Cart/wishlist interactivity
│   │   │   ├── cart/page.tsx              # Cart page (reads Zustand)
│   │   │   ├── checkout/
│   │   │   │   ├── page.tsx              # Checkout page wrapper
│   │   │   │   └── CheckoutForm.tsx      # Form → createOrder server action
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx              # Order history (session-gated)
│   │   │   │   └── [id]/page.tsx         # Single order detail (public by ID)
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   └── wishlist/page.tsx
│   │   ├── admin/
│   │   │   ├── layout.tsx                # Admin gate: getAdminSession() or show AdminLoginView
│   │   │   ├── page.tsx                  # Admin dashboard stats
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── categories/page.tsx
│   │   │   ├── inventory/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   ├── homepage/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── HomepageSettingsForm.tsx
│   │   │   │   └── ProductPicker.tsx
│   │   │   ├── banners/page.tsx
│   │   │   ├── media/page.tsx
│   │   │   └── users/
│   │   │       ├── page.tsx
│   │   │       └── [id]/page.tsx
│   │   ├── admin-login/page.tsx          # Standalone admin login page (alternative to inline gate)
│   │   ├── owner/
│   │   │   ├── layout.tsx                # Transparent pass-through (no server-side auth gate)
│   │   │   ├── page.tsx                  # Owner analytics dashboard (client component)
│   │   │   ├── OwnerLoginView.tsx        # Client-side login form for owner
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   └── products/
│   │   │       ├── page.tsx
│   │   │       └── [id]/page.tsx
│   │   ├── pos/
│   │   │   ├── layout.tsx               # POS gate: getSession() role STAFF or ADMIN
│   │   │   ├── page.tsx                 # Full POS terminal UI
│   │   │   └── POSLoginView.tsx
│   │   ├── actions/                     # Server actions ("use server")
│   │   │   ├── auth.ts                  # All auth flows
│   │   │   ├── orders.ts               # createOrder
│   │   │   └── settings.ts             # saveHomepageConfig
│   │   └── api/                        # 32 route files
│   │       ├── products/[id]/route.ts
│   │       ├── products/route.ts
│   │       ├── categories/route.ts
│   │       ├── banners/route.ts
│   │       ├── orders/route.ts          # Authenticated customer orders
│   │       ├── orders/[id]/route.ts
│   │       ├── profile/route.ts
│   │       ├── admin/products/route.ts
│   │       ├── admin/products/[id]/route.ts
│   │       ├── admin/orders/route.ts
│   │       ├── admin/orders/[id]/route.ts
│   │       ├── admin/categories/route.ts
│   │       ├── admin/categories/[id]/route.ts
│   │       ├── admin/banners/route.ts
│   │       ├── admin/banners/[id]/route.ts
│   │       ├── admin/users/route.ts
│   │       ├── admin/users/[id]/route.ts
│   │       ├── admin/staff/route.ts
│   │       ├── admin/inventory/route.ts
│   │       ├── admin/stats/route.ts
│   │       ├── admin/reports/route.ts
│   │       ├── admin/upload/route.ts
│   │       ├── admin/media/route.ts
│   │       ├── admin/seed/route.ts
│   │       ├── pos/products/route.ts
│   │       ├── pos/sale/route.ts
│   │       ├── owner/stats/route.ts
│   │       ├── owner/activity/route.ts
│   │       ├── owner/orders/route.ts
│   │       ├── owner/orders/[id]/route.ts
│   │       ├── owner/products/route.ts
│   │       └── owner/products/[id]/route.ts
│   ├── components/
│   │   ├── StoreHydration.tsx            # Rehydrates Zustand stores from localStorage on mount
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── store/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductCarousel.tsx
│   │   │   ├── HeroBanner.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   └── CategoryTabsSection.tsx
│   │   ├── admin/
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── AdminLoginView.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── MediaPickerModal.tsx
│   │   │   ├── DashboardQuickAccess.tsx
│   │   │   └── RecentOrdersClient.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Badge.tsx
│   │       └── Spinner.tsx
│   ├── lib/
│   │   ├── session.ts       # Jose JWT: encrypt/decrypt, createSession/getSession (dual cookie)
│   │   ├── prisma.ts        # Singleton PrismaClient with PrismaPg adapter
│   │   ├── utils.ts         # formatPrice, generateOrderNumber, slugify, CITIES, shipping constants
│   │   └── homepage.ts      # HomepageConfig type + DEFAULT_CONFIG + parseConfig + SECTION_LABELS
│   ├── store/
│   │   ├── cartStore.ts     # Zustand cart, localStorage key "zahrt-cart", skipHydration: true
│   │   └── wishlistStore.ts # Zustand wishlist, localStorage key "zahrt-wishlist", skipHydration: true
│   ├── types/
│   │   └── index.ts         # CartItem, WishlistItem, ProductWithCategory, SessionUser, Language
│   └── generated/
│       └── prisma/          # Auto-generated Prisma client — NEVER edit manually
├── next.config.ts
├── vercel.json
├── package.json
├── tsconfig.json
└── tsconfig.seed.json       # Separate TS config for seed scripts (ts-node compatible)
```

---

## Module Breakdown

### Auth Module
Files: `src/lib/session.ts`, `src/app/actions/auth.ts`  
Manages four distinct login flows (customer, admin, staff/POS, owner), dual cookie architecture, and role-based session payloads. All password hashing via bcryptjs cost factor 12.

### Cart Module
Files: `src/store/cartStore.ts`, `src/components/StoreHydration.tsx`  
Client-side only during shopping. Zustand store with localStorage persistence (`zahrt-cart`). `skipHydration: true` prevents SSR mismatch; `StoreHydration` component calls `rehydrate()` in a `useEffect`.

### Orders Module
Files: `src/app/actions/orders.ts`, `src/app/api/orders/`, `src/app/api/admin/orders/`, `src/app/api/pos/sale/`  
Online orders via server action; POS orders via API route. Both persist OrderItems with price/name snapshots. POS reduces stock atomically.

### Products Module
Files: `src/app/api/products/`, `src/app/api/admin/products/`, `src/app/api/pos/products/`  
Three-mode stock system: simple integer, per-size JSON, full variants JSON. Admin always recalculates aggregate `stock` from parts on save.

### Inventory Module
File: `src/app/api/admin/inventory/route.ts`  
PATCH endpoint for variant-level stock adjustment. Recalculates `sizeStock` and aggregate `stock` after every update.

### POS Module
Files: `src/app/pos/`, `src/app/api/pos/`  
Staff terminal with product search, variant selection, cart management, and immediate-fulfillment checkout. Login uses `session` cookie (same as customer) but role-gated to STAFF or ADMIN.

### Owner Analytics Module
Files: `src/app/owner/`, `src/app/api/owner/`  
Read-only. No write operations anywhere in the owner namespace. Password from DB. Auto-refreshes every 5 minutes. No auth middleware — trust model implemented client-side in `OwnerLoginView.tsx`.

### Homepage Config Module
Files: `src/lib/homepage.ts`, `src/app/actions/settings.ts`, `src/app/admin/homepage/`  
Single JSON blob in `SiteSettings["homepage_config"]`. Type-safe `HomepageConfig` interface. Admin editor writes via server action; homepage reads via `parseConfig()` with DEFAULT_CONFIG fallback.

### Image CDN Module
File: `src/app/api/admin/upload/route.ts`, `src/app/api/admin/media/route.ts`  
Images uploaded to `SherifAsh93/Zahrtelkhlig` GitHub repo under `public/images/{products,banners,categories}/`. Served via jsDelivr CDN at `https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/...`. Deletion removes the file from GitHub via GitHub API.
