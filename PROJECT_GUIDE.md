# Zahrtelkhlig (زهرة الخليج) — Project Guide

## Project Overview

A production-grade Arabic e-commerce platform for modest women's clothing (abayas, dresses, kaftans). It features a customer storefront, full admin CMS, an owner analytics dashboard, and a point-of-sale (POS) system for in-store purchases.

**Live URL:** zahrtelkhlig.vercel.app  
**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Neon PostgreSQL · Prisma ORM · Zustand · JWT · Vercel

---

## Purpose and Business Goals

- Sell modest women's clothing online (Arabic-first, RTL design)
- Support in-store sales via POS (for staff processing walk-in orders)
- Give the owner (Ashraf) a private analytics dashboard separate from the admin
- Allow admins to manage products, orders, categories, banners, and homepage configuration
- Track inventory and generate sales reports

---

## Complete Folder Structure

```
zahrtelkhlig/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout (fonts, metadata, RTL dir)
│   │   ├── globals.css                   # Tailwind 4 + custom RTL theme
│   │   ├── (store)/                      # Customer-facing route group
│   │   │   ├── layout.tsx                # Store layout (Navbar + Footer)
│   │   │   ├── page.tsx                  # Homepage (configurable sections)
│   │   │   ├── products/page.tsx         # Product listing with filters
│   │   │   ├── products/[id]/page.tsx    # Product detail page
│   │   │   ├── cart/page.tsx             # Shopping cart
│   │   │   ├── checkout/page.tsx         # Checkout form (auth required)
│   │   │   ├── orders/page.tsx           # Order history
│   │   │   ├── orders/[id]/page.tsx      # Order detail
│   │   │   ├── login/page.tsx            # Customer login
│   │   │   ├── register/page.tsx         # Customer registration
│   │   │   ├── profile/page.tsx          # Customer profile
│   │   │   └── wishlist/page.tsx         # Wishlist
│   │   ├── admin/                        # Admin dashboard
│   │   │   ├── layout.tsx                # Admin layout (sidebar + auth gate)
│   │   │   ├── page.tsx                  # Dashboard (stats + recent orders)
│   │   │   ├── products/page.tsx         # Product list with bulk delete
│   │   │   ├── products/new/page.tsx     # Create product
│   │   │   ├── products/[id]/edit/page.tsx # Edit product
│   │   │   ├── orders/page.tsx           # Order management
│   │   │   ├── orders/[id]/page.tsx      # Order detail + status update
│   │   │   ├── categories/page.tsx       # Category management
│   │   │   ├── inventory/page.tsx        # Stock levels
│   │   │   ├── reports/page.tsx          # Sales reports
│   │   │   ├── homepage/page.tsx         # Homepage section editor
│   │   │   ├── banners/page.tsx          # Banner management
│   │   │   └── users/page.tsx            # User management
│   │   ├── admin-login/page.tsx          # Admin login (password only)
│   │   ├── owner/                        # Owner analytics dashboard
│   │   │   ├── layout.tsx                # Owner layout (auth gate)
│   │   │   ├── page.tsx                  # Revenue/stock analytics
│   │   │   ├── products/page.tsx         # Read-only product view
│   │   │   ├── products/[id]/page.tsx    # Product detail
│   │   │   └── orders/page.tsx           # All orders
│   │   ├── pos/                          # Point of Sale
│   │   │   ├── layout.tsx                # POS layout (auth gate)
│   │   │   └── page.tsx                  # POS interface
│   │   ├── actions/
│   │   │   ├── auth.ts                   # All auth server actions
│   │   │   ├── orders.ts                 # createOrder server action
│   │   │   └── settings.ts               # Site settings actions
│   │   └── api/
│   │       ├── products/                 # Public product endpoints
│   │       ├── categories/route.ts
│   │       ├── banners/route.ts
│   │       ├── orders/                   # User order endpoints
│   │       ├── profile/route.ts
│   │       ├── pos/products/route.ts     # POS product search
│   │       ├── pos/sale/route.ts         # POS order creation
│   │       ├── admin/                    # All admin CRUD endpoints
│   │       │   ├── products/
│   │       │   ├── orders/
│   │       │   ├── categories/
│   │       │   ├── users/
│   │       │   ├── staff/
│   │       │   ├── inventory/route.ts
│   │       │   ├── stats/route.ts
│   │       │   ├── reports/route.ts
│   │       │   ├── banners/
│   │       │   ├── upload/route.ts
│   │       │   └── seed/route.ts
│   │       └── owner/                    # Owner-specific read-only endpoints
│   ├── components/
│   │   ├── StoreHydration.tsx            # Zustand cart/wishlist rehydration
│   │   ├── layout/
│   │   │   ├── Navbar.tsx                # Customer header
│   │   │   └── Footer.tsx
│   │   ├── admin/
│   │   │   ├── AdminSidebar.tsx          # Admin/owner navigation
│   │   │   ├── AdminLoginView.tsx        # Login form
│   │   │   ├── ProductForm.tsx           # Product create/edit (17KB)
│   │   │   ├── RecentOrdersClient.tsx
│   │   │   └── DashboardQuickAccess.tsx
│   │   ├── store/
│   │   │   ├── HeroBanner.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductCarousel.tsx
│   │   │   ├── CategoryTabsSection.tsx
│   │   │   ├── FilterPanel.tsx
│   │   │   └── CartDrawer.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Badge.tsx
│   │       └── Spinner.tsx
│   ├── lib/
│   │   ├── prisma.ts                     # Prisma singleton client
│   │   ├── session.ts                    # JWT session management
│   │   ├── utils.ts                      # formatPrice, CITIES, SHIPPING_COST
│   │   └── homepage.ts                   # Homepage config types + defaults
│   ├── store/
│   │   ├── cartStore.ts                  # Zustand cart (persisted to localStorage)
│   │   └── wishlistStore.ts              # Zustand wishlist (persisted)
│   ├── types/index.ts                    # TypeScript interfaces
│   └── generated/prisma/                 # Auto-generated Prisma client
├── prisma/
│   ├── schema.prisma                     # Database schema (source of truth)
│   ├── seed.ts                           # Full seed (admin, categories, products)
│   ├── seed.mjs                          # Alternative seed script
│   ├── seed-categories.cjs               # Categories-only seed (used in build)
│   └── migrations/                       # Prisma migration history
│       ├── 20260518231411_init/
│       ├── 20260520000001_categories_and_payment/
│       └── 20260523000001_staff_owner_username/
├── public/images/                        # Local static images
├── .env.example                          # Environment variable template
├── vercel.json                           # Vercel build config
├── next.config.ts                        # Next.js (image hostnames, server actions)
├── tsconfig.json                         # TypeScript (path alias @/*)
├── postcss.config.mjs                    # Tailwind PostCSS
└── package.json
```

