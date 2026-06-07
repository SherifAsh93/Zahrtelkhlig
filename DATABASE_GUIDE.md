# Zahrtelkhlig — Database Guide

## Database Provider

**Neon** — Serverless PostgreSQL  
**ORM:** Prisma v7.8 with `@prisma/adapter-pg`  
**Driver:** `pg` (node-postgres)

Connection via `DATABASE_URL` environment variable.

---

## Schema Overview

8 models in `prisma/schema.prisma`:

| Model | Purpose |
|-------|---------|
| `User` | All users (customers, staff, owner, admin) |
| `Product` | Product catalog with variants and stock |
| `Category` | Product categories with sort order |
| `Order` | Customer and POS orders |
| `OrderItem` | Line items within an order |
| `CartItem` | Shopping cart (DB-backed per user) |
| `Wishlist` | Saved products per user |
| `Banner` | Homepage hero banners |
| `SiteSettings` | Key-value store for site config (homepage, owner password) |

---

## Tables and Relationships

### `User`
```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  username  String?   @unique           // Used by staff for POS login
  password  String                       // bcrypt hash
  name      String
  phone     String?
  address   String?
  city      String?
  role      Role      @default(USER)    // USER | STAFF | OWNER | ADMIN
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  cartItems CartItem[]
  orders    Order[]
  wishlist  Wishlist[]
}
```

### `Product`
```prisma
model Product {
  id            String    @id @default(cuid())
  nameAr        String                    // Arabic name (primary)
  nameEn        String                    // English name
  descriptionAr String
  descriptionEn String
  sku           String?   @unique
  price         Float
  comparePrice  Float?                    // Strike-through price for discounts
  season        Season    @default(WINTER) // WINTER | SUMMER
  sizes         String[]  @default([])   // ["S", "M", "L", "XL"]
  sizeStock     Json?                    // {"S": 10, "M": 15, "L": 8}
  variants      Json?                    // Detailed color/size/stock combos
  stock         Int       @default(0)    // Total stock
  images        String[]                 // Array of image URLs
  featured      Boolean   @default(false)
  active        Boolean   @default(true)
  categoryId    String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  category      Category? @relation(...)
  cartItems     CartItem[]
  orderItems    OrderItem[]
  wishlist      Wishlist[]
}
```

**Note on stock fields:** Products can track stock three ways:
- `stock` — Total count (simple)
- `sizeStock` — Per-size breakdown `{"S": 10, "M": 5}`
- `variants` — Full color+size variants with individual stock (most complex)

The admin ProductForm and inventory page manage all three.

### `Category`
```prisma
model Category {
  id        String    @id @default(cuid())
  nameAr    String
  nameEn    String
  slug      String    @unique          // URL-safe identifier
  image     String?
  seasonal  Boolean   @default(false)
  sortOrder Int       @default(0)      // Controls display order in store
  products  Product[]
}
```

### `Order`
```prisma
model Order {
  id            String        @id @default(cuid())
  orderNumber   String        @unique   // "ZH-{timestamp}-{random}"
  userId        String?                 // Null for POS orders without linked account
  customerName  String
  customerEmail String?
  customerPhone String
  address       String
  city          String
  notes         String?
  status        OrderStatus   @default(PENDING)
  source        OrderSource   @default(ONLINE) // ONLINE | POS
  paymentMethod PaymentMethod @default(CASH_ON_DELIVERY)
  subtotal      Float
  shipping      Float         @default(0)
  total         Float
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  user          User?         @relation(...)
  items         OrderItem[]
}
```

