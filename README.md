# زهرة الخليج — Gulf Flower Women's Fashion Store

Full Arabic RTL ecommerce platform for a women's fashion store in Egypt. Includes customer storefront, admin panel, in-store POS terminal, and owner analytics dashboard.

**Live URL:** https://zahrtelkhlig.vercel.app  
**GitHub:** https://github.com/SherifAsh93/Zahrtelkhlig  
**Status:** Complete & Closed (2026-06-08) — Maintenance only

---

## Tech Stack

| Technology | Version |
|---|---|
| Next.js | 16.2.6 (App Router) |
| React | 19.2.4 |
| TypeScript | 5 |
| TailwindCSS | 4 |
| Prisma | 7.8.0 |
| PostgreSQL | Neon (serverless, free tier) |
| jose | 6.2.3 (JWT sessions) |
| Zustand | 5.0.13 (cart state) |
| Hosting | Vercel (auto-deploy on push to main) |
| Images | GitHub repo + jsDelivr CDN |

---

## Features

- **Storefront** — Arabic RTL product catalog, cart, checkout (Vodafone Cash / InstaPay), order tracking, wishlist, user accounts
- **Admin panel** (`/admin`, password: `12311`) — product CRUD, order management, inventory control, user/staff management, media library, daily sales reports
- **POS terminal** (`/pos`) — staff login, cart, discount field, stock deduction, thermal receipt printing
- **Owner dashboard** (`/owner`) — KPI cards, 30-day sales chart, top products, low-stock alerts, activity feed, auto-refresh every 15s
- **Role-based auth** — USER, STAFF, OWNER, ADMIN (jose JWT, cookie-based sessions)

---

## Quick Start

```bash
git clone https://github.com/SherifAsh93/Zahrtelkhlig.git
cd Zahrtelkhlig
npm install
cp .env.example .env.local
# Set DATABASE_URL, SESSION_SECRET, GITHUB_TOKEN in .env.local
npx prisma generate
npx prisma db push
npm run dev     # http://localhost:3000
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `SESSION_SECRET` | JWT signing key (32+ random characters) |
| `GITHUB_TOKEN` | GitHub PAT with `repo` scope (for image upload/delete) |

---

## Database

Neon PostgreSQL. Tables: `User`, `Product`, `Category`, `Order`, `OrderItem`, `CartItem`, `Wishlist`, `Banner`, `SiteSettings`.

```bash
npm run db:studio   # Prisma Studio at http://localhost:5555
```

---

## Image Storage

Images are stored directly in the GitHub repository under `public/images/` via the GitHub API and served through jsDelivr CDN:

```
https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/{folder}/{filename}
```

Folders: `products/`, `categories/`, `banners/`

---

## Deployment

Vercel auto-deploys on every push to `main`. Build command (in `vercel.json`):

```
npx prisma generate && npx prisma db push --accept-data-loss && node prisma/seed-categories.cjs && npm run build
```

Required Vercel environment variables: `DATABASE_URL`, `SESSION_SECRET`, `GITHUB_TOKEN`

---

## Project Documentation

See [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) for full technical documentation including folder structure, database schema, reusable modules, lessons learned, and WebistryDev metadata.
