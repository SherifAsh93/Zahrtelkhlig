# Architecture

## Four-Dashboard System

The application serves four distinct user types, each with a separate entry point, separate authentication mechanism, and separate data access scope.

```
Domain
├── / (store)           Customer-facing storefront
├── /admin              Admin control panel
├── /owner              Business owner analytics
└── /pos                In-store point-of-sale terminal
```

Each dashboard has independent layout files that implement their own auth gate before rendering any content.

---

## Route Group Structure

### Store — `(store)/`

Next.js route group (parentheses in directory name = no URL segment). Applied layout: `Navbar + Footer`. Auth: optional — the `getSession()` call in the store layout is wrapped with `.catch(() => null)` so unauthenticated visitors still see the store.

```
/(store)/layout.tsx   → Navbar (receives session prop) + Footer
/(store)/page.tsx     → Homepage
/(store)/products/    → Catalog + detail
/(store)/cart/        → Cart page
/(store)/checkout/    → Checkout form
/(store)/orders/      → Order history + confirmation
/(store)/login/       → Customer auth
/(store)/register/    → Registration
/(store)/profile/     → Profile management
/(store)/wishlist/    → Wishlist
```

### Admin — `/admin/`

No route group wrapper. Layout (`admin/layout.tsx`) calls `getAdminSession()` server-side. If null, renders `<AdminLoginView />` inline — the admin login form is injected into the shell of the layout, not a redirect. This avoids a flash and prevents URL leakage.

```
/admin/layout.tsx  → getAdminSession() || <AdminLoginView />
/admin/            → Stats dashboard
/admin/products/   → Product CRUD
/admin/orders/     → Order management
/admin/categories/ → Category CRUD
/admin/inventory/  → Stock management
/admin/reports/    → Daily reports
/admin/homepage/   → Homepage section editor
/admin/banners/    → Banner CRUD
/admin/media/      → Image library
/admin/users/      → User management
```

### Owner — `/owner/`

Layout is a transparent pass-through (`return <>{children}</>`). Auth is entirely client-side in `owner/page.tsx` which renders `<OwnerLoginView>` based on client state. There is no server-side session guard for this route. The security model is: owner password is relatively obscure, the dashboard is read-only, and there are no write endpoints under `/api/owner/`.

### POS — `/pos/`

Layout calls `getSession()` (the regular user session cookie, not `admin_session`). Guards on `session.role === 'ADMIN' || session.role === 'STAFF'`. If not authenticated, renders `<POSLoginView />` inline.

---

## Data Flow per User Type

### Customer (store)

```
Browser
  → Navbar fetches session from server component prop
  → Product pages: Server component calls /api/products, renders HTML
  → Add to cart: Zustand action updates localStorage
  → StoreHydration.tsx: useEffect rehydrates Zustand on mount (solves SSR mismatch)
  → Checkout: CheckoutForm serializes cart JSON → hidden input → createOrder server action
  → createOrder: validates → calculates subtotal/shipping → prisma.order.create → redirect
  → /orders/[id]?success=true: displays order confirmation
```

### Admin

```
Browser
  → admin/layout.tsx: getAdminSession() from cookie
  → Client components fetch from /api/admin/* routes
  → Each API route calls getAdminSession() again (stateless, no server-side session caching)
  → Mutations: API routes call prisma.*
  → Settings mutation: saveHomepageConfig server action → prisma upsert → revalidatePath('/')
  → Image uploads: POST /api/admin/upload → GitHub API → returns jsDelivr CDN URL
```

### Owner

```
Browser
  → owner/page.tsx (client component): checks local state for auth
  → If not authenticated: renders OwnerLoginView
  → ownerLogin server action: checks SiteSettings["owner_password"] → createSession (role OWNER)
  → After login: client fetches /api/owner/stats, /api/owner/activity
  → No auth check on owner API routes — routes are open but read-only with no sensitive mutations
  → Auto-refresh: setInterval(5 * 60 * 1000) re-fetches stats
```

### Staff / POS