---

## Main Pages and Routes

### Customer Store
| Route | Purpose |
|-------|---------|
| `/` | Homepage (configurable sections: hero, new arrivals, featured, categories) |
| `/products` | Product listing with category/season/price filters |
| `/products/[id]` | Product detail: images, variants, size selection, add to cart |
| `/cart` | Shopping cart |
| `/checkout` | Checkout (login required) |
| `/orders` | Customer's order history |
| `/orders/[id]` | Order detail |
| `/login` | Customer login |
| `/register` | Customer registration |
| `/profile` | Edit profile (name, phone, address, city) |
| `/wishlist` | Saved products |

### Admin (password: `12311`)
| Route | Purpose |
|-------|---------|
| `/admin-login` | Admin login |
| `/admin` | Dashboard: stats, recent orders, low-stock alerts |
| `/admin/products` | Product list with bulk delete |
| `/admin/products/new` | Create product |
| `/admin/products/[id]/edit` | Edit product |
| `/admin/orders` | Order management with status updates |
| `/admin/categories` | Category CRUD |
| `/admin/inventory` | Stock level management |
| `/admin/reports` | Sales reports |
| `/admin/homepage` | Customize homepage sections |
| `/admin/banners` | Hero banner management |
| `/admin/users` | User management + staff creation |

### Owner Dashboard (password: `ashraf2024` from SiteSettings DB)
| Route | Purpose |
|-------|---------|
| `/owner` | Analytics: revenue, top products, low stock, trends |
| `/owner/products` | Read-only product list |
| `/owner/orders` | Read-only order list |

### POS System
| Route | Purpose |
|-------|---------|
| `/pos` | In-store POS: search products, add to cart, checkout, create order |

---

## Component Hierarchy

```
RootLayout (app/layout.tsx)
├── StoreHydration (rehydrates Zustand from localStorage)
└── Route groups:
    
    (store) layout → Navbar + Footer
    └── Store pages
        └── ProductCard, ProductCarousel, CategoryTabsSection,
            FilterPanel, CartDrawer, HeroBanner
    
    admin layout → AdminSidebar (auth gate)
    └── Admin pages
        └── ProductForm, RecentOrdersClient, DashboardQuickAccess
    
    owner layout → AdminSidebar in owner mode (auth gate)
    └── Owner pages
    
    pos layout → Auth gate
    └── POS page (self-contained)
```

