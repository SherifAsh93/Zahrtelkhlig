# API Reference

All routes live under `src/app/api/`. 32 route files total.

Auth abbreviations used below:
- **None** — no authentication required
- **Session** — valid `session` cookie, any role
- **Admin** — valid `admin_session` cookie with `role === 'ADMIN'`
- **POS** — valid `session` cookie with `role === 'STAFF'` or `role === 'ADMIN'`
- **Open** — route has no auth check (owner stats routes)

---

## Public Store Routes

### Products

#### `GET /api/products`

**Auth**: None  
**Query params**:
- `category` — category slug (string)
- `search` — text search, case-insensitive match on `nameAr` OR `nameEn`
- `featured` — `"true"` to filter featured-only
- `page` — page number, default `1`
- `limit` — items per page, default `12`
- `minPrice` — minimum price (float)
- `maxPrice` — maximum price (float)

**Response 200**:
```json
{
  "products": [ProductWithCategory],
  "total": 48,
  "page": 1,
  "pages": 4
}
```

Only `active: true` products are returned. Ordered by `createdAt desc`.

---

#### `GET /api/products/[id]`

**Auth**: None  
**Path**: product cuid  
**Response 200**: Full product object with category included  
**Response 404**: `{ "error": "Product not found" }`

Only returns `active: true` products. Inactive products return 404 to the public.

---

### Categories

#### `GET /api/categories`

**Auth**: None  
**Response 200**: Array of Category objects, each including `_count.products` (count of active products only). Ordered by `sortOrder asc, nameAr asc`.

```json
[
  {
    "id": "...",
    "nameAr": "عبايات",
    "nameEn": "Abayas",
    "slug": "abayas",
    "image": "https://cdn.jsdelivr.net/...",
    "seasonal": false,
    "sortOrder": 1,
    "_count": { "products": 24 }
  }
]
```

---

### Banners

#### `GET /api/banners`

**Auth**: None  
**Response 200**: Array of active banners, ordered by `sortOrder asc`.

```json
[
  {
    "id": "...",
    "titleAr": "كولكشن الصيف",
    "titleEn": "Summer Collection",
    "subtitleAr": "...",
    "subtitleEn": "...",
    "image": "https://cdn.jsdelivr.net/...",
    "link": "/products?season=SUMMER",
    "active": true,
    "sortOrder": 0,
    "createdAt": "..."
  }
]
```

---

## Authenticated Customer Routes

### Orders

#### `GET /api/orders`

**Auth**: Session (any role)  
**Response 200**: List of orders for the authenticated user, with first item included. Ordered by `createdAt desc`.  
**Response 401**: `{ "error": "Unauthorized" }`

Optionally accepts `?id={orderId}` query param to fetch a single order. If `id` is provided, also returns full `items` array.

---

#### `GET /api/orders/[id]`

**Auth**: None  
**Path**: order cuid  
**Response 200**: Full order with all items  
**Response 404**: `{ "error": "Not found" }`

This route has no auth check — any person with the order ID can view the order. This is intentional for the post-checkout confirmation page (`/orders/[id]?success=true`) which needs to work for guest orders.

---

### Profile

#### `GET /api/profile`

**Auth**: Session  
**Response 200**: User profile (id, name, email, phone, address, city, role, createdAt)  
**Response 401**: `{ "error": "Unauthorized" }`

---

#### `PUT /api/profile`

**Auth**: Session  
**Body**: `{ name, phone, address, city }`  
**Response 200**: Updated user profile  
**Response 401**: `{ "error": "Unauthorized" }`

---

## Admin Routes

All admin routes require `admin_session` cookie. Return 403 if absent.

### Admin — Products

#### `GET /api/admin/products`

**Auth**: Admin  
**Query params**: `page`, `limit` (default 20), `category` (slug), `season`, `search` (matches nameAr, nameEn, sku)  
**Response 200**: `{ products: Product[], total: number }`

Returns all products including inactive. Includes category relation.

---

#### `POST /api/admin/products`

