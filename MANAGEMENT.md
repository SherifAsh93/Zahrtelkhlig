# Zahret El-Khaleej — Technical Management Reference

**Last updated:** 2026-05-19  
**Author:** Sherif  
**Purpose:** Complete technical reference for maintaining, updating, and scaling the store.

---

## 1. Quick Reference Card

| Item | Value |
|------|-------|
| **Live URL** | https://zahrtelkhlig.vercel.app |
| **Admin Panel** | https://zahrtelkhlig.vercel.app/admin |
| **Admin Password** | `114891` |
| **GitHub Repo** | https://github.com/SherifAsh93/Zahrtelkhlig |
| **Vercel Dashboard** | https://vercel.com/sherifs-projects-75c57a99/zahrtelkhlig |
| **Neon DB Console** | https://console.neon.tech |
| **Store Phone** | 01002001446 |
| **Facebook** | https://web.facebook.com/zahrtelkhlig |
| **Instagram** | https://www.instagram.com/zahretelkhaleej.c/ |

---

## 2. Technology Stack

### Core Framework
| Package | Version | Role |
|---------|---------|------|
| **Next.js** | 16.2.6 | Full-stack framework — App Router, Server Components, Server Actions, API Routes |
| **React** | 19.2.4 | UI rendering |
| **TypeScript** | 5 | Static typing |
| **Node.js** | 24 (on Vercel) | Server runtime |

### Database Layer
| Package | Version | Role |
|---------|---------|------|
| **Prisma** | 7.8.0 | ORM — schema definition, migrations, type-safe queries |
| **@prisma/adapter-pg** | 7.8.0 | PostgreSQL connection driver for Prisma 7 |
| **pg** | 8.21.0 | Low-level PostgreSQL client (used by adapter) |

> Prisma generates its client to `src/generated/prisma/` (non-standard path, defined in `prisma/schema.prisma`).  
> Import it as: `import { prisma } from '@/lib/prisma'`

### Styling
| Package | Version | Role |
|---------|---------|------|
| **TailwindCSS** | 4 | Utility classes — uses `@theme inline` syntax (not `tailwind.config.js`) |
| **@tailwindcss/postcss** | 4 | PostCSS integration for Tailwind v4 |

> Tailwind v4 defines custom colors in `src/app/globals.css` under `@theme inline { }`, not in a config file.  
> Brand palette: `--color-brand-50` through `--color-brand-900` (warm terracotta).  
> Gold accent: `--color-gold-400/500/600`.  
> Breakpoints: `sm` = 640px, `lg` = 1024px (mobile-first design throughout).

### Auth & Sessions
| Package | Version | Role |
|---------|---------|------|
| **jose** | 6.2.3 | JWT sign/verify for customer sessions (HTTP-only cookies) |
| **bcryptjs** | 3.0.3 | Password hashing (10 bcrypt rounds) |
| **jsonwebtoken** | 9.0.3 | Legacy token utilities |

> Customer session: JWT in `session` cookie, 7-day expiry.  
> Admin session: password-only check stored in `admin_session` cookie, 1-day expiry.  
> Session helpers: `src/lib/session.ts` — `createSession()`, `getSession()`, `deleteSession()`.

### State Management (Client-Side)
| Package | Version | Role |
|---------|---------|------|
| **zustand** | 5.0.13 | Cart and wishlist state persisted to browser `localStorage` |

> Both stores use `skipHydration: true` + a `StoreHydration` component to avoid React hydration mismatch (SSR renders empty cart, client reads from localStorage).  
> Cart store: `src/store/cartStore.ts` | Key: `zahrt-cart`  
> Wishlist store: `src/store/wishlistStore.ts` | Key: `zahrt-wishlist`

### Media
| Package | Version | Role |
|---------|---------|------|
| **sharp** | 0.34.5 | Server-side image optimization used by Next.js `<Image>` |
| **lucide-react** | 1.16.0 | Icon set used throughout the UI |

---

## 3. Database — Neon PostgreSQL

### Why Neon?
Neon is a serverless PostgreSQL provider with a generous free tier. Since this store stores only text data (product names, orders, user info) and NO binary files, the database stays small indefinitely regardless of how many orders you process.

