# AI Implementation Guide

This document is written for an AI assistant (or engineer) continuing development on this codebase. It contains the rules, patterns, and warnings that must be followed to maintain architectural consistency.

---

## Architecture Rules — Non-Negotiable

### 1. Always Use Dual Session Cookies

The system has two independent session cookies. Never collapse them into one.

- `session` cookie: customers, staff, owner. Created by `createSession()`. Deleted by `deleteSession()`.
- `admin_session` cookie: admin only. Created by `createAdminSession()`. Deleted by `deleteAdminSession()`.

When adding a new admin-adjacent feature:
- If it should be accessible by ADMIN via `/admin` → use `getAdminSession()` guard
- If it should be accessible by STAFF/ADMIN → use `getSession()` + role check

Never mix the two guards on the same route.

### 2. Always Snapshot in OrderItem

When creating OrderItems (in any context — online checkout, POS, future subscription orders), always copy these fields from the product:
- `nameAr` — Arabic name at time of order
- `nameEn` — English name at time of order
- `price` — price at time of order
- `image` — first image URL at time of order

The `productId` is kept for analytics joins, but the snapshot fields are the authoritative display data. Never query the live product to display order history.

### 3. Always Use Server Actions for Form Mutations

If the trigger is an HTML form submit, use a server action in `src/app/actions/`. Do not create an API route + client-side fetch for form submissions.

Pattern to replicate:
```typescript
// src/app/actions/yourFeature.ts
'use server'
import { getAdminSession } from '@/lib/session'

export async function createThing(
  _: unknown,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await getAdminSession()
  if (!session) return { error: 'غير مصرح' }

  const name = formData.get('name') as string
  if (!name) return { error: 'الاسم مطلوب' }

  await prisma.thing.create({ data: { name } })
  return { success: true }
  // OR: redirect('/admin/things')
}
```

Use `useActionState` in the form component:
```typescript
'use client'
import { useActionState } from 'react'
import { createThing } from '@/app/actions/yourFeature'

const [state, action, isPending] = useActionState(createThing, {})
```

### 4. Always revalidatePath After Settings Changes

Any server action or API route that modifies data that appears on a cached page must call `revalidatePath()`:

```typescript
import { revalidatePath } from 'next/cache'

// After saving homepage config
revalidatePath('/')

// After updating a product that might be on homepage
revalidatePath('/')
revalidatePath('/products')

// After updating category
revalidatePath('/products')
```

Forgetting this causes stale content to persist until the next deployment.

### 5. Always Calculate Aggregate Stock from Parts

When saving a product with `variants` or `sizeStock`, always recalculate `stock` from the parts. Never accept `stock` as a user-provided field when variants exist.

```typescript
// In any product create/update handler:
if (Array.isArray(body.variants)) {
  body.stock = (body.variants as { qty: number }[]).reduce((a, v) => a + v.qty, 0)
} else if (body.sizeStock && typeof body.sizeStock === 'object') {
  body.stock = Object.values(body.sizeStock as Record<string, number>)
    .reduce((a: number, b: number) => a + b, 0)
}
```

The `stock` field must always equal the sum of all variant quantities. Violating this causes incorrect low-stock alerts and potential overselling.

---

## Implementation Checklist for New Features

When adding any new significant feature, verify each item:

**Database changes**:
- [ ] New model fields use `nameAr` / `nameEn` pattern for all user-visible strings
- [ ] `prisma db push` and `prisma generate` run after schema changes
- [ ] JSON fields typed with explicit cast interfaces
- [ ] Cascade deletes set where child records should not survive parent deletion

**Authentication**:
- [ ] New routes/APIs call the correct guard (`getAdminSession` vs `getSession` + role check)
- [ ] New server actions verify session before any DB writes
- [ ] Error return is `{ error: 'غير مصرح' }` in Arabic for user-facing auth failures

**API routes**:
- [ ] Local `adminGuard()` or `posGuard()` function defined at top of file
- [ ] All handlers start with `if (!await guard()) return Response.json({ error }, { status: 403 })`
- [ ] Pagination uses `skip: (page - 1) * limit, take: limit` pattern
- [ ] Counts run in `Promise.all` with the data query

**UI/Forms**:
- [ ] Arabic is the primary language in all UI text
- [ ] New bilingual DB fields displayed with Arabic first, English secondary
- [ ] New Zustand stores with persist use `skipHydration: true` and are added to `StoreHydration.tsx`
- [ ] New images use jsDelivr CDN URLs from the GitHub repo (not local `/public/`)

**After any mutation that affects cached pages**:
- [ ] `revalidatePath()` called for all affected routes

---

## Patterns to Replicate

### Role Guard for a New Dashboard

```typescript
// src/app/newdash/layout.tsx
import { getSession } from '@/lib/session'
import NewDashLoginView from './NewDashLoginView'

export default async function NewDashLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'MANAGER') {
    return <NewDashLoginView />
  }
  return <>{children}</>
}
```

