# UI Patterns

## RTL Design System Foundation

The entire UI is right-to-left. The root layout sets:
```tsx
<html lang="ar" dir="rtl" className={`${cairo.variable} ${cormorant.variable} h-full`}>
  <body className="min-h-full flex flex-col font-cairo antialiased bg-white">
```

This single `dir="rtl"` attribute on `<html>` means:
- The browser reverses all horizontal directional defaults
- Text flows right-to-left
- Flex rows reverse (flex-row now flows RTL)
- Margin/padding logical properties follow RTL direction
- Tailwind v4's `ms-*` / `me-*` / `ps-*` / `pe-*` utilities are direction-aware

**Critical**: Because `dir="rtl"` is on `<html>`, ALL child elements inherit RTL. The admin dashboard explicitly sets `dir="rtl"` again in its layout (`<div className="flex min-h-screen bg-gray-50" dir="rtl">`) for redundancy, but this is the inherited value anyway.

---

## Typography

### Cairo (Arabic Primary)

Loaded from Google Fonts with `subsets: ['arabic', 'latin']` and weights 300, 400, 500, 600, 700, 800. Assigned to CSS variable `--font-cairo`.

```css
body {
  font-family: var(--font-cairo), 'Cairo', Arial, sans-serif;
  line-height: 1.75;  /* RTL-appropriate, wider than Latin default 1.5 */
}
```

Applied globally via `font-cairo` class on `<body>`. Admin dashboard and owner dashboard also use `font-cairo` explicitly on text elements.

### Cormorant Garamond (Decorative English)

Loaded with `subsets: ['latin']`, weights 300–700, both normal and italic. Assigned to `--font-cormorant`. Used with the `.font-cormorant` class for brand headings and English decorative phrases.

### RTL Line Height Overrides

Arabic script requires more vertical space than Latin. Tailwind's default line-height values are overridden in `@theme`:

```css
--leading-none:    1
--leading-tight:   1.4    /* Tailwind default: 1.25 */
--leading-snug:    1.6    /* Tailwind default: 1.375 */
--leading-normal:  1.75   /* Tailwind default: 1.5 */
--leading-relaxed: 1.9    /* Tailwind default: 1.625 */
--leading-loose:   2.25   /* Tailwind default: 2 */
```

These overrides apply everywhere `leading-*` Tailwind classes are used.

### Line Clamp

Arabic descenders clip at normal overflow cutoffs. The global CSS adds `padding-bottom: 2px` to all line-clamp utilities:

```css
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  padding-bottom: 2px;  /* prevents Arabic letter tail clipping */
}
```

---

## Brand Color Palette

The brand palette (dusty rose / clay) is defined as CSS custom properties in `globals.css` under `@theme inline`. These map to `bg-brand-*`, `text-brand-*`, `border-brand-*` Tailwind classes.

| Token | Hex Value | Typical Use |
|---|---|---|
| `brand-50` | `#fdf6f3` | Page backgrounds, very light tints |
| `brand-100` | `#f8ede8` | Card backgrounds, hover states |
| `brand-200` | `#edd5cc` | Borders, dividers |
| `brand-300` | `#dab5a8` | Disabled states, subtle elements |
| `brand-400` | `#c2907e` | Scrollbar thumb, secondary accents |
| `brand-500` | `#b07060` | Secondary text, labels |
| `brand-600` | `#9a5848` | Icon colors, active states |
| `brand-700` | `#7a4338` | Button hover states |
| `brand-800` | `#562e25` | Dark accents |
| `brand-900` | `#361b15` | Darkest brand shade |

| Token | Hex Value | Use |
|---|---|---|
| `gold-400` | `#e8c96a` | Highlights |
| `gold-500` | `#c9a84c` | Primary gold accent |
| `gold-600` | `#a68530` | Gold hover states |

The owner dashboard deviates: it uses a dark theme with inline styles (`background: 'rgba(255,255,255,0.05)'`, `color: '#9ca3af'`, etc.) rather than brand tokens. This is intentional — the owner dashboard looks distinct from the customer store.

---

## Scrollbar Styling

```css
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: #fdf6f3; }  /* brand-50 */
::-webkit-scrollbar-thumb { background: #c2907e; border-radius: 3px; }  /* brand-400 */
```

The `.no-scrollbar` utility class hides scrollbars entirely (used for horizontal carousels):
```css
.no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
.no-scrollbar::-webkit-scrollbar { display: none; }
```

---

## StoreHydration Pattern

**Problem**: Zustand stores with `persist` write to localStorage. During SSR, localStorage does not exist. If the server renders a non-empty cart (using SSR-time store state) but the client hydrates with an empty cart, React throws a hydration mismatch.

**Solution**: Both stores use `skipHydration: true`. This tells Zustand not to automatically rehydrate from localStorage during initial store creation. The stores start empty on both server and client.

`StoreHydration.tsx`:
```tsx
'use client'
import { useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'

export default function StoreHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate()
    useWishlistStore.persist.rehydrate()
  }, [])
  return null
}
```