### Connection Details
```
Host:        ep-noisy-term-aqh1s64r-pooler.c-8.us-east-1.aws.neon.tech
Database:    neondb
User:        neondb_owner
Password:    [SEE_NEON_CONSOLE]
SSL:         required

Full connection string (pooled — use this everywhere):
postgresql://neondb_owner:[SEE_NEON_CONSOLE]@ep-noisy-term-aqh1s64r-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require
```

The **pooled** endpoint is used (note `-pooler` in the hostname). This is critical for serverless — Vercel functions open/close on every request, so pooling prevents connection exhaustion.

### Database Schema

**`User`**
```
id          String    cuid() primary key
email       String    unique
password    String    bcrypt hash
name        String
phone       String?
address     String?
city        String?   one of 27 Egyptian governorates
role        Enum      USER | ADMIN
createdAt   DateTime
updatedAt   DateTime
```

**`Category`**
```
id      String  cuid() primary key
nameAr  String  Arabic name (shown in UI)
nameEn  String  English name
slug    String  unique URL identifier (e.g. "winter", "eid")
image   String? URL of category cover image
```

**`Product`**
```
id            String    cuid() primary key
nameAr        String    Arabic product name
nameEn        String    English product name
descriptionAr Text      Arabic description
descriptionEn Text      English description
price         Float     current selling price (EGP)
comparePrice  Float?    original price before discount (optional)
stock         Int       quantity in stock
images        String[]  array of image URLs (jsDelivr CDN links)
featured      Boolean   appears in "Featured" section on homepage
active        Boolean   visible to customers (false = hidden)
categoryId    String    FK → Category
createdAt     DateTime
updatedAt     DateTime
```

**`Order`**
```
id            String          cuid() primary key
orderNumber   String          unique — format ZH-{base36timestamp}-{random} e.g. ZH-LQXB1A-K9F2
userId        String?         FK → User (null for guest orders)
customerName  String
customerEmail String?
customerPhone String
address       String
city          String
notes         String?
status        Enum            PENDING→CONFIRMED→PROCESSING→SHIPPED→DELIVERED|CANCELLED
paymentMethod Enum            CASH_ON_DELIVERY | VODAFONE_CASH | INSTAPAY
subtotal      Float
shipping      Float           50 EGP flat, or 0 if subtotal ≥ 500 EGP
total         Float
createdAt     DateTime
updatedAt     DateTime
```

**`OrderItem`** (line items within each order)
```
id        String  FK → Order (cascade delete)
orderId   String
productId String  FK → Product
nameAr    String  snapshot of product name at time of order
nameEn    String
price     Float   snapshot of price at time of order
quantity  Int
image     String? snapshot of product image URL
```

**`Banner`** (homepage hero slider)
```
id         String   cuid() primary key
titleAr    String
titleEn    String
subtitleAr String?
image      String   URL of banner image
link       String?  click-through URL
active     Boolean
sortOrder  Int      lower number = shown first
createdAt  DateTime
```

**`Wishlist`** and **`CartItem`** — per-user saved items (server-side backup to localStorage).

### Current Usage (as of 2026-05-19)
| Table | Rows |
|-------|------|
| Product | 21 |
| Category | 5 |
| Banner | 2 |
| User | 1 |
| Order | 0 |
| OrderItem | 0 |
| **Total DB size** | **~7.8 MB** |

### Free Tier Limits
| Resource | Limit | Current | Headroom |
|----------|-------|---------|----------|
| Storage | 512 MB | 7.8 MB | 98.5% free |
| Compute hours | 191.9 hrs/month | ~5 hrs | plenty |
| Branches | 1 | 1 | — |

### Storage Reality Check
With this product rotation model (delete old, add new — no accumulation), the database grows only from **orders and users**. A rough estimate:
- 1 order + items = ~3 KB
- 1 user = ~0.5 KB
- 1 product = ~1 KB

With 10,000 orders and 5,000 users the database would be approximately **35–40 MB** — still 7% of the free tier.  
**Conclusion: The free Neon tier will last many years with this model.**

### Checking Database Size (run on VPS)
```bash
PGPASSWORD=[SEE_NEON_CONSOLE] psql \
  "postgresql://neondb_owner@ep-noisy-term-aqh1s64r-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require" \
  -c "SELECT pg_size_pretty(pg_database_size(current_database())) AS total_size,
             (SELECT COUNT(*) FROM \"Order\") AS orders,
             (SELECT COUNT(*) FROM \"Product\") AS products,
             (SELECT COUNT(*) FROM \"User\") AS users;"
```

