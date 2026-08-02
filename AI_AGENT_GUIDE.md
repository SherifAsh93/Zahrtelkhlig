# Zahrtelkhlig — AI Agent Guide

## Architecture Overview

A production Arabic e-commerce platform built with **Next.js 16 App Router** on **Vercel**, backed by **Neon PostgreSQL** via **Prisma ORM**. Four distinct user roles each have their own dashboard/interface.

```
Browser → Vercel → Next.js App Router
                   ├── (store)/ → Customer storefront
                   ├── admin/   → Admin CMS (password: 12311)
                   ├── owner/   → Analytics only (password: ashraf2024)
                   └── pos/     → In-store POS (staff login)
                            ↕
                      Neon PostgreSQL (Prisma ORM)
                            ↕
                   Images: cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig
```

**Critical facts:**
1. The site is **RTL (right-to-left)** — the `<html>` element has `dir="rtl"`. All layout is Arabic-first.
2. Images are served from **GitHub via jsDelivr CDN**, not Cloudinary. To add images, commit them to the repo and push.
3. The build command in `vercel.json` automatically pushes the Prisma schema and seeds categories on every deploy.
4. Zustand stores (cart, wishlist) persist to `localStorage` — `StoreHydration.tsx` must be in the root layout.

---

## Important Files

| Priority | File | What it does |
|----------|------|-------------|
| Critical | `prisma/schema.prisma` | Database schema — single source of truth |
| Critical | `src/lib/session.ts` | JWT session creation, validation, deletion |
| Critical | `src/app/actions/auth.ts` | All login/logout server actions (all 4 roles) |
| Critical | `src/app/actions/orders.ts` | Order creation server action |
| Critical | `src/lib/prisma.ts` | Prisma singleton client |
| Critical | `src/lib/utils.ts` | SHIPPING_COST, formatPrice, CITIES, generateOrderNumber |
| High | `src/store/cartStore.ts` | Zustand cart state (localStorage persisted) |
| High | `src/store/wishlistStore.ts` | Zustand wishlist state |
| High | `src/components/StoreHydration.tsx` | Rehydrates Zustand stores on mount |
| High | `src/components/admin/ProductForm.tsx` | Product create/edit form (17KB) |
| High | `src/components/admin/AdminSidebar.tsx` | Admin/owner navigation |
| High | `src/app/api/admin/products/route.ts` | Admin product CRUD |
| High | `src/app/api/admin/orders/route.ts` | Admin order management |
| High | `src/app/api/pos/sale/route.ts` | POS order creation |
| Medium | `src/lib/homepage.ts` | Homepage section config types + defaults |
| Medium | `src/app/(store)/page.tsx` | Homepage (reads config from SiteSettings) |
| Config | `vercel.json` | Vercel build command (prisma generate + push + seed + build) |
| Config | `next.config.ts` | Image hostnames |
| Config | `.env.example` | Required env vars |

---

## Coding Conventions

- **Path alias:** `@/*` maps to `src/*` — use `@/lib/...`, `@/components/...`, `@/store/...`
- **RTL-first:** All layout classes use RTL equivalents (`me-`, `ms-`, `text-right`, etc.)
- **Bilingual:** Products, categories, banners all have `nameAr` and `nameEn` fields — always set both
- **Server components by default** — Client components only when needed (`"use client"`)
- **Server Actions** in `src/app/actions/` for auth and orders; API routes in `src/app/api/` for CRUD
- **Tailwind CSS v4** — PostCSS only, no `tailwind.config.js`
- **No direct Prisma in page components** — use API routes or server actions
- **bcryptjs** for all password hashing — never store plain-text passwords
- **`import 'server-only'`** in any module that should never run on the client
- **TypeScript strict mode** — type all props, API responses, and function parameters

---

## Where to Modify Common Features

### Add a new product field
1. `prisma/schema.prisma` → add to `Product` model
2. `npx prisma migrate dev --name add_field_name`
3. `src/components/admin/ProductForm.tsx` → add input
4. `src/app/api/admin/products/route.ts` → handle in POST and PUT
5. `src/app/(store)/products/[id]/page.tsx` → display to customers
6. `src/app/api/pos/products/route.ts` → include if needed in POS

### Change shipping cost or add free shipping threshold
→ `src/lib/utils.ts` — `SHIPPING_COST` and `FREE_SHIPPING_THRESHOLD` constants

### Add a new city for delivery
→ `src/lib/utils.ts` — `CITIES` array

### Add a new payment method
1. `prisma/schema.prisma` → add to `PaymentMethod` enum
2. `npx prisma migrate dev --name add_payment_method`
3. `src/app/(store)/checkout/page.tsx` → add option in payment selector
4. `src/lib/utils.ts` → add any display labels

### Add a new homepage section
1. `src/lib/homepage.ts` → add to `HomepageSection` type and `DEFAULT_CONFIG`
2. `src/app/(store)/page.tsx` → render section conditionally based on config
3. `src/app/admin/homepage/page.tsx` → add admin UI for the new section

### Create or modify a staff account
→ Admin Dashboard → Users → Create Staff  
→ Or via `POST /api/admin/staff` with `{ name, username, password }`  
→ Staff username must be lowercase alphanumeric + underscores only

### Change the owner dashboard password
→ Update the `owner_password` key in the `SiteSettings` table in the database  
→ Via Prisma Studio: `npx prisma studio`

