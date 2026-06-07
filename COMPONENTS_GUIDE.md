# Zahrtelkhlig — Components Guide

Components live in `src/components/` organized into four groups: `layout/`, `admin/`, `store/`, and `ui/`.

---

## StoreHydration

**File:** `src/components/StoreHydration.tsx`  
**Type:** Client component

**Purpose:** Rehydrates Zustand stores (cart, wishlist) from localStorage on page load. This component is placed in the root layout to run on every page load and prevents hydration mismatches between SSR and client.

**Props:** `{ children: React.ReactNode }`

**Usage:**
```tsx
// Used in src/app/layout.tsx
<StoreHydration>{children}</StoreHydration>
```

---

## layout/Navbar

**File:** `src/components/layout/Navbar.tsx`  
**Type:** Client component

**Purpose:** Customer-facing header. RTL Arabic layout.

**Features:**
- Trust strip above nav (free shipping, secure payments, phone number)
- Logo (3-tap Easter egg → `/admin`)
- Mobile hamburger menu
- Cart icon with item count badge (from `cartStore`)
- Wishlist icon with count badge (from `wishlistStore`)
- User dropdown: Profile, Orders, Logout (or Login/Register if unauthenticated)
- Calls `logout()` server action on logout

**Props:** None (reads session and stores internally)

---

## layout/Footer

**File:** `src/components/layout/Footer.tsx`  
**Type:** Server component

**Purpose:** Store footer with brand info, nav links, and contact.

**Props:** None

---

## admin/AdminSidebar

**File:** `src/components/admin/AdminSidebar.tsx`  
**Type:** Client component

**Purpose:** Navigation sidebar for admin and owner dashboards.

**Features:**
- Collapsible on desktop (icon-only mode)
- Mobile: hidden by default, opens as full-screen drawer, bottom tab bar also shown
- Active item highlighted
- Role-aware: shows different items for admin vs. owner
- Logout button + links to store and POS
- Item list: Dashboard, Products, Orders, Categories, Inventory, Reports, Homepage, Banners, Users (admin only)

**Props:**
```typescript
interface AdminSidebarProps {
  role?: "admin" | "owner";
}
```

---

## admin/ProductForm

**File:** `src/components/admin/ProductForm.tsx`  
**Type:** Client component (17KB — complex)

**Purpose:** Full product create and edit form. Used in both `/admin/products/new` and `/admin/products/[id]/edit`.

**Features:**
- Bilingual inputs for name and description (Arabic + English)
- Image upload with preview (multiple images)
- Category selector (dropdown, loaded from API)
- Season selector (Winter / Summer)
- Featured/Active toggles
- Price and compare price inputs
- SKU field
- Sizes array input (add/remove size chips)
- Size-based stock breakdown (auto-generates inputs per size)
- Variants management (color + size + stock combos)
- Submit calls `POST /api/admin/products` (create) or `PUT /api/admin/products/[id]` (update)

**Props:**
```typescript
interface ProductFormProps {
  product?: Product;    // If provided, form is in edit mode
  categories: Category[];
}
```

---

## admin/AdminLoginView

**File:** `src/components/admin/AdminLoginView.tsx`  
**Type:** Client component

**Purpose:** Reusable admin login form component.

**Props:**
```typescript
interface AdminLoginViewProps {
  onLogin: (password: string) => Promise<void>;
  title?: string;
  error?: string;
}
```

---

## admin/RecentOrdersClient

**File:** `src/components/admin/RecentOrdersClient.tsx`  
**Type:** Client component

**Purpose:** Displays a table of recent orders on the admin dashboard with live refresh.

**Props:**
```typescript
interface RecentOrdersClientProps {
  initialOrders: Order[];
}
```

---

## admin/DashboardQuickAccess

**File:** `src/components/admin/DashboardQuickAccess.tsx`  
**Type:** Client component

**Purpose:** Quick-access stat cards and action buttons on the admin dashboard (total orders, revenue, low stock alert).

**Props:** `{ stats: DashboardStats }`

---

## store/HeroBanner

**File:** `src/components/store/HeroBanner.tsx`  
**Type:** Client component

**Purpose:** Homepage hero section displaying active banners as a slideshow.

**Features:**
- Fetches active banners from `/api/banners`
- Auto-rotate slides every 5 seconds
- Bilingual title/subtitle (Arabic primary)
- CTA button with configurable link

**Props:** `{ banners: Banner[] }`

---

## store/ProductCard

**File:** `src/components/store/ProductCard.tsx`  
**Type:** Client component

**Purpose:** Individual product display card used in carousels, grids, and listing pages.

**Features:**
- Product image with hover zoom
- Arabic name (primary) + English name
- Price with compare-price strikethrough
- Discount badge (auto-calculated if comparePrice exists)
- "New" badge for products created within last 7 days
- Season badge (Winter/Summer)
- Add to cart button (updates Zustand cartStore)
- Wishlist toggle (heart icon, updates Zustand wishlistStore)
- Links to `/products/[id]`

**Props:**
```typescript
interface ProductCardProps {
  product: Product;
  showCategory?: boolean;
}
```

---

## store/ProductCarousel

**File:** `src/components/store/ProductCarousel.tsx`  
**Type:** Client component

**Purpose:** Horizontal scroll carousel for "New Arrivals" and "Featured" homepage sections.

**Features:**
- Smooth horizontal scroll
- Left/right arrow buttons
- Shows `ProductCard` for each product
- Auto-hides arrows if content fits without scrolling

**Props:**
```typescript
interface ProductCarouselProps {
  products: Product[];
  title?: string;
}
```

---

## store/CategoryTabsSection

**File:** `src/components/store/CategoryTabsSection.tsx`  
**Type:** Client component

**Purpose:** Category browser with tab selection on the homepage.

**Features:**
- Tabs for each active category
- Shows filtered products for selected tab
- Links to `/products?category=[slug]`

**Props:**
```typescript
interface CategoryTabsSectionProps {
  categories: Category[];
  productsByCategory: Record<string, Product[]>;
}
```

---

## store/FilterPanel

**File:** `src/components/store/FilterPanel.tsx`  
**Type:** Client component

**Purpose:** Product filter sidebar on the `/products` listing page.

**Filters:**
- Category (radio buttons)
- Season (Winter / Summer / All)
- Price range (slider or min/max inputs)
- In-stock only toggle

**Props:**
```typescript
interface FilterPanelProps {
  categories: Category[];
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}
```

---

## store/CartDrawer

**File:** `src/components/store/CartDrawer.tsx`  
**Type:** Client component

**Purpose:** Slide-out shopping cart drawer (opened from Navbar cart icon).

**Features:**
- Lists items from Zustand `cartStore`
- Quantity +/- controls
- Remove item button
- Subtotal and shipping display
- "Checkout" button → `/checkout`
- Empty cart state

**Props:**
```typescript
interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}
```

---

## ui/Button

**File:** `src/components/ui/Button.tsx`

**Props:**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}
```

---

## ui/Badge

**File:** `src/components/ui/Badge.tsx`

**Props:**
```typescript
interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
}
```

---

## ui/Spinner

**File:** `src/components/ui/Spinner.tsx`

**Props:** `{ size?: "sm" | "md" | "lg"; className?: string }`
