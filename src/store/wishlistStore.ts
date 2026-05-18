'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WishlistItem } from '@/types'

interface WishlistStore {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  toggleItem: (item: WishlistItem) => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: state.items.find((i) => i.productId === item.productId)
            ? state.items
            : [...state.items, item],
        })),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      isInWishlist: (productId) => get().items.some((i) => i.productId === productId),
      toggleItem: (item) => {
        const exists = get().isInWishlist(item.productId)
        if (exists) get().removeItem(item.productId)
        else get().addItem(item)
      },
    }),
    { name: 'zahrt-wishlist' },
  ),
)
