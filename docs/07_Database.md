# Database

## Connection and Configuration

**Provider**: PostgreSQL (Neon serverless)  
**ORM**: Prisma 7.x  
**Adapter**: `@prisma/adapter-pg` with `PrismaPg` driver  
**Schema file**: `prisma/schema.prisma`  
**Generated client**: `src/generated/prisma/` (custom output path, never edit)

The `datasource` block in `schema.prisma` has no `url` field — the connection URL is read from `DATABASE_URL` env var via `prisma.config.ts`:

```typescript
// prisma.config.ts
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: { url: process.env["DATABASE_URL"] },
})
```

---

## All Models

### User

```prisma
model User {
  id        String     @id @default(cuid())
  email     String     @unique
  username  String?    @unique
  password  String
  name      String
  phone     String?
  address   String?
  city      String?
  role      Role       @default(USER)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  cartItems CartItem[]
  orders    Order[]
  wishlist  Wishlist[]
}
```

| Field | Notes |
|---|---|
| `id` | cuid — collision-resistant, URL-safe, shorter than UUID |
| `email` | Unique. Used for customer login. Staff accounts receive synthetic email `{username}@staff.zahrtelkhlig` |
| `username` | Nullable, unique. Only set for STAFF accounts. Must match `^[a-z0-9_]+$`. Customer accounts have `username: null` |
| `password` | bcryptjs hash, cost 12. Never stored plaintext |
| `name` | Arabic display name (free text, no restrictions) |
| `phone` | Optional, used for order contact |
| `address` | Free-text street address. Optional (can be set later from profile) |
| `city` | One of the 27 Egyptian governorates from `CITIES` constant. Optional |
| `role` | Default `USER`. Changed to `STAFF`, `OWNER`, or `ADMIN` by admin action |

**Note**: The `OWNER` role in the DB is technically possible but the owner dashboard uses a synthetic `userId: 'owner'` in the session, not a real User record. The `ownerLogin` action does not look up a User row.

---

### Product

```prisma
model Product {
  id            String      @id @default(cuid())
  nameAr        String
  nameEn        String
  descriptionAr String
  descriptionEn String
  sku           String?     @unique
  price         Float
  season        Season      @default(WINTER)
  sizes         String[]    @default([])
  sizeStock     Json?
  variants      Json?
  stock         Int         @default(0)
  images        String[]
  featured      Boolean     @default(false)
  active        Boolean     @default(true)
  categoryId    String?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  cartItems     CartItem[]
  orderItems    OrderItem[]
  category      Category?   @relation(fields: [categoryId], references: [id])
  wishlist      Wishlist[]
}
```

| Field | Notes |
|---|---|
| `nameAr` / `nameEn` | Bilingual name. Arabic is primary display |
| `descriptionAr` / `descriptionEn` | Bilingual description. Can be empty string |
| `sku` | Optional unique identifier. Can be null. Used for POS product search |
| `price` | Float (not Int) — prices like 299.5 EGP are possible |
| `season` | `WINTER` or `SUMMER`. Used for filtering in POS and inventory |
| `sizes` | String array — available size labels (e.g., `["S", "M", "L", "XL"]`). Separate from stock |
| `sizeStock` | JSON or null. Per-size stock: `{ "S": 10, "M": 8 }`. Used in Mode 2 stock |
| `variants` | JSON or null. Full variant array: `[{ size, color, qty }, ...]`. Used in Mode 3 stock |
| `stock` | Always the aggregate total. Recalculated from variants/sizeStock on admin save. This is the field checked for stock availability |
| `images` | String array of jsDelivr CDN URLs. First element is the primary display image |
| `featured` | Boolean. Featured products appear in the "Featured Pieces" homepage section when mode is "auto" |
| `active` | Boolean. Inactive products are excluded from all public-facing queries. Admin can see inactive products |
| `categoryId` | Optional foreign key to Category. Products can be uncategorized |

---

### Category

```prisma
model Category {
  id        String    @id @default(cuid())
  nameAr    String
  nameEn    String
  slug      String    @unique
  image     String?
  seasonal  Boolean   @default(false)
  sortOrder Int       @default(0)
  products  Product[]
}
```

| Field | Notes |
|---|---|
| `slug` | URL-safe identifier. Used in product filter queries: `category: { slug: 'abaya' }`. Generated via `slugify()` util |
| `image` | Optional CDN URL for category thumbnail |
| `seasonal` | Boolean marking whether this is a seasonal collection |
| `sortOrder` | Integer for display ordering. Lower = appears first. Default 0 |

---

### Order

```prisma
model Order {
  id            String        @id @default(cuid())
  orderNumber   String        @unique
  userId        String?
  customerName  String
  customerEmail String?
  customerPhone String
  address       String
  city          String
  notes         String?
  status        OrderStatus   @default(PENDING)
  source        OrderSource   @default(ONLINE)
  paymentMethod PaymentMethod @default(CASH_ON_DELIVERY)
  subtotal      Float
  shipping      Float         @default(0)
  total         Float
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  user          User?         @relation(fields: [userId], references: [id])
  items         OrderItem[]
}
```