```
Browser
  → pos/layout.tsx: getSession() → role check
  → posLogin server action: username lookup → bcrypt compare → createSession (role STAFF)
  → POS page: fetches /api/pos/products with search/season query
  → Sale: POST /api/pos/sale → stock verification → order create → stock reduction
```

---

## Dual Session Cookie Architecture

The system maintains two separate JWT cookies simultaneously.

| Cookie | Key | Duration | Role | Created by |
|---|---|---|---|---|
| Regular | `session` | 7 days | USER, STAFF, OWNER | `createSession()` |
| Admin | `admin_session` | 8 hours | ADMIN only | `createAdminSession()` |

Both cookies:
- `httpOnly: true`
- `secure: true` in production
- `sameSite: 'lax'`
- Signed with HS256 using `SESSION_SECRET` env var

Admin has a shorter expiry (8 hours) because admin access carries higher privileges. The admin session holds a synthetic user ID (`'admin'`) and email (`admin@zahrtelkhlig.com`) — it is not tied to a database User record.

A STAFF user logged into `/pos` uses the regular `session` cookie. A user can simultaneously hold both cookies — for example, an admin who is also browsing the store while the admin session is active.

Reading sessions:
```typescript
// Regular session — works for USER, STAFF, OWNER
const session = await getSession()      // returns SessionPayload | null

// Admin session — only for ADMIN routes
const session = await getAdminSession() // returns SessionPayload | null, verifies role === 'ADMIN'
```

---

## Server Actions vs API Routes

The project uses both patterns. The decision rule is:

**Server Actions** — used for form submissions where Next.js form progression (`useActionState`), redirect, and revalidation are needed:
- `login()`, `register()`, `logout()`
- `adminLogin()`, `adminLogout()`
- `posLogin()`, `posLogout()`
- `ownerLogin()`, `ownerLogout()`
- `createStaffAccount()`
- `deleteUser()`, `updateUser()`
- `createOrder()`
- `saveHomepageConfig()`

Server actions return `{ error?: string }` objects for validation errors. They call `redirect()` on success (Next.js handles the redirect inside server action context).

**API Routes** — used for data fetching from client components, and mutations called from client-side JS (not form submissions):
- All `/api/admin/*` — admin dashboard reads and mutations from React client components
- All `/api/owner/*` — owner dashboard reads
- `/api/pos/products` — product search
- `/api/pos/sale` — POS checkout (complex stock mutation that needs explicit JSON response)
- `/api/products/*`, `/api/categories`, `/api/banners` — public reads

---

## Cart Lifecycle

```
Stage 1: Shopping
  Zustand cartStore (in-memory + localStorage "zahrt-cart")
  Keys: productId, nameAr, nameEn, price, image, quantity, stock
  No backend DB involvement

Stage 2: Checkout Form
  CheckoutForm reads useCartStore().items
  Serializes to JSON string → hidden <input name="cart"> in the form
  Form submits to createOrder server action

Stage 3: Server Action (createOrder)
  Parses JSON cart from formData
  Calculates subtotal = sum(item.price * item.quantity)
  Applies shipping: subtotal < 500 → 50 EGP, else 0
  Creates Order + OrderItems in one prisma.order.create with nested items.create
  OrderItems snapshot: nameAr, nameEn, price, image (data frozen at order time)
  No stock reduction at this point (manual admin process for online orders)

Stage 4: Post-Order
  Cart NOT automatically cleared by server (client must clear after redirect)
  redirect('/orders/[id]?success=true')
  Client-side: cart cleared when success=true is detected
```

Note: the cart does NOT sync to the database CartItem model during normal shopping. The DB `CartItem` model exists for future server-side cart persistence but is not currently used in the checkout flow.

---

## Stock Management — 3-Mode System

The same product record supports three storage modes for stock:

### Mode 1: Simple Integer
```
product.stock = 42
product.variants = null
product.sizeStock = null
```
Used when the product has no size or color variation. POS checkout decrements `stock` directly with `{ decrement: quantity }`.

### Mode 2: Per-Size JSON
```
product.sizeStock = { "S": 10, "M": 8, "L": 5 }
product.variants = null
product.stock = 23  // sum of sizeStock values
```
Used when product has sizes but no color variants.

