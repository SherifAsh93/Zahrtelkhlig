# Backend Patterns

## Server Actions Architecture

All server actions live in `src/app/actions/` with `'use server'` at the top of each file. Three files cover the full domain:

### `auth.ts` — All Authentication Actions

| Function | Input | What it does | Success | Error shape |
|---|---|---|---|---|
| `login` | formData: email, password, redirect | Finds user by email, bcrypt.compare, createSession | redirect(redirectTo) | `{ error: string }` |
| `register` | formData: name, email, password, phone, redirect | Validates → checks duplicate email → bcrypt.hash(12) → create user → createSession | redirect(redirectTo) | `{ error: string }` |
| `logout` | — | deleteSession | redirect('/') | — |
| `adminLogin` | formData: password | Compares against hardcoded "114891" → createAdminSession | redirect('/admin') | `{ error: string }` |
| `adminLogout` | — | deleteAdminSession | redirect('/admin') | — |
| `posLogin` | formData: username, password | If username==="admin": check "114891" → find admin user → createSession. Else: find by username, role must be STAFF, bcrypt.compare → createSession | redirect('/pos') | `{ error: string }` |
| `posLogout` | — | deleteSession | redirect('/pos') | — |
| `ownerLogin` | formData: password | Reads SiteSettings["owner_password"] (default "ashraf2024") → compare → createSession(role OWNER) | redirect('/owner') | `{ error: string }` |
| `ownerLogout` | — | deleteSession | redirect('/owner') | — |
| `createStaffAccount` | formData: name, username, password | Admin guard → validate username regex `^[a-z0-9_]+$` → check duplicate username → bcrypt.hash(12) → create User(role STAFF, email: `{username}@staff.zahrtelkhlig`) | `{ success: true }` | `{ error: string }` |
| `deleteUser` | userId: string | Admin guard → nullify order.userId → delete cartItems → delete wishlist → delete user | `{ success: true }` | `{ error: string }` |
| `updateUser` | userId, data object | Admin guard → prisma.user.update | `{ success: true }` | `{ error: string }` |

Key implementation detail for `posLogin`: Admin login at the POS uses the hardcoded password but still creates a regular `session` cookie (not `admin_session`). This means an admin logged into POS is not authenticated for admin API routes. The two session types are intentionally separate.

Key implementation detail for `ownerLogin`: Creates a session with synthetic data (`userId: 'owner'`, `role: 'OWNER'`). The owner is not a database User record.

### `orders.ts` — Order Creation

`createOrder(_: unknown, formData: FormData)`:

1. Reads `session` cookie (optional — guests can order)
2. Parses `formData.get('cart')` JSON string → array of `{ productId, nameAr, nameEn, price, quantity, image }`
3. Calculates `subtotal = sum(price * qty)`
4. `shipping = subtotal >= 500 ? 0 : 50`
5. `total = subtotal + shipping`
6. `prisma.order.create` with nested `items.create` array
7. OrderItems store snapshots of `nameAr`, `nameEn`, `price`, `image` at order time
8. `redirect(`/orders/${order.id}?success=true`)`

There is NO stock reduction in this action. Online orders go to `PENDING` status and require admin to manually process fulfillment.

Order number format: `ZH-{timestamp.toString(36).toUpperCase()}-{random 4 chars}` from `generateOrderNumber()`.

### `settings.ts` — Homepage Config

`saveHomepageConfig(config: HomepageConfig)`:

1. Verifies `getAdminSession()` — throws `Error('Unauthorized')` if not admin (not a return, an actual throw — the only server action that throws)
2. `prisma.siteSettings.upsert({ where: { key: 'homepage_config' }, ... })`
3. `revalidatePath('/')` — invalidates the Next.js cache for the homepage so the new config takes effect immediately

---

## Admin API Guard Pattern

Every admin API route file defines a local `adminGuard` function:

```typescript
async function adminGuard() {
  const session = await getAdminSession()
  if (!session) return null
  return session
}
```

And each handler calls it as the first thing:
```typescript
export async function GET(req: NextRequest) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  // ... handler logic
}
```