**Auth**: Admin  
**Body**: Product creation data (all product fields)  
**Auto-calculation**: If `variants` array provided → `stock = sum(variants[].qty)`. If `sizeStock` object provided → `stock = sum(Object.values(sizeStock))`.  
**Response 201**: Created product object

---

#### `DELETE /api/admin/products`

**Auth**: Admin  
**Body**: `{ ids: string[] }` — array of product cuid values  
**Response 200**: `{ deleted: number }`

---

#### `GET /api/admin/products/[id]`

**Auth**: Admin  
**Response 200**: Product with category  
**Response 404**: `{ "error": "Not found" }`

---

#### `PUT /api/admin/products/[id]`

**Auth**: Admin  
**Body**: Full product update data  
**Auto-calculation**: Same stock recalculation as POST  
**Response 200**: Updated product

---

#### `DELETE /api/admin/products/[id]`

**Auth**: Admin  
**Response 200**: `{ success: true }`

---

### Admin — Orders

#### `GET /api/admin/orders`

**Auth**: Admin  
**Query params**: `status` (OrderStatus enum value), `page`, `limit` (default 20)  
**Response 200**: `{ orders: OrderWithItemsAndUser[], total: number }`

Includes all items and user (name + email only).

---

#### `GET /api/admin/orders/[id]`

**Auth**: Admin  
**Response 200**: Order with items (including product data) and full user record  
**Response 404**: `{ "error": "Not found" }`

---

#### `PATCH /api/admin/orders/[id]`

**Auth**: Admin  
**Body**: `{ status: OrderStatus }`  
**Response 200**: Updated order  

Used to change order status (e.g., PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED).

---

#### `PUT /api/admin/orders/[id]`

**Auth**: Admin  
**Body**: `{ customerName, customerPhone, customerEmail, address, city, notes }`  
**Response 200**: Updated order  

Used to edit customer contact details on an order.

---

#### `DELETE /api/admin/orders/[id]`

**Auth**: Admin  
**Response 200**: `{ success: true }`

Deletes the order. OrderItems are cascade-deleted automatically.

---

### Admin — Categories

#### `GET /api/admin/categories`

**Auth**: Admin  
**Response 200**: Array of categories with `_count.products` (all products, not just active). Ordered by `sortOrder asc, nameAr asc`.

---

#### `POST /api/admin/categories`

**Auth**: Admin  
**Body**: Category creation data  
**Response 201**: Created category

---

#### `GET /api/admin/categories/[id]`

**Auth**: Admin  
**Response 200**: Category object  
**Response 404**: `{ "error": "Not found" }`

---

#### `PUT /api/admin/categories/[id]`

**Auth**: Admin  
**Body**: Category update data  
**Response 200**: Updated category

---

#### `DELETE /api/admin/categories/[id]`

**Auth**: Admin  
**Response 200**: `{ success: true }`

---

### Admin — Banners

#### `GET /api/admin/banners`

**Auth**: Admin  
**Response 200**: All banners (including inactive), ordered by `sortOrder asc`

---

#### `POST /api/admin/banners`

**Auth**: Admin  
**Body**: Banner creation data  
**Response 201**: Created banner

---

#### `GET /api/admin/banners/[id]`

**Auth**: Admin  
**Response 200**: Banner object

---

#### `PUT /api/admin/banners/[id]`

**Auth**: Admin  
**Body**: Banner update data  
**Response 200**: Updated banner

---

#### `DELETE /api/admin/banners/[id]`

**Auth**: Admin  
**Response 200**: `{ success: true }`

---

### Admin — Users

#### `GET /api/admin/users`

**Auth**: Admin  
**Query params**: `page`, `limit` (default 20), `search` (name/email/phone), `role`  
**Response 200**: `{ users: UserWithOrderCount[], total: number }`

Each user includes `_count.orders`.

---

#### `GET /api/admin/users/[id]`

**Auth**: Admin  
**Response 200**: Full user object with orders

---

#### `PUT /api/admin/users/[id]`

