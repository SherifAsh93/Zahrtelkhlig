# زهرة الخليج (Zahrtelkhlig) — PROJECT_CONTEXT

## What It Does

Full-featured Arabic RTL ecommerce store for women's fashion (زهرة الخليج). Customers browse, filter, and order products online with size/color selection. Includes a customer account system, cart, wishlist, order tracking, admin panel, POS terminal for in-store sales, and an owner analytics dashboard.

**Live URL:** https://zahrtelkhlig.vercel.app  
**GitHub:** https://github.com/SherifAsh93/Zahrtelkhlig  
**Local:** `/home/sherif/sites/zahrtelkhlig`  
**Status:** COMPLETE & CLOSED as of 2026-06-08  
**Stack:** Next.js 16 · TypeScript 5 · Tailwind CSS 4 · Neon PostgreSQL · Prisma 7 · Jose (JWT) · Zustand 5 · GitHub + jsDelivr CDN

---

## Structure

```
zahrtelkhlig/
├── src/app/
│   ├── (store)/             # Customer-facing store (Arabic RTL)
│   │   ├── page.tsx         # Homepage
│   │   ├── products/        # Product listing + detail
│   │   ├── cart/            # Cart
│   │   ├── checkout/        # Checkout (Vodafone Cash / InstaPay)
│   │   ├── orders/          # Order tracking
│   │   ├── profile/         # User profile
│   │   ├── auth/            # Login / Register
│   │   └── wishlist/
│   ├── admin/               # Admin panel (password: 114891)
│   │   ├── page.tsx         # Dashboard + stats
│   │   ├── products/        # Product CRUD + bulk delete
│   │   ├── orders/          # Order management
│   │   ├── inventory/       # Detailed stock control
│   │   ├── users/           # User + staff management
│   │   ├── categories/      # Category management
│   │   ├── banners/         # Banner management
│   │   ├── media/           # Image library (upload/delete, drag-and-drop)
│   │   ├── homepage/        # Homepage settings
│   │   └── reports/         # Daily sales reports (online vs in-store)
│   ├── pos/                 # POS terminal for staff
│   ├── owner/               # Owner analytics (no password)
│   └── api/                 # REST endpoints (auth, products, orders, admin/*)
├── prisma/
│   ├── schema.prisma        # Full DB schema
│   └── seed.mjs / seed.ts
├── public/images/           # Product/category/banner images → jsDelivr CDN
├── .env.local               # Secrets (never commit)
└── package.json
```

---

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Homepage — banners, categories, products |
| `/products` | Product listing with filters/search |
| `/products/[id]` | Product detail + size/color selection |
| `/cart` | Shopping cart |
| `/checkout` | Checkout (Vodafone Cash / InstaPay) |
| `/orders` | Order tracking (logged-in user) |
| `/profile` | User profile |
| `/auth/login` | Customer login |
| `/auth/register` | Customer registration |
| `/wishlist` | Wishlist |
| `/admin` | Admin panel — password: `114891` |
| `/pos` | POS terminal (staff, no password required) |
| `/owner` | Owner analytics — no password, auto-refresh 5min |

---

## How to Run

```bash
cd /home/sherif/sites/zahrtelkhlig
npm install
cp .env.example .env.local
# Fill in DATABASE_URL, SESSION_SECRET, GITHUB_TOKEN
npx prisma generate
npx prisma db push
npm run dev    # http://localhost:3001
npm run build
```

**Required env vars:**
- `DATABASE_URL` — Neon PostgreSQL connection string
- `SESSION_SECRET` — JWT signing key (32+ chars)
- `GITHUB_TOKEN` — GitHub PAT with `repo` scope (for image uploads)

---

## Database

Neon PostgreSQL. Tables: `Product`, `Order`, `OrderItem`, `User`, `Category`, `Banner`, `CartItem`, `Wishlist`, `SiteSettings`.

**Prisma Studio:**
```bash
npx prisma studio  # http://localhost:5555
```

**Direct psql connection string** is in `.env.local` as `DATABASE_URL`.

---

## Image Storage

Images stored in `public/images/` in the GitHub repo via GitHub API, served via jsDelivr CDN:
```
https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/{folder}/{filename}
```
Folders: `products/`, `categories/`, `banners/`.

---

## How to Continue

- **Add products:** Admin → `/admin/products/new`
- **Manage orders:** Admin → `/admin/orders`
- **Image library:** Admin → `/admin/media`
- **Schema changes:** Edit `prisma/schema.prisma` → `npx prisma db push` → `npx prisma generate`
- **Deploy:** Push to `main` → Vercel auto-deploys

---

## Known Issues

- Project is marked COMPLETE & CLOSED. No active development expected.
- `GITHUB_TOKEN` must be set in Vercel env vars for image uploads to work.

---

## Next Steps

- Project closed. Maintenance only — no planned features as of 2026-06-14.