This component renders in the root layout's `<body>` (before any route children). The `useEffect` runs only on the client, after React hydration completes. At that point, Zustand reads from localStorage and updates the stores. This causes a re-render of any component consuming the stores — which is expected and correct. The component returns `null` (renders nothing visible).

**Rule**: Any new Zustand store that persists to localStorage must use `skipHydration: true` and must be added to `StoreHydration.tsx`.

---

## Mobile Responsive Patterns

The store uses a mobile-first grid progression:

| Context | Mobile | md | lg | xl |
|---|---|---|---|---|
| Product grid | `grid-cols-2` | `grid-cols-3` | `grid-cols-4` | — |
| Dashboard stats | `grid-cols-1` | `grid-cols-2` | `grid-cols-4` | — |
| Checkout layout | `flex-col` | `flex-row` | — | — |

The store layout uses a single column on mobile with full-width sections. Carousels use `overflow-x-auto no-scrollbar` with `flex gap-4` for horizontal scrolling on mobile.

---

## Admin Sidebar Pattern

`AdminSidebar.tsx` implements two behaviors:

**Desktop** (lg+ breakpoint): Fixed sidebar, always visible on the left (which is the right side in RTL — visually, the sidebar appears on the right of the viewport because `dir="rtl"` reverses flex direction). The sidebar has navigation links grouped by section.

**Mobile**: The sidebar collapses to a bottom navigation bar or a drawer. The exact implementation is in `AdminSidebar.tsx` using Tailwind responsive prefixes (`hidden lg:block`, `lg:hidden`).

Layout structure in `admin/layout.tsx`:
```tsx
<div className="flex min-h-screen bg-gray-50" dir="rtl">
  <AdminSidebar />
  <main className="flex-1 min-w-0 p-4 lg:p-6 pb-20 lg:pb-6">
    {children}
  </main>
</div>
```

`pb-20` on mobile accounts for the bottom navigation bar height. `lg:pb-6` on desktop removes this extra padding.

---

## Animations

The homepage uses section entrance animations defined in `globals.css`:

```css
@keyframes marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.marquee-track {
  animation: marquee 30s linear infinite;
}
.marquee-container:hover .marquee-track {
  animation-play-state: paused;
}
```

This powers the features bar announcement ticker that scrolls horizontally. Hovering pauses the animation.

---

## Arabic-Specific CSS Considerations

1. **`padding-bottom: 2px` on line-clamp**: Arabic letters have long descenders (tails below the baseline). Standard `overflow: hidden` on multi-line text clips these tails. The extra padding prevents this.

2. **`line-height: 1.75` default**: Arabic text at `1.5` line-height collides between lines. `1.75` is the minimum comfortable value.

3. **Font weight 800**: Cairo at weight 800 is used for hero headings and section titles — it renders crisply for Arabic script at large sizes.

4. **RTL and Tailwind flex**: In RTL, `flex-row` flows right-to-left. `justify-end` aligns to the right side of the container (the "start" in LTR). This can be surprising. Prefer `justify-between`, `gap-*`, and explicit directional utilities when layout needs to be predictable.

5. **Logical properties**: Use `ms-*` (margin-start = margin-right in RTL) and `me-*` (margin-end = margin-left in RTL) for direction-aware margins. The standard `ml-*` / `mr-*` are absolute and don't respect RTL.

6. **Numbers**: Arabic numerals in Egyptian context are typically displayed in Western Arabic form (0-9), not Eastern Arabic (٠-٩). The `formatPrice` function uses `Intl.NumberFormat('ar-EG')` which outputs `١٬٥٠٠ ج.م.‏` format in some locales. Review this if numeric display looks unexpected.

---

## Zustand Rehydration Pattern for New Stores

If you add a new client-side Zustand store that needs persistence:

1. Create the store with `persist` middleware and `skipHydration: true`:
```typescript
export const useNewStore = create<NewStore>()(
  persist(
    (set, get) => ({
      // ...
    }),
    { name: 'zahrt-new-key', skipHydration: true },
  ),
)
```

2. Add rehydration to `StoreHydration.tsx`:
```typescript
import { useNewStore } from '@/store/newStore'

export default function StoreHydration() {
  useEffect(() => {
    useCartStore.persist.rehydrate()
    useWishlistStore.persist.rehydrate()
    useNewStore.persist.rehydrate()  // add this line
  }, [])
  return null
}
```

Without step 2, the store will always render empty on the client until a user interaction triggers a state change.

---

## HeroBanner Component

The homepage hero is powered by the `HeroBanner.tsx` component which reads from the `Banner` model (fetched via `/api/banners`). Banners with `active: true` are sorted by `sortOrder: asc`. The component renders a carousel/slider. Banner images are full-width with Arabic title and subtitle overlaid.

---

## ProductCard Component

`ProductCard.tsx` renders a product thumbnail with:
- jsDelivr CDN image (first item from `product.images[]`)
- Arabic name (`nameAr`) — primary
- English name (`nameEn`) — secondary, smaller
- Price formatted via `formatPrice()`
- Wishlist toggle (Zustand)
- Add to cart button (Zustand)

The card uses `line-clamp-1` / `line-clamp-2` for name truncation with the Arabic descender padding.
