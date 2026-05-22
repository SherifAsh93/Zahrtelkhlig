'use client'
import { useState } from 'react'
import { Plus, X, ChevronUp, ChevronDown, Search } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export interface PickerProduct {
  id: string
  nameAr: string
  images: string[]
  price: number
  category?: { nameAr: string } | null
}

interface Props {
  allProducts: PickerProduct[]
  selected: string[]
  onChange: (ids: string[]) => void
}

export default function ProductPicker({ allProducts, selected, onChange }: Props) {
  const [search, setSearch] = useState('')

  const selectedSet = new Set(selected)

  const available = allProducts.filter(
    (p) => !selectedSet.has(p.id) && p.nameAr.toLowerCase().includes(search.toLowerCase()),
  )

  const selectedProducts = selected
    .map((id) => allProducts.find((p) => p.id === id))
    .filter(Boolean) as PickerProduct[]

  function add(id: string) {
    onChange([...selected, id])
  }

  function remove(id: string) {
    onChange(selected.filter((s) => s !== id))
  }

  function move(idx: number, dir: -1 | 1) {
    const next = [...selected]
    const target = idx + dir
    if (target < 0 || target >= next.length) return
    ;[next[idx], next[target]] = [next[target], next[idx]]
    onChange(next)
  }

  return (
    <div className="space-y-4 mt-2">

      {/* Selected list */}
      {selectedProducts.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-700 font-cairo mb-2">
            المنتجات المختارة ({selectedProducts.length})
          </p>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {selectedProducts.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-xl px-3 py-2">
                {/* Thumbnail */}
                <img
                  src={p.images[0] || '/placeholder.jpg'}
                  alt={p.nameAr}
                  className="w-10 h-10 object-cover rounded-lg shrink-0"
                />
                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-cairo text-gray-900 truncate">{p.nameAr}</p>
                  <p className="text-xs text-gray-400 font-cairo">{p.category?.nameAr ?? ''}{p.category ? ' · ' : ''}{formatPrice(p.price)}</p>
                </div>
                {/* Order controls */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-20 min-h-[28px] flex items-center justify-center"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    disabled={idx === selectedProducts.length - 1}
                    className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-20 min-h-[28px] flex items-center justify-center"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                {/* Remove */}
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  className="p-2 text-red-400 hover:text-red-600 shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search + available list */}
      <div>
        <p className="text-xs font-semibold text-gray-700 font-cairo mb-2">إضافة منتج</p>
        <div className="relative mb-2">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="w-full border border-gray-200 rounded-xl pr-9 pl-3 py-2.5 text-sm font-cairo focus:outline-none focus:border-brand-400"
          />
        </div>

        {available.length === 0 ? (
          <p className="text-xs text-gray-400 font-cairo text-center py-4">
            {search ? 'لا توجد نتائج' : 'تم اختيار جميع المنتجات'}
          </p>
        ) : (
          <div className="space-y-1 max-h-64 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
            {available.map((p) => (
              <div key={p.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors">
                <img
                  src={p.images[0] || '/placeholder.jpg'}
                  alt={p.nameAr}
                  className="w-10 h-10 object-cover rounded-lg shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-cairo text-gray-900 truncate">{p.nameAr}</p>
                  <p className="text-xs text-gray-400 font-cairo">{p.category?.nameAr ?? ''}{p.category ? ' · ' : ''}{formatPrice(p.price)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => add(p.id)}
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-brand-600 text-white text-xs font-cairo rounded-lg hover:bg-brand-700 transition-colors min-h-[36px]"
                >
                  <Plus size={13} />
                  إضافة
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