### Change order statuses
→ `prisma/schema.prisma` → `OrderStatus` enum  
→ `src/app/api/admin/orders/[id]/route.ts` → status update handler  
→ `src/app/admin/orders/` → admin UI for status changes

---

## Common Pitfalls

### 1. Prisma client generation after schema changes
After any change to `prisma/schema.prisma`, run:
```bash
npx prisma generate
```
Without this, TypeScript types will be out of sync and imports from `@prisma/client` will use stale types.

### 2. RTL layout breaks
All layout must work in RTL mode. Test with the `dir="rtl"` attribute. Tailwind's `me-` (margin-end) and `ms-` (margin-start) are RTL-aware; avoid using `ml-`/`mr-` for directional spacing.

### 3. Image paths require GitHub commit + push
Images are served from `cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig`. A new image file must be committed to the repo AND pushed to GitHub before the CDN URL will work. jsDelivr caches aggressively — use `@branch` not `@latest` for predictable caching.

### 4. StoreHydration must stay in root layout
The `StoreHydration` component in `src/app/layout.tsx` rehydrates Zustand stores from localStorage. If it's removed or moved, the cart and wishlist will show incorrect counts on initial render (SSR mismatch).

### 5. Two separate session cookies
- `session` cookie — used by customers, POS users, and owners
- `admin_session` cookie — used only by the admin panel

Never mix them up. Admin routes call `getAdminSession()`, not `getSession()`. Customer routes call `getSession()`.

### 6. Product stock is tracked three ways
The `Product` model has `stock` (total), `sizeStock` (per-size JSON), and `variants` (full variant matrix JSON). The admin ProductForm manages all three, but they're independent — updating `sizeStock` doesn't auto-update `stock`. The admin inventory page shows `stock` only.

### 7. vercel.json build command reseeds categories
Every Vercel deploy runs `seed-categories.cjs`. This script is idempotent (uses upsert), so it won't duplicate data, but it will overwrite category names if you rename them via the admin UI. Always update `seed-categories.cjs` if you change a category name in the admin.

### 8. Neon cold starts on free tier
Neon pauses after 5 minutes of inactivity. First request after pause takes 2–5 seconds. This affects the checkout, cart, and any authenticated pages on cold start. Acceptable on free tier; upgrade to paid to eliminate.

---

## Project-Specific Patterns

### Pattern: Auth gate in layout
```typescript
// src/app/admin/layout.tsx
const session = await getAdminSession();
if (!session) {
  redirect("/admin-login");
}
```
Each protected area (admin, owner, POS) has its own layout that performs this check. Don't add auth checks in individual page components — put them in the layout.

### Pattern: Bilingual content
```typescript
// Always provide both languages for user-visible content
const product = {
  nameAr: "فستان الزفاف",    // Arabic (primary, shown to customers)
  nameEn: "Wedding Dress",    // English (shown in admin, search)
};
```

### Pattern: Admin API route structure
```typescript
// src/app/api/admin/[resource]/route.ts
export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  // ... handler
}
```

### Pattern: OrderItem snapshot
When creating an order, `nameAr`, `nameEn`, `price`, and `image` are copied from the product into `OrderItem`. This preserves the order history even if the product is later edited or deleted.

### Pattern: Homepage config in SiteSettings
The homepage layout is stored as JSON in the `SiteSettings` table under key `"homepage_config"`. Use `src/lib/homepage.ts` helpers to parse and apply defaults:
```typescript
const raw = await prisma.siteSettings.findUnique({ where: { key: "homepage_config" } });
const config = parseConfig(raw?.value);  // Merges with DEFAULT_CONFIG
```

---

## Safe Areas for Modifications

- `src/lib/utils.ts` — Constants (shipping, cities, price formatting)
- `src/components/ui/` — Button, Badge, Spinner styling
- `src/components/layout/Footer.tsx` — Layout and contact info
- `src/app/globals.css` — Tailwind theme tokens and animations
- `public/images/` — Static images (after committing and pushing)
- `prisma/seed.ts` — Initial seed data (only affects fresh installs)

---

## Areas Requiring Caution

### `prisma/schema.prisma`
Schema changes require migrations. Destructive changes (column removal, type changes) can lose production data. Always:
1. Backup data before destructive migrations
2. Use `prisma migrate dev` locally first
3. Test on a staging database before production

### `src/lib/session.ts`
Session management controls all four authentication contexts. Breaking `encrypt()`, `decrypt()`, or `createSession()` will log out all users instantly. The JWT secret in `SESSION_SECRET` must not change in production (it invalidates all existing sessions).

### `src/app/actions/auth.ts`
Contains all login/logout server actions for all roles. Test all four login flows after any change.

### `vercel.json` build command
The build command runs `prisma db push --accept-data-loss`. Adding a `--force-reset` flag here would wipe the entire production database. Never modify this command without fully understanding the consequences.

### `src/store/cartStore.ts`
Cart state is persisted to localStorage. Changing the store shape without a migration strategy will break existing users' carts (they'll see stale data or errors). If you change the cart item shape, add a migration in `StoreHydration.tsx` to clear stale data.

### `src/components/admin/ProductForm.tsx` (17KB)
Complex form with image upload, variants, size management. Make targeted edits. Test create and edit flows after changes.