`getAdminSession()` reads the `admin_session` cookie, decrypts the JWT, and verifies `payload.role === 'ADMIN'`. If the role field is not exactly `'ADMIN'`, the function returns null.

**No middleware file**: Route protection is not done via `middleware.ts` for API routes. The guard is co-located with each handler. This is intentional — it avoids a single point of failure and makes each route's authorization requirement explicit and readable.

---

## POS Stock Reduction Algorithm

The POS sale (`POST /api/pos/sale`) performs stock reduction immediately after creating the order. The algorithm is:

### Step 1: Verify Stock (Pre-Flight)
```typescript
for (const item of items) {
  const product = await prisma.product.findUnique({ where: { id: item.productId } })

  if (item.size && item.color && variants) {
    // Full variant: check specific variant qty
    const variant = variants.find(v => v.size === item.size && v.color === item.color)
    if ((variant?.qty ?? 0) < item.quantity) → error
  } else if (item.size && variants) {
    // Size-only: sum all variants for this size
    const total = variants.filter(v => v.size === item.size).reduce((a, v) => a + v.qty, 0)
    if (total < item.quantity) → error
  } else {
    // Simple stock
    if (product.stock < item.quantity) → error
  }
}
```

### Step 2: Create Order
```typescript
prisma.order.create({
  data: {
    orderNumber: `POS-${String(count + 1).padStart(4, '0')}`,
    status: 'DELIVERED',  // immediate — POS sales are always fulfilled
    source: 'POS',
    shipping: 0,          // no shipping for in-store sales
    // ...
  }
})
```

POS counter is `await prisma.order.count()` — uses total order count (ONLINE + POS) as the sequence. This means POS order numbers are not sequential if online orders exist. The number is a globally-incrementing integer padded to 4 digits.

### Step 3: Reduce Stock (Post-Create)
```typescript
for (const item of items) {
  if (item.size && item.color && variants) {
    // Full variant mode
    const updatedVariants = variants.map(v =>
      v.size === item.size && v.color === item.color
        ? { ...v, qty: Math.max(0, v.qty - item.quantity) }
        : v
    )
    const newTotal = updatedVariants.reduce((a, v) => a + v.qty, 0)
    const sizeStock: Record<string, number> = {}
    for (const v of updatedVariants) {
      sizeStock[v.size] = (sizeStock[v.size] || 0) + v.qty
    }
    await prisma.product.update({
      where: { id: item.productId },
      data: { variants: updatedVariants, sizeStock, stock: newTotal },
    })
  } else {
    // Simple mode
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    })
  }
}
```

**All three fields updated together**: `variants`, `sizeStock`, and `stock` are always updated in the same `prisma.product.update` call when full variant mode is used. This maintains the invariant that `stock === sum(variants[].qty)`.

**`Math.max(0, qty - sold)`**: Stock never goes negative. This is a safety guard — if stock verification passed (step 1) and the system is not concurrent, this shouldn't be needed, but it prevents corruption under edge conditions.

---

## Order Creation Flow (Online)

```
1. Customer fills CheckoutForm
2. Form submits to createOrder server action
3. Server reads:
   - Session cookie (optional — null for guests)
   - FormData fields: customerName, customerEmail, customerPhone, address, city, notes, paymentMethod
   - FormData field "cart" → JSON.parse → CartItem[]
4. Calculate totals:
   subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
   shipping = subtotal >= 500 ? 0 : 50
   total = subtotal + shipping
5. prisma.order.create:
   {
     orderNumber: generateOrderNumber(),
     userId: session?.userId ?? null,  // null for guests
     paymentMethod: validated enum,
     items: { create: cart.map(i => ({ ...snapshot })) }
   }
6. redirect(`/orders/${order.id}?success=true`)
7. Client detects ?success=true → clears Zustand cart
```

Note: `customerEmail` is nullable (some customers may not have email).

---

## Homepage Config Upsert Pattern

```typescript
await prisma.siteSettings.upsert({
  where:  { key: 'homepage_config' },
  update: { value: JSON.stringify(config) },
  create: { key: 'homepage_config', value: JSON.stringify(config) },
})
revalidatePath('/')
```