| Field | Notes |
|---|---|
| `orderNumber` | Unique display identifier. Format: `ZH-{base36 timestamp}-{random}` for online, `POS-{padded int}` for POS |
| `userId` | Nullable. Null for guest orders (no account). Also set to null when a user is deleted (orders are preserved) |
| `customerPhone` | Required. Primary contact field. POS orders use `'00000000000'` as placeholder when no customer info provided |
| `customerEmail` | Nullable. Optional for customers without email |
| `address` | Free text. POS orders use `'المحل'` as placeholder |
| `city` | Free text. POS orders use `'دمياط'` (the store's city) as default |
| `status` | See OrderStatus enum. Online orders start PENDING. POS orders start DELIVERED |
| `source` | ONLINE or POS. Used for revenue channel analytics |
| `paymentMethod` | See PaymentMethod enum. Defaults to CASH_ON_DELIVERY |
| `subtotal` | Pre-shipping total |
| `shipping` | 50 EGP (online, subtotal < 500) or 0 (free/POS) |
| `total` | `subtotal + shipping` |

---

### OrderItem

```prisma
model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  productId String
  nameAr    String
  nameEn    String
  price     Float
  quantity  Int
  size      String?
  color     String?
  image     String?
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product   Product @relation(fields: [productId], references: [id])
}
```

**Snapshot pattern**: `nameAr`, `nameEn`, `price`, and `image` are copied from the product at order creation time. This means:
- If a product's name or price changes after an order is placed, the order still shows the original name and price
- If a product is deleted, the order history still shows what was purchased
- `productId` remains as a foreign key for analytics (can still join to current product data)
- The `product` relation does NOT have `onDelete: Cascade` — if the product is deleted, `productId` becomes a dangling reference. This is acceptable because the snapshot fields contain all display-critical data.

**The `order` relation has `onDelete: Cascade`** — when an Order is deleted, all its OrderItems are automatically deleted.

---

### CartItem

```prisma
model CartItem {
  id        String   @id @default(cuid())
  userId    String
  productId String
  quantity  Int      @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  product   Product  @relation(...)
  user      User     @relation(...)

  @@unique([userId, productId])
}
```

The compound unique constraint `@@unique([userId, productId])` ensures one CartItem row per product per user. The DB `CartItem` model exists for future server-side cart persistence. Currently, the active cart is managed in Zustand/localStorage. The DB model is not used in the checkout flow.

Both `product` and `user` relations have `onDelete: Cascade` — when a user or product is deleted, their cart items are cleaned up automatically.

---

### Wishlist

```prisma
model Wishlist {
  id        String   @id @default(cuid())
  userId    String
  productId String
  createdAt DateTime @default(now())
  product   Product  @relation(...)
  user      User     @relation(...)

  @@unique([userId, productId])
}
```

Same compound unique constraint as CartItem. Both relations have `onDelete: Cascade`. The Wishlist DB model is also not actively used in the current implementation — the active wishlist is in Zustand/localStorage. The DB model exists for future server-side persistence.

---

### Banner

```prisma
model Banner {
  id         String   @id @default(cuid())
  titleAr    String
  titleEn    String
  subtitleAr String?
  subtitleEn String?
  image      String
  link       String?
  active     Boolean  @default(true)
  sortOrder  Int      @default(0)
  createdAt  DateTime @default(now())
}
```

| Field | Notes |
|---|---|
| `image` | Required CDN URL. Banners must have an image |
| `link` | Optional URL. If set, the banner is clickable and navigates to this URL |
| `active` | Only active banners appear on the public site |
| `sortOrder` | Display order on the homepage hero carousel |

---

### SiteSettings

```prisma
model SiteSettings {
  key   String @id
  value String
}
```

Key-value store for all site-wide configuration. All values are stored as strings (JSON-encoded for complex values).

**Current keys in use**:

| Key | Value type | Description |
|---|---|---|
| `homepage_config` | JSON string | Full `HomepageConfig` object. Sections, order, headings, product selections |
| `owner_password` | Plain string | Owner dashboard password (default: `ashraf2024` if missing) |

Both keys are optional — the system has hard-coded defaults for both. `parseConfig()` in `homepage.ts` returns `DEFAULT_CONFIG` if the key is missing. `ownerLogin` uses `setting?.value ?? 'ashraf2024'` for the password.

---

## Enums

### Role
```prisma
enum Role {
  USER    // Regular customer (default)
  STAFF   // POS staff — can use /pos, cannot access /admin
  OWNER   // Business owner — can use /owner analytics
  ADMIN   // System admin — full access to /admin
}
```

### OrderStatus
```prisma
enum OrderStatus {
  PENDING      // Waiting for confirmation / payment verification
  CONFIRMED    // Order confirmed by admin
  PROCESSING   // Being prepared
  SHIPPED      // Dispatched to courier
  DELIVERED    // Customer received
  CANCELLED    // Cancelled
}
```

POS orders skip directly to `DELIVERED` (they are fulfilled at point of sale).

### OrderSource
```prisma
enum OrderSource {
  ONLINE  // Placed through the website checkout
  POS     // Placed through the in-store POS terminal
}
```

Used for channel analytics in the owner dashboard (online vs POS revenue split).

### Season
```prisma
enum Season {
  WINTER
  SUMMER
}
```

Products are tagged with a season for inventory organization. Used in POS product search filters and the inventory page.

### PaymentMethod
```prisma
enum PaymentMethod {
  CASH_ON_DELIVERY   // Pay on delivery — immediate CONFIRMED eligible
  VODAFONE_CASH      // Mobile wallet — requires admin confirmation
  INSTAPAY           // Bank instant transfer — requires admin confirmation
  BANK_TRANSFER      // Regular bank transfer — requires admin confirmation
}
```

---

## Relationship Map

```
User
  ├── Order[]         (userId → Order.userId, nullable)
  ├── CartItem[]      (userId → CartItem.userId)
  └── Wishlist[]      (userId → Wishlist.userId)

Category
  └── Product[]       (categoryId → Product.categoryId, optional)

Product
  ├── OrderItem[]     (productId → OrderItem.productId)
  ├── CartItem[]      (productId → CartItem.productId)
  └── Wishlist[]      (productId → Wishlist.productId)

Order
  └── OrderItem[]     (orderId → OrderItem.orderId, onDelete: Cascade)

SiteSettings           (standalone, no relations)
Banner                 (standalone, no relations)
```

---

## Index Strategy

Prisma creates indexes automatically for:
- All `@id` fields (primary key)
- All `@unique` fields: `User.email`, `User.username`, `Product.sku`, `Category.slug`, `Order.orderNumber`
- All `@@unique` compound constraints: `[CartItem.userId, CartItem.productId]`, `[Wishlist.userId, Wishlist.productId]`
- All foreign key fields (Prisma adds these automatically for PostgreSQL)

No additional custom indexes are defined in the schema. For current data volume this is sufficient. If order volume grows significantly, consider adding indexes on:
- `Order.status` (filtered in admin order list)
- `Order.createdAt` (sorted in all order lists)
- `Order.source` (filtered in analytics)
- `Product.active` (filtered in all public queries)

---

## JSON Field Patterns

### `product.variants`

Type: `Variant[] | null` where `Variant = { size: string; color: string; qty: number }`

Used in Mode 3 (full variant tracking). When not null, the product has color variations.

Reading: `const variants = product.variants as Variant[] | null`

Writing: `data: { variants: updatedArray as unknown as object[] }` — double-cast required because Prisma's `Json` field type is not typed.

### `product.sizeStock`

Type: `Record<string, number> | null` where keys are size labels and values are quantities.

Example: `{ "S": 10, "M": 8, "L": 5 }`

When `variants` is non-null, `sizeStock` is always the aggregation: `for (const v of variants) { sizeStock[v.size] = (sizeStock[v.size] || 0) + v.qty }`.

### `SiteSettings.value`

Always a string. For `homepage_config`, it is a JSON-encoded `HomepageConfig` object. For `owner_password`, it is a plain string.

Reading: `JSON.parse(setting.value)` or `setting.value` directly.

Writing: `JSON.stringify(config)` before upsert.

---

## Migration Strategy

**Production**: `prisma db push --accept-data-loss` runs at build time (in the `build` script). This applies schema changes directly to the Neon database. The `--accept-data-loss` flag allows dropping columns/tables if the schema removes them.

**Development**: Use `prisma db push` for rapid iteration. Use `prisma migrate dev` when you want to create a tracked migration file (stored in `prisma/migrations/`).

**Why db push over migrate**: The project prioritizes iteration speed over migration tracking. For a production system with complex data migrations, `prisma migrate` should be preferred. The current approach is appropriate for this scale.

---

## Seed Scripts

Three seed files serve different purposes:

| File | Command | Purpose |
|---|---|---|
| `prisma/seed.ts` | `npm run seed` (ts-node) | Full demo data: products, categories, banners, settings |
| `prisma/seed.mjs` | Node directly | ESM variant of the same seed |
| `prisma/seed-categories.cjs` | Node directly | Categories-only seed for quick setup |

Seed scripts do not automatically run during `build` or `db push`. They must be invoked manually.

The `/api/admin/seed` route (token-protected with `?token=114891zahr2024`) provides an HTTP-triggered seed for populating product images from a predefined list. Used for initial image import.