---

## State Management Approach

**Client-side (Zustand, persisted to localStorage):**
- `cartStore.ts` — Cart items, quantities, totals (key: `zahrt-cart`)
- `wishlistStore.ts` — Wishlist items (key: `zahrt-wishlist`)

**Server-side:**
- JWT cookies for auth sessions:
  - `session` cookie (7 days) — customers, POS users
  - `admin_session` cookie (8 hours) — admin panel only
- All DB operations via Server Actions or API route handlers

**No global client state** beyond cart/wishlist. Each page fetches its own data server-side.

---

## API Integrations

### Neon PostgreSQL + Prisma
All data stored in PostgreSQL. Prisma ORM handles all queries. Connection via `DATABASE_URL` env var.

### Image Storage
Images are hosted on **GitHub CDN via jsDelivr**: `cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig`  
Images are committed to the GitHub repo and served via CDN. No external image service needed.

### No external payment APIs
Payment is manual (Cash on Delivery, Vodafone Cash, InstaPay, Bank Transfer). Customers select method at checkout and pay manually.

---

## Authentication Flow

Four separate authentication contexts, all using JWT + HTTP-only cookies:

| Role | Entry Point | Password | Session Cookie | Duration |
|------|------------|---------|----------------|----------|
| Customer | `/login` | User's own password | `session` | 7 days |
| Admin | `/admin-login` | `12311` | `admin_session` | 8 hours |
| Staff (POS) | `/pos` | Per-user password | `session` | 7 days |
| Owner | `/owner` | `ashraf2024` (SiteSettings) | `session` | 7 days |

All session logic in `src/lib/session.ts`. All auth server actions in `src/app/actions/auth.ts`.

---

## Deployment Process

### Vercel (primary)
```bash
# vercel.json build command:
npx prisma generate && npx prisma db push --accept-data-loss && \
node prisma/seed-categories.cjs && npm run build

# Auto-deploys on git push
# Manual:
npx vercel --prod
```

**Required env vars on Vercel:**
- `DATABASE_URL` — Neon connection string
- `SESSION_SECRET` — JWT signing key (32+ characters)
- `NEXT_PUBLIC_SITE_URL` — Site URL

### Local Development
```bash
cd /home/sherif/sites/zahrtelkhlig
npm install
# Create .env with DATABASE_URL and SESSION_SECRET
npx prisma generate
npx prisma db push
npm run seed        # Seed admin + categories
npm run dev         # http://localhost:3000
```

---

## Common Modification Points

### Add a new product field
1. `prisma/schema.prisma` — add field to `Product` model
2. `npx prisma migrate dev --name add_field` to create migration
3. `src/components/admin/ProductForm.tsx` — add UI input
4. `src/app/api/admin/products/route.ts` — handle in POST/PUT
5. `src/app/(store)/products/[id]/page.tsx` — display to customers

### Change shipping cost
→ `src/lib/utils.ts` — `SHIPPING_COST` constant

### Add a new Egyptian city
→ `src/lib/utils.ts` — `CITIES` array

### Change order number format
→ `src/lib/utils.ts` — `generateOrderNumber()` function

### Add a new homepage section
→ `src/lib/homepage.ts` — add to `DEFAULT_CONFIG` and `SECTION_LABELS`  
→ `src/app/(store)/page.tsx` — render the new section  
→ `src/app/admin/homepage/page.tsx` — add admin UI for the section

### Create a staff account
→ Admin dashboard → Users → Create Staff  
Or: `POST /api/admin/staff` with `{ name, username, password }`

---

## Troubleshooting Guide

**Products not appearing on store:**
- Check `active: true` and `stock > 0` on the product in admin
- Verify category assignment if filtering by category

**Checkout not working:**
- Customer must be logged in — check `session` cookie in browser DevTools
- Verify `SESSION_SECRET` env var is set

**Admin can't log in:**
- Password is `12311` — hardcoded in admin login server action
- Check `admin_session` cookie isn't corrupted — clear cookies and retry

**Database connection errors:**
- Check `DATABASE_URL` is set correctly
- Neon databases pause on free tier — first request may be slow (cold start)
- Run `npx prisma db push` to verify connection

**POS not finding products:**
- Products must be `active: true` with `stock > 0`
- POS search uses product name (Arabic and English)

**Images not loading:**
- Images served from `cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig`
- If images are missing, they need to be committed/pushed to the GitHub repo first