### When to Upgrade DB
Only upgrade if you hit **400 MB**. At current scale, that is unlikely to happen.  
Neon Launch plan: **$19/month → 10 GB storage, more compute**.

---

## 4. Image Storage — GitHub + jsDelivr CDN

### Architecture
Images are stored as static files committed to the **GitHub repository** and served through **jsDelivr**, a free global CDN that mirrors GitHub.

```
Admin uploads image
        ↓
GitHub REST API → commits file to repo
        ↓
GitHub repository (SherifAsh93/Zahrtelkhlig)
public/images/products/img_1716123456789.jpg
        ↓
jsDelivr CDN (100+ edge nodes worldwide)
https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/products/img_1716123456789.jpg
        ↓
Customer browser loads image instantly
```

### Why This Works Well
- **Free forever** — jsDelivr has no bandwidth limits for open-source GitHub repos
- **Fast globally** — CDN nodes in Egypt, Gulf, Europe, USA
- **No extra service needed** — GitHub is already where the code lives
- **Permanent URLs** — once committed, images never disappear

### Image Folder Structure
```
public/images/
├── logo.jpg                          Store logo (used in navbar, footer, login)
├── products/
│   ├── p01.jpg … p21.jpg            Original product images
│   └── img_{timestamp}.jpg          New uploads via admin panel
├── banners/
│   ├── banner1.jpg                   Hero slider image 1
│   └── banner2.jpg                   Hero slider image 2
└── categories/
    └── brand.jpg
```

### URL Pattern
```
https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/{folder}/{filename}
```

Example:
```
https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/products/p01.jpg
```

### How to Upload Images (3 ways)

**Way 1 — From the admin panel (recommended for shop staff)**
1. Go to Admin → Products → Add Product (or Edit a product)
2. Tap **"رفع من الجهاز أو الكاميرا"** — opens phone camera or gallery
3. Choose or take a photo → it automatically uploads to GitHub and fills in the URL
4. OR paste any image URL in the text box and tap Add — the system downloads it and re-hosts it permanently

**Way 2 — Manual commit from VPS (for bulk uploads)**
```bash
cp /path/to/image.jpg /home/sherif/zahrtelkhlig/public/images/products/pXX.jpg
cd /home/sherif/zahrtelkhlig
git add public/images/products/pXX.jpg
git commit -m "add product image pXX"
git push origin main
```
CDN URL is immediately: `https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/products/pXX.jpg`

**Way 3 — GitHub web interface**
1. Go to https://github.com/SherifAsh93/Zahrtelkhlig
2. Navigate to `public/images/products/`
3. Click "Add file → Upload files"
4. Drop your images and commit

### jsDelivr Caching Note
- New files: available on CDN **immediately** (new path, no cache)
- Updated files (same filename): CDN cache takes **up to 7 days** to refresh
- **Best practice:** Always use a new filename when replacing an image

### GitHub Repo Limits
| Limit | Threshold | Current Status |
|-------|-----------|---------------|
| Soft warning | 1 GB repo size | ~2.5 MB used (0.25%) |
| Hard limit | 5 GB | far away |
| Single file max | 100 MB | our images are 50–300 KB each |