```typescript
// src/app/api/manager/something/route.ts
import { getSession } from '@/lib/session'

async function managerGuard() {
  const session = await getSession()
  if (!session || session.role !== 'MANAGER') return null
  return session
}

export async function GET() {
  if (!await managerGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  // ...
}
```

### New Zustand Store with Rehydration

```typescript
// src/store/compareStore.ts
'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CompareStore {
  ids: string[]
  add: (id: string) => void
  remove: (id: string) => void
  clear: () => void
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set) => ({
      ids: [],
      add: (id) => set((s) => ({ ids: [...s.ids, id] })),
      remove: (id) => set((s) => ({ ids: s.ids.filter((i) => i !== id) })),
      clear: () => set({ ids: [] }),
    }),
    { name: 'zahrt-compare', skipHydration: true },
  ),
)
```

```typescript
// src/components/StoreHydration.tsx — add one line:
useEffect(() => {
  useCartStore.persist.rehydrate()
  useWishlistStore.persist.rehydrate()
  useCompareStore.persist.rehydrate()  // ← add this
}, [])
```

### Bilingual Naming for New DB Fields

```prisma
// Always add BOTH fields for user-visible content
model Collection {
  id       String @id @default(cuid())
  nameAr   String    // "كولكشن الصيف"
  nameEn   String    // "Summer Collection"
  taglineAr String   // Optional bilingual tagline
  taglineEn String
  slug     String @unique  // "summer-2026" (single language, URL-safe)
}
```

In queries, always select both:
```typescript
prisma.collection.findMany({
  select: { id: true, nameAr: true, nameEn: true, slug: true }
})
```

### Stock Reduction in a New Sale Context

If building a subscription or pre-order feature that reduces stock:

```typescript
// Always verify before reducing
const product = await prisma.product.findUnique({ where: { id: productId } })
const variants = product.variants as Variant[] | null

if (size && color && variants) {
  const variant = variants.find(v => v.size === size && v.color === color)
  if (!variant || variant.qty < quantity) throw new Error('Insufficient stock')

  const updatedVariants = variants.map(v =>
    v.size === size && v.color === color
      ? { ...v, qty: Math.max(0, v.qty - quantity) }
      : v
  )
  const newTotal = updatedVariants.reduce((a, v) => a + v.qty, 0)
  const sizeStock: Record<string, number> = {}
  for (const v of updatedVariants) { sizeStock[v.size] = (sizeStock[v.size] || 0) + v.qty }

  await prisma.product.update({
    where: { id: productId },
    data: { variants: updatedVariants as unknown as object[], sizeStock, stock: newTotal },
  })
} else {
  if (product.stock < quantity) throw new Error('Insufficient stock')
  await prisma.product.update({
    where: { id: productId },
    data: { stock: { decrement: quantity } },
  })
}
```

Copy this pattern exactly. Deviations break the invariant.

---

## Warnings

### POS Stock Reduction Must Be Atomic Within the Request

The POS sale endpoint (`POST /api/pos/sale`) verifies stock, creates the order, then reduces stock — all in a single HTTP request. This is NOT wrapped in a Prisma transaction, which means a crash between order creation and stock reduction leaves the order without reduced stock.

**If improving this**: Wrap the stock reduction in a Prisma transaction with the order creation:
```typescript
await prisma.$transaction(async (tx) => {
  const order = await tx.order.create({ ... })
  for (const item of items) {
    await tx.product.update({ ... })
  }
  return order
})
```

Until this is done, the current code has a known race condition under concurrent requests. For the current business volume (single physical store), this is acceptable.

### Never Remove onDelete: Cascade from OrderItem

The `OrderItem` → `Order` relationship has `onDelete: Cascade`. This means deleting an Order automatically deletes its OrderItems.

```prisma
order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
```

This must NEVER be changed to `onDelete: Restrict` or removed. If cascade is removed:
- Deleting an order from the admin panel will fail with a foreign key violation
- The admin order delete endpoint will break

### Owner Dashboard is Read-Only by Design

There are NO write endpoints under `/api/owner/*`. This is intentional. The owner role is for viewing analytics only, not for making changes.

Do not add write endpoints to the owner namespace. If the owner needs to make a change (e.g., approve an order), add that capability to the admin dashboard instead, or create a separate endpoint under `/api/admin/` that can be called if the user has ADMIN session.

### Never Commit .env Files

The `.env.local` file contains `SESSION_SECRET` and `GITHUB_TOKEN`. If these are committed to the public GitHub repo, the secrets are immediately compromised.

The `.gitignore` should already contain `.env.local`. Verify before adding files to staging.

### Admin Password is Hardcoded

The admin password `114891` is hardcoded as a string literal in two places in `src/app/actions/auth.ts`:
1. In `adminLogin` action
2. In `posLogin` action (for the admin username path)

It is NOT in an environment variable. To change the password, edit both occurrences. A future improvement would move it to `SiteSettings["admin_password"]` (same pattern as owner password) — but this change requires updating both places.

### Image CDN URLs Are Permanent

