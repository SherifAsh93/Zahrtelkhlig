# Tech Stack

Every dependency in use, with version, purpose, and rationale.

---

## Core Framework

### Next.js 16.2.6

**Purpose**: Full-stack React framework. Provides server components, server actions, API routes, file-based routing, image optimization, and Vercel deployment integration.

**Key features used**:
- App Router (not Pages Router)
- Server Components for all data-fetching pages
- Client Components (`'use client'`) for interactive UI (Zustand, forms with useActionState)
- Server Actions (`'use server'`) for form submissions
- API Routes (Route Handlers) for REST endpoints
- `next/font/google` for Cairo and Cormorant Garamond with `display: 'swap'`
- `revalidatePath()` for on-demand ISR after settings changes
- `redirect()` inside server actions for post-form navigation
- `next/image` for optimized image serving

**Why not Remix / other frameworks**: Project was built on Vercel; Next.js + Vercel is the tightest integration path with zero-config deployment, edge middleware, and serverless functions.

**Build command**: `prisma generate && prisma db push --accept-data-loss && next build`
(Schema sync happens at build time on Vercel)

---

### React 19.2.4

**Purpose**: UI component runtime.

**Key features used**:
- `useActionState` hook for server action form handling (replaces `useFormState` from React 18)
- Suspense boundaries for streaming
- Server/Client component distinction from Next.js App Router

---

### TypeScript ^5

**Purpose**: Type safety across the entire codebase.

**Key patterns**:
- Strict mode enabled via `tsconfig.json`
- Prisma generates its own types from the schema into `src/generated/prisma/`
- `src/types/index.ts` exports application-level types (`CartItem`, `WishlistItem`, `ProductWithCategory`, `SessionUser`, `Language`)
- Separate `tsconfig.seed.json` for seed scripts (ts-node compatible, looser module settings)

---

## Styling

### Tailwind CSS ^4

**Purpose**: Utility-first CSS framework.

**Version note**: Tailwind v4 uses a fundamentally different configuration model from v3. There is no `tailwind.config.js`; instead, the theme is defined in `globals.css` using the `@theme inline` directive.

**PostCSS integration**: `@tailwindcss/postcss` ^4 + `postcss.config.mjs`.

**RTL handling**: Tailwind v4 respects the inherited `dir="rtl"` attribute from the root `<html>`. Logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`) are used where direction-aware spacing matters.

**Brand theme definition in `globals.css`**:
```css
@theme inline {
  /* Fonts */
  --font-cairo: var(--font-cairo);
  --font-cormorant: var(--font-cormorant);

  /* Arabic-optimized line heights */
  --leading-normal: 1.75;     /* vs Tailwind default 1.5 */
  --leading-relaxed: 1.9;
  --leading-loose: 2.25;

  /* Brand palette — dusty rose / clay */
  --color-brand-50:  #fdf6f3;
  --color-brand-100: #f8ede8;
  --color-brand-200: #edd5cc;
  --color-brand-300: #dab5a8;
  --color-brand-400: #c2907e;
  --color-brand-500: #b07060;
  --color-brand-600: #9a5848;
  --color-brand-700: #7a4338;
  --color-brand-800: #562e25;
  --color-brand-900: #361b15;

  /* Gold accent */
  --color-gold-400: #e8c96a;
  --color-gold-500: #c9a84c;
  --color-gold-600: #a68530;
}
```

These values are used in components as `bg-brand-100`, `text-brand-600`, `border-brand-200`, etc.

---

## Database

### PostgreSQL via Neon

**Purpose**: Primary relational database.

**Why Neon**: Serverless PostgreSQL with HTTP-based connection pooling designed for Vercel's serverless environment. Free tier includes 0.5 GB storage and automatic suspend after inactivity. Cold-start latency is acceptable for this traffic volume. Neon handles connection pooling automatically, eliminating the need for PgBouncer.

**Connection**: `DATABASE_URL` environment variable. The `pg` package connects to Neon's serverless pooler endpoint.

---

### Prisma ^7.8.0

**Purpose**: ORM — type-safe DB access, schema management, migrations.

**Generator**: `generator client { provider = "prisma-client" }` — generates into `src/generated/prisma/` (not the default `node_modules`). This is required for Vercel's build system to find the client.

**Migration strategy**: `prisma db push` (not `prisma migrate dev`) at build time. `db push` applies schema changes directly without creating migration files. Appropriate for rapid iteration; the flag `--accept-data-loss` is set because schema changes during development may drop columns.

**Scripts**:
```json
"build": "prisma generate && prisma db push --accept-data-loss && next build"
"db:migrate": "prisma migrate dev"
"db:generate": "prisma generate"
"db:studio": "prisma studio"
```

---

### @prisma/adapter-pg ^7.8.0 + pg ^8.21.0

**Purpose**: Prisma adapter for raw pg (node-postgres) client, required for Vercel serverless compatibility.

**Why needed**: The default Prisma TCP connection mode does not work reliably in Vercel's serverless functions due to connection limits and cold-start behavior. The `@prisma/adapter-pg` adapter routes all Prisma queries through the `pg` client which uses Neon's serverless HTTP driver.

**Usage** in `src/lib/prisma.ts`:
```typescript
import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

The global singleton pattern prevents Prisma from creating a new client on every hot-reload during development.

---

## Authentication

### Jose ^6.2.3

**Purpose**: JWT creation and verification. Used for both session cookies.