### Storage Reality Check for Images
With the product rotation model:
- When you delete a product in the admin panel, the **image file stays in GitHub** (it's not auto-deleted from the repo)
- However, since images are small (50–300 KB each), even 500 product images = ~75 MB = still 7.5% of the GitHub soft limit
- **Conclusion: GitHub free tier handles this indefinitely for a normal fashion store.**

### When to Clean Up Old Images
Only necessary when repo approaches 800 MB. To bulk-delete old unused images from the repo, run on VPS:
```bash
cd /home/sherif/zahrtelkhlig
git rm public/images/products/p01.jpg
git commit -m "remove unused image"
git push origin main
```

### When to Migrate Images to a Real CDN
If you ever need more than 5 GB of images, migrate to **Cloudinary** (free: 25 GB):
1. Create free Cloudinary account
2. Upload images there instead
3. Replace jsDelivr URLs with Cloudinary URLs in the DB

---

## 5. Deployment — Vercel

### How It Works
The repository is connected to Vercel. Every `git push` to `main` triggers an **automatic production deployment**. No manual action needed in normal operation.

To deploy manually:
```bash
cd /home/sherif/zahrtelkhlig
npx vercel deploy --prod --yes
```

### Build Process
1. Vercel pulls the `main` branch from GitHub
2. Runs `npm run build` (Next.js production build)
3. Generates static pages where possible
4. Deploys serverless functions for dynamic routes (`/api/**`, `/admin/**`, `/checkout`, etc.)
5. Aliases to `zahrtelkhlig.vercel.app`

### Vercel Free Tier (Hobby Plan) Limits
| Resource | Limit | Notes |
|----------|-------|-------|
| Bandwidth | 100 GB/month | A product page with images is ~500 KB; 100 GB = ~200,000 page loads |
| Function duration | 300 seconds max | More than enough for any request |
| Build minutes | 6,000/month | Each deploy takes ~2 min; covers 3,000 deploys/month |
| Deployments | Unlimited | — |
| Concurrent builds | 1 | Only one deploy at a time |
| Custom domains | Supported | Add via Vercel dashboard |

### Environment Variables on Vercel
These must be set in Vercel dashboard (Settings → Environment Variables):

| Variable | Value location | Purpose |
|----------|---------------|---------|
| `DATABASE_URL` | Neon connection string | Database access |
| `SESSION_SECRET` | `zahrtelkhlig-super-secret-key-2024-production-jwt-signing` | JWT signing |
| `GITHUB_TOKEN` | `[SEE_GITHUB_PAT_IN_VERCEL_ENV]` | Image upload via GitHub API |
| `NEXT_PUBLIC_SITE_URL` | `https://zahrtelkhlig.vercel.app` | Canonical URL |

> **GitHub Token note:** Personal access tokens expire or can be revoked. If image upload fails with "unauthorized", generate a new token at GitHub → Settings → Developer Settings → Personal Access Tokens (Classic). Scope needed: `repo`. Then update in Vercel: `npx vercel env add GITHUB_TOKEN production`

### Allowed Image Domains (next.config.ts)
The `<Image>` component only loads from these domains:
- `cdn.jsdelivr.net` (primary — jsDelivr CDN)
- `raw.githubusercontent.com`
- `**.fbcdn.net` (Facebook CDN)
- `**.facebook.com`
- `placehold.co`, `via.placeholder.com` (testing only)

---

## 6. Admin Panel — Full Feature Reference

### Access
- URL: `https://zahrtelkhlig.vercel.app/admin`
- This is a **separate login** from the customer account
- Password: `114891`
- Session lasts 1 day, then requires re-login

### Sections

#### Dashboard (`/admin`)
- Total orders, total revenue, active products, registered users
- Last 8 orders with status and amount
- Order status breakdown chart

#### Products (`/admin/products`)
- List with image thumbnail, name, category, price, stock, active/featured status
- Search by product name (client-side, instant)
- Pagination (15 per page)
- **Add Product** → `/admin/products/new`
- **Edit** (pencil icon) → `/admin/products/{id}/edit`
- **Delete** (trash icon) → confirms then calls `DELETE /api/admin/products/{id}`

#### Add/Edit Product Form
Fields:
- Arabic name *(required)*
- English name
- Arabic description
- English description
- Price in EGP *(required)*
- Compare price (original price before discount — shows as strikethrough + discount % badge)
- Stock quantity *(required)*
- Category *(required)*
- **Images** — two methods:
  1. **Upload from device/camera** — tap button, choose photo from gallery or take with camera. File is uploaded to GitHub via the API, CDN URL is automatically added.
  2. **Paste URL** — paste any image link (Facebook, Instagram, WhatsApp, any website). URL is downloaded and re-hosted to GitHub for permanence.
  - Multiple images supported. First image is the main product photo.
  - Thumbnails show with a red × to remove.
- Featured toggle (shows on homepage featured section)
- Active toggle (hidden from customers when off)

#### Categories (`/admin/categories`)
- List with name (Arabic + English), slug, product count
- Add/Edit via modal form (Arabic name, English name, slug, cover image URL)
- Delete (warns if products exist in category)

#### Orders (`/admin/orders`)
- Filter by status: Pending, Confirmed, Processing, Shipped, Delivered, Cancelled
- Mobile card view: order number, customer name, phone, city, total, date, status badge + "View Details" button
- Click any order → `/admin/orders/{id}` for full details and status update

#### Order Detail (`/admin/orders/{id}`)
- Full customer info, shipping address, payment method, notes
- Line-by-line order items with images
- Dropdown to update order status
- Status progression: PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED

#### Users (`/admin/users`)
- List of all registered customers
- Avatar initial, name, email, phone, city, order count, role badge, registration date

#### Banners (`/admin/banners`)
- Homepage hero slider images
- Add/Edit via modal: Arabic title, English title, subtitle, image URL, click-through link, active toggle, sort order
- Sort order: lower number appears first in the slider

---

## 7. Customer-Facing Pages

| Page | Route | Notes |
|------|-------|-------|
| Homepage | `/` | Hero slider, category tiles, CTA, featured products, new arrivals |
| Products | `/products` | Filter by category/price, 2-col mobile grid, 3-4 col desktop |
| Product Detail | `/products/{id}` | Image gallery, add to cart, wishlist, related products |
| Cart | `/cart` | Update quantities, remove items, shipping calculation |
| Checkout | `/checkout` | Address form, payment method, order summary — requires login |
| Orders | `/orders` | Customer's order history — requires login |
| Order Detail | `/orders/{id}` | Tracking status, items, totals |
| Profile | `/profile` | Update name, phone, address, city |
| Wishlist | `/wishlist` | Saved products, add to cart from wishlist |
| Login | `/login` | Email + password, redirects back to intended page |
| Register | `/register` | Name, email, password, phone (optional), city (optional) |

---

## 8. Business Rules (Code Locations)

| Rule | Current Value | File | Line |
|------|--------------|------|------|
| Flat shipping cost | 50 EGP | `src/lib/utils.ts` | `SHIPPING_COST = 50` |
| Free shipping threshold | 500 EGP | `src/lib/utils.ts` | `FREE_SHIPPING_THRESHOLD = 500` |
| Vodafone Cash number | 01002001446 | `src/app/checkout/CheckoutForm.tsx` | ~line 148 |
| InstaPay number | 01002001446 | `src/app/checkout/CheckoutForm.tsx` | ~line 156 |
| Available cities | 27 Egyptian governorates | `src/lib/utils.ts` | `CITIES` array |
| Products per page (admin) | 15 | `src/app/admin/products/page.tsx` | `limit=15` |
| Products per page (store) | 12 | `src/app/products/page.tsx` | `limit = 12` |
| Related products count | 4 | `src/app/products/[id]/page.tsx` | `take: 4` |

To change shipping cost to 70 EGP:
```typescript
// src/lib/utils.ts
export const SHIPPING_COST = 70        // was 50
export const FREE_SHIPPING_THRESHOLD = 600  // optional: raise threshold too
```
Then commit and push — auto-deploys in ~2 minutes.

---

## 9. Order Number Format

Format: `ZH-{BASE36_TIMESTAMP}-{4_RANDOM_CHARS}`  
Example: `ZH-LQXB1A-K9F2`

Generated in: `src/lib/utils.ts` → `generateOrderNumber()`

---

## 10. Local Development Setup

### Prerequisites
- Node.js 18 or higher
- Git

### Steps
```bash
cd /home/sherif/zahrtelkhlig
npm install
```

Create (or verify) `.env.local`:
```env
DATABASE_URL="postgresql://neondb_owner:[SEE_NEON_CONSOLE]@ep-noisy-term-aqh1s64r-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require"
SESSION_SECRET="zahrtelkhlig-super-secret-key-2024-production-jwt-signing"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
GITHUB_TOKEN="[SEE_GITHUB_PAT_IN_VERCEL_ENV]"
```

```bash
npm run dev        # http://localhost:3000 (or 3001 if 3000 is busy)
```

### Useful Commands
```bash
npm run dev              # development server with hot reload
npm run build            # production build — catches TypeScript errors
npm run db:studio        # Prisma Studio at localhost:5555 — visual database browser
npm run db:migrate       # apply new schema changes to live database
npm run db:generate      # regenerate Prisma client after schema.prisma changes
```

---

## 11. Deploying Code Changes

### Standard Flow
```bash
cd /home/sherif/zahrtelkhlig

# Make your changes to any file...

git add -A                         # or git add specific files
git commit -m "description"
git push origin main               # triggers auto-deploy on Vercel
```
Vercel build takes ~2 minutes. Visit https://zahrtelkhlig.vercel.app after.

### Force Deploy Without Code Change
```bash
npx vercel deploy --prod --yes
```

### Git Push Authentication
If prompted for a password when pushing, use the token:
```
Username: SherifAsh93
Password: [SEE_GITHUB_PAT_IN_VERCEL_ENV]
```
> If this token stops working (tokens can expire or be revoked), generate a new one at:  
> GitHub → Settings → Developer Settings → Personal Access Tokens (Classic)  
> Scopes: `repo`  
> Then update remote URL: `git remote set-url origin https://SherifAsh93:{NEW_TOKEN}@github.com/SherifAsh93/Zahrtelkhlig.git`

---

## 12. Project File Structure

```
zahrtelkhlig/
├── prisma/
│   └── schema.prisma              Database schema definition
├── public/
│   └── images/                    All store images (committed to GitHub, served via jsDelivr)
│       ├── logo.jpg
│       ├── products/
│       ├── banners/
│       └── categories/
├── src/
│   ├── app/                       Next.js App Router pages
│   │   ├── layout.tsx             Root layout (fonts, StoreHydration)
│   │   ├── page.tsx               Homepage
│   │   ├── globals.css            Tailwind theme + custom CSS (colors, marquee)
│   │   ├── products/
│   │   │   ├── page.tsx           Products listing + filter
│   │   │   └── [id]/
│   │   │       ├── page.tsx       Product detail (server)
│   │   │       └── ProductDetailClient.tsx  (client — cart/wishlist actions)
│   │   ├── cart/page.tsx
│   │   ├── checkout/
│   │   │   ├── page.tsx           Auth guard (redirects to login if not logged in)
│   │   │   └── CheckoutForm.tsx   Order form (client)
│   │   ├── orders/
│   │   │   ├── page.tsx           Order list (server)
│   │   │   └── [id]/page.tsx      Order detail
│   │   ├── wishlist/page.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── admin-login/page.tsx   Admin login (separate from customer login)
│   │   ├── admin/
│   │   │   ├── layout.tsx         Admin auth guard + sidebar
│   │   │   ├── page.tsx           Dashboard
│   │   │   ├── products/
│   │   │   │   ├── page.tsx       Products list (mobile cards + desktop table)
│   │   │   │   ├── new/page.tsx   Add product
│   │   │   │   └── [id]/edit/page.tsx  Edit product
│   │   │   ├── categories/page.tsx
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx       Orders list
│   │   │   │   └── [id]/page.tsx  Order detail + status update
│   │   │   ├── users/page.tsx
│   │   │   └── banners/page.tsx
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── products/      GET list, POST create, PUT update, DELETE
│   │   │   │   ├── categories/    CRUD
│   │   │   │   ├── orders/        GET list + GET single + PUT status
│   │   │   │   ├── users/         GET list
│   │   │   │   ├── banners/       CRUD
│   │   │   │   ├── stats/         GET dashboard stats
│   │   │   │   └── upload/        POST — GitHub image upload
│   │   │   ├── profile/           GET + PUT user profile
│   │   │   └── products/          GET search (for client-side search if needed)
│   │   └── actions/
│   │       ├── auth.ts            login, logout, register Server Actions
│   │       └── orders.ts          createOrder Server Action
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx         Top bar: logo, cart, wishlist, account, mobile menu
│   │   │   └── Footer.tsx         Footer: links, social, contact, copyright
│   │   ├── store/
│   │   │   ├── ProductCard.tsx    Product tile with image, name, price, badges, cart/wishlist
│   │   │   ├── FilterPanel.tsx    Mobile: horizontal chips + price drawer | Desktop: sidebar
│   │   │   ├── CartDrawer.tsx     Slide-out cart panel
│   │   │   └── HeroSlider.tsx     Homepage banner carousel
│   │   ├── admin/
│   │   │   ├── AdminSidebar.tsx   Desktop collapsible sidebar + mobile bottom tab bar
│   │   │   └── ProductForm.tsx    Add/edit product form (with file upload + URL paste)
│   │   ├── StoreHydration.tsx     Zustand localStorage hydration (fixes SSR mismatch)
│   │   └── ui/
│   │       ├── Button.tsx         Primary, secondary, outline variants with loading state
│   │       ├── Badge.tsx          success/danger/warning/info/default variants
│   │       └── Spinner.tsx        Loading indicator
│   ├── lib/
│   │   ├── prisma.ts              Prisma client singleton (prevents multiple instances in dev)
│   │   ├── session.ts             JWT create/read/delete (jose library)
│   │   └── utils.ts               formatPrice, generateOrderNumber, slugify, CITIES, SHIPPING_COST
│   ├── store/
│   │   ├── cartStore.ts           Zustand cart: addItem, removeItem, updateQuantity, total, clear
│   │   └── wishlistStore.ts       Zustand wishlist: toggleItem, isInWishlist, items
│   └── generated/
│       └── prisma/                Auto-generated Prisma client — DO NOT edit manually
├── .env.local                     Local dev env vars (not committed to git)
├── next.config.ts                 Next.js config: allowed image domains, server actions
├── tailwind.config.ts             Does NOT exist — Tailwind v4 uses globals.css @theme inline
├── tsconfig.json                  TypeScript config
├── package.json                   Dependencies and npm scripts
└── MANAGEMENT.md                  This document
```

---

## 13. Monitoring Checklist

Run these commands on the VPS to check system health:

### Database Size + Table Counts
```bash
PGPASSWORD=[SEE_NEON_CONSOLE] psql \
  "postgresql://neondb_owner@ep-noisy-term-aqh1s64r-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require" \
  -c "SELECT pg_size_pretty(pg_database_size(current_database())) AS db_size;
      SELECT relname AS table, n_live_tup AS rows FROM pg_stat_user_tables ORDER BY n_live_tup DESC;"
```

### Image Storage Size
```bash
du -sh /home/sherif/zahrtelkhlig/public/images/
find /home/sherif/zahrtelkhlig/public/images -type f | wc -l
```

### Upgrade Thresholds
| Service | Act when | Upgrade to | Cost |
|---------|----------|------------|------|
| Neon DB | 400 MB used | Neon Launch | $19/month |
| GitHub repo | 800 MB total | Cloudinary images | Free (25 GB) |
| Vercel | 80 GB bandwidth/month | Vercel Pro | $20/month |

---

## 14. Common Operations

### Add a New Product (admin panel)
1. Go to `/admin/products/new`
2. Fill Arabic name, price, stock, category (minimum required)
3. Upload product photo from phone camera or paste URL
4. Check "نشط ومرئي" (active)
5. Click "إضافة المنتج"

### Remove an Old Product (admin panel)
1. Go to `/admin/products`
2. Find the product, tap the trash icon
3. Confirm deletion

### Update Order Status (admin panel)
1. Go to `/admin/orders`
2. Click "عرض التفاصيل" on the order
3. Change status dropdown → Save

### Change Shipping Cost
Edit `src/lib/utils.ts`:
```typescript
export const SHIPPING_COST = 70          // new value in EGP
export const FREE_SHIPPING_THRESHOLD = 600
```
Then: `git add src/lib/utils.ts && git commit -m "update shipping cost" && git push`

### Add a New Category
1. Go to `/admin/categories`
2. Click "إضافة قسم"
3. Fill Arabic name, English name (slug auto-generates from English name)
4. Optionally add a cover image URL for the homepage category section

### Update a Banner
1. Go to `/admin/banners`
2. Click "تعديل" on the banner
3. Change image URL, title, or link
4. Set sort order (0 = first in slider)

---

## 15. Security Notes

- Admin password is stored as a **bcrypt hash** in the database — the plain text `114891` is never stored
- Customer passwords use bcrypt with 10 rounds
- Sessions are HTTP-only cookies (inaccessible to JavaScript, prevents XSS theft)
- All admin API routes (`/api/admin/**`) check for `role === 'ADMIN'` before executing
- The `DATABASE_URL` and `GITHUB_TOKEN` are only in Vercel environment variables, never in the public code

---

*End of management reference.*