**Order status flow:**  
`PENDING` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`  
(or `CANCELLED` from any state)

### `OrderItem`
```prisma
model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  productId String
  nameAr    String          // Snapshot — preserved even if product changes
  nameEn    String
  price     Float            // Price at time of purchase
  quantity  Int
  size      String?
  color     String?
  image     String?
  order     Order   @relation(..., onDelete: Cascade)
  product   Product @relation(...)
}
```

### `CartItem`
```prisma
model CartItem {
  id        String   @id @default(cuid())
  userId    String
  productId String
  quantity  Int      @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  product   Product  @relation(..., onDelete: Cascade)
  user      User     @relation(..., onDelete: Cascade)
  @@unique([userId, productId])  // One cart item per product per user
}
```

### `Banner`
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

### `SiteSettings`
```prisma
model SiteSettings {
  key   String @id    // e.g., "homepage_config", "owner_password"
  value String        // JSON string or plain text
}
```

**Keys used:**
- `"homepage_config"` — JSON blob of homepage section configuration
- `"owner_password"` — Owner dashboard password (default: `ashraf2024`)

### Enums
```prisma
enum Role          { USER  STAFF  OWNER  ADMIN }
enum OrderStatus   { PENDING  CONFIRMED  PROCESSING  SHIPPED  DELIVERED  CANCELLED }
enum OrderSource   { ONLINE  POS }
enum Season        { WINTER  SUMMER }
enum PaymentMethod { CASH_ON_DELIVERY  VODAFONE_CASH  INSTAPAY  BANK_TRANSFER }
```

---

## Migration History

| Migration | Date | Changes |
|-----------|------|---------|
| `20260518231411_init` | 2026-05-18 | Initial schema: all models |
| `20260520000001_categories_and_payment` | 2026-05-20 | Added `seasonal`, `sortOrder` to Category; added `BANK_TRANSFER` to PaymentMethod |
| `20260523000001_staff_owner_username` | 2026-05-23 | Added `username` to User; added `STAFF` and `OWNER` roles |

---

## Migration Process

### Development (run locally)
```bash
# Create and apply a new migration after schema changes
npx prisma migrate dev --name describe_change

# Push schema without creating migration files (dev only)
npx prisma db push
```

### Production (Vercel build command)
```bash
npx prisma generate && npx prisma db push --accept-data-loss && next build
```

The `--accept-data-loss` flag is used in the Vercel build — this is acceptable for additive schema changes but risky for destructive changes (column removals, type changes).

### Generate Prisma client after schema change
```bash
npx prisma generate
```

### Open Prisma Studio (DB browser)
```bash
npx prisma studio
```

### Seed the database
```bash
npm run seed          # Full seed: admin user + categories + sample products
node prisma/seed-categories.cjs  # Categories only (used in Vercel build)
```

---

## Important Queries

```typescript
// Get all active products (used in store homepage)
const products = await prisma.product.findMany({
  where: { active: true, stock: { gt: 0 } },
  include: { category: true },
  orderBy: { createdAt: "desc" }
});

// Get orders for admin dashboard (paginated)
const orders = await prisma.order.findMany({
  skip: (page - 1) * limit,
  take: limit,
  include: { items: true, user: true },
  orderBy: { createdAt: "desc" }
});

// Update order status
await prisma.order.update({
  where: { id: orderId },
  data: { status: "CONFIRMED" }
});

// Get sales stats for admin dashboard
const totalRevenue = await prisma.order.aggregate({
  where: { status: { not: "CANCELLED" } },
  _sum: { total: true }
});

// Get homepage config from SiteSettings
const config = await prisma.siteSettings.findUnique({
  where: { key: "homepage_config" }
});
```

---

## Backup Considerations

- **Neon free tier** provides 7-day backup retention automatically
- The `orders`, `orderItems`, `products`, and `users` tables are business-critical
- Export from Neon dashboard or via pg_dump:

```bash
pg_dump "$DATABASE_URL" --format=custom > backup_$(date +%Y%m%d).dump
# Restore:
pg_restore --dbname="$DATABASE_URL" backup_20260531.dump
```

**Neon cold starts:** Free tier databases pause after inactivity. First request after pause takes 2–5 seconds. Upgrade to paid tier to eliminate this.