**Auth**: Admin  
**Body**: User update data  
**Response 200**: Updated user

---

#### `DELETE /api/admin/users/[id]`

**Auth**: Admin  
**Response 200**: `{ success: true }`

---

### Admin — Staff

#### `GET /api/admin/staff`

**Auth**: Admin  
**Response 200**: `{ staff: [{ id, name, username, createdAt }] }` — only STAFF role users

---

#### `POST /api/admin/staff`

**Auth**: Admin  
**Body**: `{ name, username, password }`  
**Validation**: username `^[a-z0-9_]+$`, password minimum 6 chars, username uniqueness  
**Creates**: User with `role: STAFF`, `email: {username}@staff.zahrtelkhlig`, bcryptjs hashed password  
**Response 200**: `{ success: true, staff: { id, name, username, createdAt } }`  
**Response 400**: `{ error: string }` — validation failure

---

#### `DELETE /api/admin/staff`

**Auth**: Admin  
**Body**: `{ id: string }` — user cuid  
**Response 200**: `{ success: true }`

---

### Admin — Inventory

#### `GET /api/admin/inventory`

**Auth**: Admin  
**Query params**: `season`, `search` (nameAr or sku)  
**Response 200**: Array of active products with stock fields: `{ id, nameAr, sku, season, variants, sizes, sizeStock, stock, images, price }`. Ordered by `season asc, nameAr asc`.

---

#### `PATCH /api/admin/inventory`

**Auth**: Admin  
**Body**: `{ productId, size, color, qty }`  
**What it does**: Finds or creates a variant `{size, color}`, sets `qty`. Recalculates `sizeStock` and `stock`.  
**Response 200**: `{ variants: Variant[], stock: number }`

---

### Admin — Stats

#### `GET /api/admin/stats`

**Auth**: Admin  
**Response 200**:
```json
{
  "totalOrders": 142,
  "totalRevenue": 58400,
  "totalProducts": 87,
  "totalUsers": 234,
  "recentOrders": [Order],
  "ordersByStatus": [{ "status": "PENDING", "_count": { "status": 5 } }]
}
```

All queries run in parallel via `Promise.all`.

---

### Admin — Reports

#### `GET /api/admin/reports`

**Auth**: Admin  
**Query params**: `date` — ISO date string (defaults to today)  
**Response 200**:
```json
{
  "date": "2026-06-29",
  "totalRevenue": 4200,
  "totalOrders": 8,
  "onlineOrders": 5,
  "posOrders": 3,
  "onlineRevenue": 2800,
  "posRevenue": 1400,
  "soldItems": [{
    "productId": "...",
    "nameAr": "...",
    "qty": 3,
    "revenue": 900,
    "variants": [{ "label": "مقاس L / أسود", "qty": 2 }]
  }],
  "orders": [Order],
  "inventory": [Product]
}
```

---

### Admin — Upload

#### `POST /api/admin/upload`

**Auth**: Admin  
**Body**: Multipart form-data with `file` (File) and optional `folder` field, OR JSON `{ url, folder }` for URL import.  
**Valid folders**: `products`, `banners`, `categories`  
**Response 200**: `{ url: string, filename: string }` — jsDelivr CDN URL  
**Response 500**: `{ error: string }` — GitHub API failure

---

### Admin — Media

#### `GET /api/admin/media`

**Auth**: Admin  
**Response 200**: `{ files: [{ name, path, url, folder, size }] }` — all images from `public/images/{products,banners,categories}/`

---

#### `DELETE /api/admin/media`

**Auth**: Admin  
**Body**: `{ path: string }` — repo-relative path (e.g. `public/images/products/img_xxx.jpg`)  
**Response 200**: `{ ok: true }`  
**Response 404**: File not found on GitHub

---

### Admin — Seed

#### `POST /api/admin/seed?token=12311zahr2024`

**Auth**: Query token  
**Response 200**: `{ deleted, inserted }` — bulk image seed from hardcoded list

---

## POS Routes