`SiteSettings` uses `key` as the primary key (String @id). `upsert` is the correct pattern here because the row may or may not exist on first save. `revalidatePath('/')` purges the Next.js full-route cache for the homepage so the ISR-rendered page refreshes immediately.

---

## Image Upload to GitHub

Full flow (from `src/app/api/admin/upload/route.ts`):

1. Admin guard check
2. Parse request: multipart/form-data (file upload) OR JSON (URL import)
3. Get file as base64 string
4. Determine folder from request param (must be one of: `products`, `banners`, `categories`)
5. Generate filename: `img_{Date.now()}.{ext}`
6. Build GitHub API path: `public/images/{folder}/{filename}`

```typescript
await fetch(`https://api.github.com/repos/SherifAsh93/Zahrtelkhlig/contents/${filePath}`, {
  method: 'PUT',
  headers: {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  },
  body: JSON.stringify({
    message: `upload image: ${filename}`,
    content: base64Content,
    branch: 'main',
  }),
})
```

7. Return CDN URL: `https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/{folder}/{filename}`

For deletion (`DELETE /api/admin/media`):
1. Fetch file's current SHA from GitHub API (required for deletion)
2. Call GitHub API DELETE with SHA
3. File is removed from the repo; jsDelivr CDN will eventually evict the cached version

---

## Staff Account Creation

Two entry points for creating staff accounts:

**Server Action** (`createStaffAccount` in `auth.ts`):
- Called from the admin users page form
- Returns `{ success: true }` or `{ error: string }`
- Requires `admin_session` cookie

**API Route** (`POST /api/admin/staff`):
- Called from client-side JS
- Returns JSON `{ success: true, staff: {...} }` or error
- Requires `admin_session` cookie

Both enforce the same rules:
- `username` must match `^[a-z0-9_]+$` (lowercase alphanumeric + underscore only)
- Password minimum 6 characters
- Username uniqueness checked before creation
- Synthetic email: `{username}@staff.zahrtelkhlig` (not a real email)
- Role set to `STAFF`
- Password hashed with bcryptjs cost 12

---

## Dual Session Management Details

The system supports a user being simultaneously authenticated with both session types. Example scenario: the business owner (who knows the admin password) has `admin_session` active from managing products, and also has `session` active from browsing the store as a customer.

Reading logic:
- `getSession()` reads `session` cookie → any role (USER, STAFF, OWNER, ADMIN)
- `getAdminSession()` reads `admin_session` cookie AND verifies `role === 'ADMIN'`

Writing logic:
- `createSession(payload)` → sets `session` cookie (maxAge: 7 days)
- `createAdminSession()` → sets `admin_session` cookie (maxAge: 8 hours), fixed payload

Deleting logic:
- `deleteSession()` → deletes `session` cookie
- `deleteAdminSession()` → deletes `admin_session` cookie
- Logout actions only delete their specific cookie — the other remains valid

---

## Role-Based Route Protection per Dashboard

| Route | Guard | Cookie | Role Requirement |
|---|---|---|---|
| `/admin/*` | `admin/layout.tsx` calls `getAdminSession()` | `admin_session` | `ADMIN` |
| `/api/admin/*` | Local `adminGuard()` in each file | `admin_session` | `ADMIN` |
| `/pos` | `pos/layout.tsx` calls `getSession()` + role check | `session` | `STAFF` or `ADMIN` |
| `/api/pos/*` | Local `posGuard()` in each file | `session` | `STAFF` or `ADMIN` |
| `/owner` | Client-side only (OwnerLoginView) | `session` | `OWNER` |
| `/api/owner/*` | No guard — routes are open read-only | — | None |
| `/orders` (store) | Server component checks `getSession()` | `session` | Any authenticated |
| `/profile` | Server component checks `getSession()` | `session` | Any authenticated |
| `/api/orders`, `/api/profile` | Route handler checks `getSession()` | `session` | Any authenticated |

**Owner API routes have no authentication**: The `/api/owner/*` routes do not call `getAdminSession()` or `getSession()`. They are intentionally open because: (a) they return read-only analytics data with no PII beyond order counts/revenue, (b) the owner dashboard client already gates on session, and (c) this simplifies the implementation. This is a trade-off, not an oversight.