### Mode 3: Full Variants JSON
```
product.variants = [
  { size: "M", color: "أسود", qty: 5 },
  { size: "M", color: "أبيض", qty: 3 },
  { size: "L", color: "أسود", qty: 7 }
]
product.sizeStock = { "M": 8, "L": 7 }  // derived from variants
product.stock = 15  // sum of all variant qty values
```
Used for full size+color tracking. POS reduces a specific variant, then recalculates `sizeStock` and `stock` from the updated variants array.

**Invariant**: `product.stock` is always the authoritative aggregate. When admin saves a product with variants or sizeStock, the API route recalculates `stock` immediately:
```typescript
if (Array.isArray(body.variants)) {
  body.stock = body.variants.reduce((a, v) => a + v.qty, 0)
} else if (body.sizeStock) {
  body.stock = Object.values(body.sizeStock).reduce((a, b) => a + b, 0)
}
```

---

## Homepage Config-Driven Sections Pattern

The homepage is not hardcoded. An admin can reorder, enable/disable, and configure each section without code changes.

**Storage**: `SiteSettings` table, key = `"homepage_config"`, value = JSON string of `HomepageConfig`.

**Read path**: `(store)/page.tsx` (server component) → `prisma.siteSettings.findUnique({ where: { key: 'homepage_config' } })` → `parseConfig(raw)` → iterates `config.sectionsOrder` → renders each enabled section component.

**Write path**: Admin at `/admin/homepage` → `HomepageSettingsForm` → `saveHomepageConfig(config)` server action → `prisma.siteSettings.upsert(...)` → `revalidatePath('/')` (invalidates Next.js cache).

**Fallback**: `parseConfig()` merges with `DEFAULT_CONFIG` using spread — missing keys always fall back to defaults. The homepage never crashes due to partial or missing config.

**Section types** (keys in `config.sectionsOrder`):
- `features_bar` — icon + text feature highlights bar
- `new_arrivals` — product carousel, auto (latest N) or manual (specific IDs)
- `at_glance` — category tiles grid
- `featured` — featured products carousel, auto or manual
- `category_tabs` — category browser tabs
- `brand_story` — brand narrative block with CTA button
- `instagram` — product photo gallery styled as Instagram feed

---

## Image CDN Flow

```
Admin uploads image (file upload or URL import)
         ↓
POST /api/admin/upload
         ↓
Reads GITHUB_TOKEN from env
Fetches/reads file as base64
         ↓
PUT https://api.github.com/repos/SherifAsh93/Zahrtelkhlig/contents/public/images/{folder}/img_{timestamp}.{ext}
  body: { message, content: base64, branch: 'main' }
         ↓
GitHub stores file, returns 201
         ↓
Response: { url: 'https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/{folder}/img_{timestamp}.{ext}' }
         ↓
Admin saves this CDN URL into product.images[], banner.image, or category.image
```

jsDelivr CDN serves GitHub-stored files with aggressive caching. Files are permanent (no expiry). Filenames are `img_{Date.now()}.{ext}` to avoid collisions.

Valid upload folders: `products`, `banners`, `categories`. Any other folder is rejected.

---

## Why No Payment Gateway

The store uses manual payment confirmation for all non-COD orders. This is an explicit business decision for the Egyptian market:

- Vodafone Cash, InstaPay, and Bank Transfer are the dominant non-cash digital payment methods in Egypt for this market segment.
- These require manual verification: the customer makes the transfer, the admin confirms receipt in the system.
- Integrating a gateway (e.g., PayMob, Paymob, Fawry) would add complexity, fees, and technical dependencies that do not match the business volume or operational model.
- The `PAYMENT_PHONE` constant (`01002001446`) and `BANK_ACCOUNT` (`100047644822`) from `src/lib/utils.ts` are displayed to the customer post-order for manual payment.

The order flow: non-COD orders are created with status `PENDING`. Admin reviews payment proof (sent via WhatsApp or shown in person), then manually changes status to `CONFIRMED` via the admin order detail page.