Both POS routes use the `session` cookie with role STAFF or ADMIN.

### `GET /api/pos/products`

**Auth**: POS  
**Query params**: `q` (search by nameAr, nameEn, or exact sku), `season`  
**Response 200**: Array of products with variant fields: `{ id, nameAr, sku, season, price, variants, sizes, sizeStock, stock, images }`. Ordered by `season asc, nameAr asc`.

---

### `POST /api/pos/sale`

**Auth**: POS  
**Body**:
```json
{
  "items": [{
    "productId": "...",
    "nameAr": "...",
    "price": 350,
    "quantity": 1,
    "size": "M",
    "color": "أسود",
    "image": "https://cdn...."
  }],
  "customerName": "عميل",
  "notes": null,
  "paymentMethod": "CASH_ON_DELIVERY"
}
```

**What it does**:
1. Verifies stock availability per item (before creating order)
2. Creates Order with `source: POS`, `status: DELIVERED`, `shipping: 0`
3. Reduces stock atomically per item
4. Returns order info

**Response 200**: `{ success: true, orderNumber: "POS-0042", orderId: "..." }`  
**Response 400**: `{ error: "مخزون غير كافي: [nameAr] مقاس [size]" }` — stock failure  
**Response 403**: Not authenticated as POS

---

## Owner Routes

All owner routes are open (no auth check). They return read-only analytics data.

### `GET /api/owner/stats`

**Auth**: Open  
**Response 200**:
```json
{
  "today": { "revenue": 1200, "orders": 3 },
  "week": { "revenue": 8400, "orders": 21 },
  "month": {
    "revenue": 28000,
    "orders": 72,
    "growth": 12.5,
    "online": { "revenue": 18000, "orders": 45 },
    "pos": { "revenue": 10000, "orders": 27 }
  },
  "total": { "revenue": 142000, "orders": 380 },
  "topProducts": [{ "productId", "nameAr", "image", "_sum": { "quantity": 48 } }],
  "lowStock": [{ "id", "nameAr", "sku", "stock", "season" }],
  "trend": [{ "date": "2026-06-01", "revenue": 950, "online": 600, "pos": 350 }],
  "totalCustomers": 234
}
```

Low-stock threshold: `stock < 10`. Trend covers last 30 days. Growth is month-over-month percentage.

---

### `GET /api/owner/activity`

**Auth**: Open  
**Response 200**: `{ items: ActivityItem[] }` — up to 15 items sorted by urgency and recency.

Activity types:
- `order` — recent orders (last 10). Marked `urgent: true` if status is PENDING
- `user` — recent new customers (last 5)
- `stock` — products with `stock <= 5`. Marked `urgent: true` if `stock === 0`

---

### `GET /api/owner/orders`

**Auth**: Open  
**Query params**: `period` — `today` | `week` | `month` | (none = all time)  
**Response 200**: Array of orders with selected fields: `{ id, orderNumber, customerName, customerPhone, city, total, status, paymentMethod, source, createdAt, itemsCount, firstImage }`

---

### `GET /api/owner/orders/[id]`

**Auth**: Open  
**Response 200**: Full order with items. Each item includes product current stock, sizeStock, images, active status.  
**Response 404**: `{ "error": "Not found" }`

---

### `GET /api/owner/products`

**Auth**: Open  
**Query params**: `search`, `season`, `stock` (`low` = stock 1-9, `out` = stock 0)  
**Response 200**: Array of active products with: `{ id, nameAr, sku, price, season, stock, images, sizes, sizeStock, variants, featured, category: { nameAr } }`

---

### `GET /api/owner/products/[id]`

**Auth**: Open  
**Response 200**: Product with extended analytics:
```json
{
  "...product fields...",
  "soldTotal": 48,
  "revenueTotal": 16800,
  "ordersCount": 35,
  "sizeSales": [
    { "size": "M", "qty": 20 },
    { "size": "L", "qty": 18 }
  ]
}
```

`soldTotal` and `revenueTotal` exclude CANCELLED orders.