jsDelivr CDN caches files aggressively (weeks/months). If you overwrite a file in GitHub with the same filename, the CDN may serve the old version for a long time. Always use unique filenames (`img_{Date.now()}.{ext}` ensures this for new uploads). Never reuse filenames.

If a file must be updated, delete the old one and upload a new one with a new filename. Update all DB references to the old URL.

### JSON Fields Require Double-Cast

When writing to Prisma `Json?` fields with typed arrays, the double-cast is required:
```typescript
data: { variants: updatedVariants as unknown as object[] }
```

Using a single cast `as object[]` will work at runtime but TypeScript will error. Using no cast causes TypeScript to reject the assignment because `Variant[]` is not assignable to Prisma's `InputJsonValue`. Always use `as unknown as object[]`.

---

## Code Snippets to Copy for New Features

### New Admin API Route Template

```typescript
// src/app/api/admin/feature/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'

async function adminGuard() {
  const session = await getAdminSession()
  if (!session) return null
  return session
}

export async function GET(req: NextRequest) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')

  const [items, total] = await Promise.all([
    prisma.model.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.model.count(),
  ])

  return Response.json({ items, total })
}

export async function POST(req: NextRequest) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const item = await prisma.model.create({ data: body })
  return Response.json(item, { status: 201 })
}
```

### New Server Action Template

```typescript
// src/app/actions/feature.ts
'use server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export async function createFeature(
  _: unknown,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const session = await getAdminSession()
  if (!session) return { error: 'غير مصرح' }

  const nameAr = formData.get('nameAr') as string
  const nameEn = formData.get('nameEn') as string

  if (!nameAr || !nameEn) return { error: 'جميع الحقول مطلوبة' }

  await prisma.feature.create({ data: { nameAr, nameEn } })
  revalidatePath('/admin/features')

  return { success: true }
}
```

### New Prisma Model with Bilingual Fields

```prisma
model Feature {
  id        String   @id @default(cuid())
  nameAr    String
  nameEn    String
  active    Boolean  @default(true)
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### New Homepage Section Component

```typescript
// src/components/store/AnnouncementSection.tsx
'use client'
import type { SectionAnnouncement } from '@/lib/homepage'

export default function AnnouncementSection({ config }: { config: SectionAnnouncement }) {
  if (!config.enabled) return null

  return (
    <section className="py-8 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-brand-700 text-lg font-cairo">{config.text}</p>
        {config.link && (
          <a href={config.link} className="mt-4 inline-block text-brand-500 underline">
            اقرأ المزيد
          </a>
        )}
      </div>
    </section>
  )
}
```

Then in `(store)/page.tsx`, add a case:
```typescript
case 'announcement':
  return <AnnouncementSection key={key} config={config.sections.announcement} />
```

### Verify Stock Before Any New Sale Type

Always use this pattern before reducing stock in any new sale context:
```typescript
async function verifyAndReduceStock(
  productId: string,
  quantity: number,
  size?: string,
  color?: string
) {
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) throw new Error(`Product not found: ${productId}`)

  const variants = product.variants as { size: string; color: string; qty: number }[] | null

  if (size && color && variants) {
    const variant = variants.find(v => v.size === size && v.color === color)
    if (!variant || variant.qty < quantity) {
      throw new Error(`Insufficient stock for ${product.nameAr} size ${size} / ${color}`)
    }
    const updated = variants.map(v =>
      v.size === size && v.color === color
        ? { ...v, qty: Math.max(0, v.qty - quantity) }
        : v
    )
    const newTotal = updated.reduce((a, v) => a + v.qty, 0)
    const sizeStock: Record<string, number> = {}
    for (const v of updated) { sizeStock[v.size] = (sizeStock[v.size] || 0) + v.qty }
    await prisma.product.update({
      where: { id: productId },
      data: { variants: updated as unknown as object[], sizeStock, stock: newTotal },
    })
  } else {
    if (product.stock < quantity) throw new Error(`Insufficient stock for ${product.nameAr}`)
    await prisma.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    })
  }
}
```

---

## Summary of Invariants

| Invariant | File | Consequence if violated |
|---|---|---|
| `product.stock` === sum of variant qtys | `api/admin/products/route.ts`, `api/pos/sale/route.ts` | Incorrect inventory counts, overselling |
| OrderItem snapshots nameAr/nameEn/price/image | `actions/orders.ts`, `api/pos/sale/route.ts` | Broken order history if product changes |
| Admin routes use `admin_session` | All `api/admin/*` files | Unauthorized access |
| POS routes use `session` with role check | All `api/pos/*` files | Unauthorized access |
| StoreHydration rehydrates all persist stores | `components/StoreHydration.tsx` | Client-side state always empty on load |
| `revalidatePath('/')` after homepage config save | `actions/settings.ts` | Stale homepage served after config change |
| `onDelete: Cascade` on OrderItem | `prisma/schema.prisma` | Admin order delete broken |
| bcryptjs cost 12 | `actions/auth.ts`, `api/admin/staff/route.ts` | Weaker password hashes |
| Unique filenames for images | `api/admin/upload/route.ts` | CDN cache collisions |
