# Coding Standards

## Bilingual Naming Convention

Every user-visible string in the database uses dual fields: one Arabic (`Ar` suffix), one English (`En` suffix). This is the single most pervasive pattern in the codebase and must be followed for all new models that contain content a user will see.

**Established pattern from Product model**:
```prisma
model Product {
  nameAr        String
  nameEn        String
  descriptionAr String
  descriptionEn String
}
```

**From Category model**:
```prisma
model Category {
  nameAr String
  nameEn String
}
```

**From Banner model**:
```prisma
model Banner {
  titleAr    String
  titleEn    String
  subtitleAr String?
  subtitleEn String?
}
```

**From OrderItem** (snapshot at order time):
```prisma
model OrderItem {
  nameAr String   // snapshot of product.nameAr at time of order
  nameEn String   // snapshot of product.nameEn at time of order
}
```

**Rule**: Arabic (`Ar`) fields are always the primary display field. The Arabic name is always shown first in UI. English (`En`) fields are used for: search indexing (searchable from admin), SEO hints, and decorative display in certain admin sections. Never use a single `name` field for user-visible content.

**Exception**: Internal/system identifiers do not need dual fields. `sku`, `slug`, `orderNumber`, `username`, `key` (SiteSettings) — these are single-language.

---

## TypeScript Patterns

### Strict Mode

TypeScript strict mode is enabled in `tsconfig.json`. This means:
- No implicit `any`
- Strict null checks
- All function parameters must be typed

### Type Sources

Three sources of types in this project, used in different contexts:

1. **Prisma-generated types** — `src/generated/prisma/` — for all database model shapes. Used directly in API routes and server actions:
   ```typescript
   import { PrismaClient } from '@/generated/prisma/client'
   ```

