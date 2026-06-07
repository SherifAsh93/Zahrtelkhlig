# Zahrtelkhlig — Setup Guide

## Prerequisites

- Node.js 18+ (Node 24 recommended)
- npm
- A Neon PostgreSQL database (neon.tech)
- Vercel account (for deployment)

---

## Installation Steps

```bash
# 1. Navigate to project
cd /home/sherif/sites/zahrtelkhlig

# 2. Install dependencies
npm install

# 3. Create .env with required variables
cp .env.example .env
nano .env  # Fill in DATABASE_URL and SESSION_SECRET

# 4. Generate Prisma client
npx prisma generate

# 5. Push schema to database (creates all tables)
npx prisma db push

# 6. Seed initial data (admin user + categories)
npm run seed

# 7. Start development server
npm run dev
# Visit http://localhost:3000
```

---

## Required Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
# Neon PostgreSQL connection string (required)
DATABASE_URL="postgresql://username:password@ep-xyz.us-east-1.aws.neon.tech/dbname?sslmode=require"

# JWT signing secret — min 32 characters, keep it secret
SESSION_SECRET="your-super-secret-jwt-signing-key-minimum-32-chars"

# Public site URL (used in metadata and server action config)
NEXT_PUBLIC_SITE_URL="https://zahrtelkhlig.vercel.app"

# Admin email (used in metadata)
ADMIN_EMAIL="admin@zahrtelkhlig.com"
```

**How to generate SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**On Vercel:** Add all vars in Project Settings → Environment Variables.

---

## All Dependencies and Why They Are Used

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.2.6 | React framework: App Router, Server Components, Server Actions, API routes |
| `react` | 19.2.4 | UI rendering |
| `react-dom` | 19.2.4 | DOM rendering |
| `prisma` | 7.8.0 | Database ORM CLI (migrate, generate, studio) |
| `@prisma/client` | 7.8.0 | Generated Prisma client for DB queries |
| `@prisma/adapter-pg` | 7.8.0 | PostgreSQL adapter for Prisma |
| `pg` | 8.21.0 | Node PostgreSQL client (used by Prisma adapter) |
| `bcryptjs` | 3.0.3 | Password hashing for user accounts (12 rounds) |
| `jose` | 6.2.3 | JWT creation/verification for sessions |
| `jsonwebtoken` | 9.0.3 | Additional JWT utilities (backup) |
| `zustand` | 5.0.13 | Client-side state: shopping cart + wishlist (persisted to localStorage) |
| `lucide-react` | 1.16.0 | Icon library |
| `sharp` | 0.34.5 | Server-side image optimization (used by Next.js Image component) |
| `server-only` | 0.0.1 | Marks modules as server-only, prevents accidental client import |
| `next-auth` | 5.0.0-beta.31 | Installed but not actively used (replaced by custom JWT sessions) |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | 4 | Utility-first CSS |
| `@tailwindcss/postcss` | 4 | Tailwind v4 PostCSS plugin |
| `typescript` | 5 | Type safety |
| `ts-node` | 10.9.2 | Run TypeScript seed scripts directly |
| `eslint` | 9 | Linting |
| `eslint-config-next` | 16.2.6 | Next.js ESLint rules |
| `@types/*` | latest | TypeScript type definitions |

---

## Development Workflow

```bash
# Start dev server
npm run dev
# → http://localhost:3000

# Admin panel: /admin-login (password: 114891)
# Owner dashboard: /owner (password: ashraf2024)
# POS: /pos (admin username: admin, password: 114891)

# Lint
npm run lint

# Database operations
npm run db:migrate      # Run pending migrations
npm run db:generate     # Regenerate Prisma client
npm run db:studio       # Open Prisma Studio at localhost:5555
npm run seed            # Seed admin + categories + sample products

# Build
npm run build
npm start
```

---

## Build and Deployment Commands

### Vercel Deployment

The `vercel.json` build command runs all necessary steps automatically:

```json
{
  "buildCommand": "npx prisma generate && npx prisma db push --accept-data-loss && node prisma/seed-categories.cjs && npm run build"
}
```

**Steps on each Vercel deploy:**
1. `prisma generate` — Regenerate Prisma client from schema
2. `prisma db push` — Push schema changes to Neon DB
3. `seed-categories.cjs` — Ensure categories exist (idempotent)
4. `next build` — Build Next.js app

```bash
# Manual Vercel deploy
npx vercel --prod
```

### Local production build
```bash
npm run build   # Generates Prisma client + builds Next.js
npm start       # Starts on port 3000
```

---

## Default Credentials After Seeding

| Role | Email/Username | Password |
|------|---------------|---------|
| Admin | `admin` (username) | `114891` |
| Owner | — | `ashraf2024` (from SiteSettings) |

After seeding, create staff accounts via: Admin Dashboard → Users → Create Staff.

---

## Image Handling

Product images are stored on **GitHub via jsDelivr CDN**:

```
https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/products/filename.jpg
```

To add a new product image:
1. Place the image file in `public/images/products/`
2. Commit and push to GitHub: `git add public/images/ && git commit -m "add product images" && git push`
3. Use the jsDelivr URL format above as the image URL in the admin product form

The `next.config.ts` already allows `cdn.jsdelivr.net` as an image hostname.