**Why not NextAuth / Auth.js**: NextAuth adds significant complexity (callback URLs, provider configuration, database adapters) that is unnecessary for this project's simple email/password + hardcoded admin password model. Jose is a pure JavaScript JWT library with no native dependencies, works in all environments (including Edge runtime), and is straightforward to use directly.

**Algorithm**: HS256 (HMAC-SHA256) with `SESSION_SECRET` key.

**Session creation**:
```typescript
new SignJWT(payload)
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuedAt()
  .setExpirationTime('7d')  // or '8h' for admin
  .sign(encodedKey)
```

**Session reading**:
```typescript
const { payload } = await jwtVerify(session, encodedKey, { algorithms: ['HS256'] })
```

**Expiry**: Regular session 7 days. Admin session 8 hours.

---

### bcryptjs ^3.0.3

**Purpose**: Password hashing for all user accounts.

**Why bcryptjs and not bcrypt**: `bcrypt` is a native Node.js module that requires compilation (`node-gyp`). This breaks on many CI/CD systems and Vercel's build environment. `bcryptjs` is a pure JavaScript implementation with identical bcrypt output, no native dependencies, and zero compilation issues. The trade-off is slightly slower execution — negligible for authentication latency.

**Cost factor**: 12 for all hashes (`bcrypt.hash(password, 12)`). This is applied consistently for customer registration, staff account creation, and any future admin password hashing.

**Verification**: `bcrypt.compare(plaintext, hash)` — constant-time comparison preventing timing attacks.

---

## State Management

### Zustand ^5.0.13

**Purpose**: Client-side state for cart and wishlist. Also used for UI state in complex admin components.

**Why Zustand over Redux / Context**: Zero boilerplate, no provider wrapping, works natively outside React (can access store state in plain JS), and Zustand 5 has excellent TypeScript inference.

**Persist middleware**: Both stores use `zustand/middleware` `persist` to sync state to localStorage. `skipHydration: true` is set on both stores to prevent SSR hydration mismatch — the server renders an empty cart, and the client rehydrates from localStorage in a `useEffect`.

**localStorage keys**:
- Cart: `"zahrt-cart"`
- Wishlist: `"zahrt-wishlist"`

**Rehydration**: `StoreHydration.tsx` renders in the root layout's `<body>` and calls `useCartStore.persist.rehydrate()` and `useWishlistStore.persist.rehydrate()` in a `useEffect`. This ensures the stores are populated exactly once per page load, after hydration.

---

## Icons

### lucide-react ^1.16.0

**Purpose**: Icon library used throughout the admin, store, and owner dashboard.

**Why lucide-react**: Consistent SVG icon set designed for React, tree-shakeable (only imports what is used), compatible with Tailwind styling via `className`, and maintained with regular icon additions.

**Usage pattern**: Icons sized with the `size` prop or `className="w-4 h-4"`:
```tsx
import { ShoppingBag, Search, Heart } from 'lucide-react'
<ShoppingBag size={20} className="text-brand-600" />
```

---

## Fonts

### Cairo (Google Font)

**Purpose**: Primary Arabic + Latin typeface. Loaded via `next/font/google` with subsets `['arabic', 'latin']` and weights 300–800.

**Why Cairo**: Designed specifically for Arabic script with high legibility at all weights, includes Latin characters for mixed content, and has excellent hinting for screen rendering.

### Cormorant Garamond (Google Font)

**Purpose**: Decorative English serif typeface for brand headings and English labels. Weights 300–700 in both normal and italic styles.

**Why Cormorant Garamond**: Luxury fashion aesthetic. High contrast, elegant serifs. Used sparingly for decorative English text that appears alongside Arabic primary headings.

---

## Utilities

### server-only ^0.0.1

**Purpose**: Marks modules as server-only — prevents them from being imported in client components. Used in `src/lib/session.ts` (`import 'server-only'` at the top). If a client component accidentally imports `session.ts`, Next.js throws a build error.

### sharp ^0.34.5

**Purpose**: Image optimization used internally by Next.js for the `<Image>` component (resizing, format conversion, WebP generation). Required as a peer dependency on Vercel.

### jsonwebtoken ^9.0.3

**Purpose**: Listed in dependencies alongside Jose. Not actively used in the primary session flow (which uses Jose), but present as a potential fallback or was used in an earlier iteration. Jose is the active JWT implementation.

---

## Development Dependencies

### @tailwindcss/postcss ^4

PostCSS plugin required to process Tailwind v4 directives (`@import "tailwindcss"`, `@theme`).

### ts-node ^10.9.2

Required for running seed scripts (`prisma/seed.ts`) via `npm run seed`. Uses `tsconfig.seed.json` which has `module: "CommonJS"` to be compatible with ts-node's module resolution.

### eslint ^9 + eslint-config-next 16.2.6

Standard Next.js lint configuration. Run via `npm run lint`.

---

## Environment Variables

| Variable | Required | Used in |
|---|---|---|
| `DATABASE_URL` | Yes | `src/lib/prisma.ts`, `prisma.config.ts` |
| `SESSION_SECRET` | Yes | `src/lib/session.ts` (JWT signing key) |
| `GITHUB_TOKEN` | Yes (for uploads) | `src/app/api/admin/upload/route.ts`, `src/app/api/admin/media/route.ts` |
| `NEXT_PUBLIC_SITE_URL` | Optional | Public base URL for og:url and canonical |
| `NODE_ENV` | Auto | Cookie `secure` flag + Prisma singleton |

`ADMIN_PASSWORD` is NOT an environment variable — it is hardcoded as `"12311"` in `src/app/actions/auth.ts`. This is a known simplification.