2. **Application types** — `src/types/index.ts` — for client-side shapes that differ from DB models (e.g., `CartItem` adds `quantity` and `stock` fields that don't exist in DB `CartItem`):
   ```typescript
   export interface CartItem {
     id: string
     productId: string
     nameAr: string
     nameEn: string
     price: number
     image: string
     quantity: number
     stock: number
   }
   ```

3. **Inline types** — for request bodies and API responses. These are defined inline within the route file:
   ```typescript
   interface Variant { size: string; color: string; qty: number }
   interface CartItem { productId: string; nameAr: string; price: number; quantity: number }
   ```

### JSON Field Typing

Prisma's `Json` type returns `unknown` by default. Cast explicitly with interface assertions:
```typescript
const variants = product.variants as Variant[] | null
```

When writing JSON fields back to Prisma, use the double-cast pattern:
```typescript
data: { variants: updatedVariants as unknown as object[] }
```

---

## Server Actions vs API Routes — Decision Rules

### Use Server Actions when:
- The trigger is an HTML `<form>` submission
- You need `useActionState` for inline error display
- You need `redirect()` after success
- You need `revalidatePath()` after a mutation

Examples from this codebase:
- `login`, `register`, `logout` — form submissions on `/login`, `/register`
- `createOrder` — form submission on `/checkout`
- `saveHomepageConfig` — triggered from `HomepageSettingsForm`
- `createStaffAccount`, `deleteUser`, `updateUser` — admin user management forms

### Use API Routes when:
- The trigger is a client-side fetch (not a form)
- You need a JSON response with specific shape
- The mutation is complex enough to need explicit JSON error responses
- Multiple client components fetch from the same endpoint

Examples:
- All `/api/admin/*` — client components fetch these to populate admin UI
- `/api/pos/sale` — POS checkout needs to return `{ orderNumber, orderId }` to update UI
- `/api/admin/inventory` PATCH — stock adjustment from the inventory table UI
- `/api/products`, `/api/categories`, `/api/banners` — public reads from server and client components

---

## Error Handling Patterns

### Server Actions

Server actions return `{ error?: string }` for validation failures. They do NOT throw (throwing in a server action propagates to the error boundary). On success, they call `redirect()`.

```typescript
export async function login(_: unknown, formData: FormData): Promise<{ error?: string }> {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' }

  await createSession({ ... })
  redirect(redirectTo)  // success path — no return needed
}
```

The action signature uses `_: unknown` as the first parameter because `useActionState` passes the previous state as the first argument. Server actions that are called directly (not via `useActionState`) can omit this parameter, but the pattern is consistent.

### API Routes

API routes return `Response.json({ error: string }, { status: number })` for errors:
```typescript
if (!session) return Response.json({ error: 'Forbidden' }, { status: 403 })
if (!product) return Response.json({ error: 'Not found' }, { status: 404 })
```

Standard status codes in use:
- `200` — success (default for Response.json)
- `201` — resource created
- `400` — bad request / validation error
- `401` — not authenticated
- `403` — authenticated but not authorized
- `404` — resource not found
- `500` — server error (GitHub API failures, etc.)

### Guard Functions

Each protected route namespace defines a local `adminGuard()` or `posGuard()` function:

```typescript
// In admin API routes:
async function adminGuard() {
  const session = await getAdminSession()
  if (!session) return null
  return session
}

export async function GET(req: NextRequest) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  // ...
}
```

```typescript
// In POS API routes:
async function posGuard() {
  const session = await getSession()
  if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) return null
  return session
}
```

This pattern keeps the guard logic co-located with the route file. There is no shared middleware file for API routes.

---

## Prisma Query Patterns

### Select vs Include

Use `include` when you need related model data:
```typescript
prisma.product.findMany({
  include: { category: { select: { id: true, nameAr: true, nameEn: true, slug: true } } },
})
```

Use `select` to limit returned fields (especially in owner/stats endpoints to reduce data transfer):
```typescript
prisma.product.findMany({
  select: { id: true, nameAr: true, sku: true, stock: true },
})
```

Never use bare `include: { category: true }` in public-facing endpoints — always restrict with `select` inside `include`.

### Pagination Pattern

```typescript
const [items, total] = await Promise.all([
  prisma.model.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  }),
  prisma.model.count({ where }),
])
return Response.json({ items, total, page, pages: Math.ceil(total / limit) })
```

Default `limit` is 20 for admin lists, 12 for public product lists.

### Upsert Pattern (SiteSettings)

```typescript
await prisma.siteSettings.upsert({
  where:  { key: 'homepage_config' },
  update: { value: JSON.stringify(config) },
  create: { key: 'homepage_config', value: JSON.stringify(config) },
})
```

---

## Utility Function Patterns

All utilities live in `src/lib/utils.ts`. Currently exported:

```typescript
formatPrice(price: number): string
// Uses Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' })
// Returns Arabic numeral formatting with EGP suffix

generateOrderNumber(): string
// Returns: ZH-{timestamp in base36 uppercase}-{4 random chars}
// Example: ZH-LXKJT2-AB3F

slugify(text: string): string
// Lowercases, strips non-word chars, replaces spaces/underscores with hyphens

CITIES: string[]
// 27 Egyptian governorates in Arabic, used in checkout city dropdown

SHIPPING_COST = 50        // EGP
FREE_SHIPPING_THRESHOLD = 500  // EGP — subtotal >= 500 → free shipping
PAYMENT_PHONE = '01002001446'  // Vodafone Cash / InstaPay number
BANK_ACCOUNT = '100047644822'  // Bank transfer account number
```

New utility functions should be added to `utils.ts`. Do not create separate utility files.

---

## Import Conventions

Path alias `@/` maps to `src/`. Always use this alias:
```typescript
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { formatPrice } from '@/lib/utils'
import type { CartItem } from '@/types'
```

Never use relative imports for lib or types:
```typescript
// Wrong:
import { prisma } from '../../lib/prisma'

// Correct:
import { prisma } from '@/lib/prisma'
```

---

## Component Conventions

### Server vs Client Boundary

- Default: server component (no directive needed)
- Add `'use client'` only when the component uses: browser APIs, React hooks (`useState`, `useEffect`, `useRef`), Zustand stores, or event handlers
- All components in `src/store/` that render cart/wishlist state must be `'use client'`
- The admin dashboard pages that fetch data via client-side `useEffect` + `fetch` must be `'use client'`

### Naming

- Components: PascalCase (`ProductCard.tsx`, `AdminSidebar.tsx`)
- Pages: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx`
- Route handlers: `route.ts`
- Utilities / lib: camelCase (`session.ts`, `homepage.ts`)
- Store files: camelCase with Store suffix (`cartStore.ts`, `wishlistStore.ts`)
