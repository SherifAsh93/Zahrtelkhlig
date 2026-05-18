'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'

interface Category {
  id: string
  nameAr: string
  slug: string
  _count: { products: number }
}

interface FilterPanelProps {
  categories: Category[]
}

export default function FilterPanel({ categories }: FilterPanelProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)

  const activeCategory = searchParams.get('category') || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  function clearAll() {
    router.push('/products')
  }

  const hasFilters = activeCategory || minPrice || maxPrice

  const panel = (
    <div className="space-y-6" dir="rtl">
      {hasFilters && (
        <button onClick={clearAll} className="flex items-center gap-1.5 text-sm text-rose-600 hover:text-rose-700 font-cairo">
          <X size={14} />
          مسح الفلاتر
        </button>
      )}

      {/* Categories */}
      <div>
        <h3 className="font-bold text-gray-900 font-cairo mb-3">الأقسام</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => applyFilter('category', '')}
            className={`w-full text-right px-3 py-2 rounded-lg text-sm font-cairo transition-colors ${!activeCategory ? 'bg-rose-600 text-white' : 'text-gray-700 hover:bg-rose-50'}`}
          >
            جميع المنتجات
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => applyFilter('category', cat.slug)}
              className={`w-full text-right px-3 py-2 rounded-lg text-sm font-cairo transition-colors flex justify-between items-center ${activeCategory === cat.slug ? 'bg-rose-600 text-white' : 'text-gray-700 hover:bg-rose-50'}`}
            >
              <span>{cat.nameAr}</span>
              <span className={`text-xs ${activeCategory === cat.slug ? 'text-rose-100' : 'text-gray-400'}`}>
                ({cat._count.products})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="font-bold text-gray-900 font-cairo mb-3">نطاق السعر (جنيه)</h3>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="من"
            defaultValue={minPrice}
            onBlur={(e) => applyFilter('minPrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-rose-300 font-cairo"
            dir="rtl"
          />
          <input
            type="number"
            placeholder="إلى"
            defaultValue={maxPrice}
            onBlur={(e) => applyFilter('maxPrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-rose-300 font-cairo"
            dir="rtl"
          />
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-cairo hover:border-rose-400"
        >
          <SlidersHorizontal size={16} />
          الفلاتر
          {hasFilters && <span className="w-2 h-2 bg-rose-600 rounded-full" />}
        </button>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex" dir="rtl">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <div className="relative mr-auto w-64 bg-white h-full p-4 overflow-y-auto shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold font-cairo">الفلاتر</h2>
                <button onClick={() => setMobileOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              {panel}
            </div>
          </div>
        )}
      </div>

      {/* Desktop panel */}
      <div className="hidden lg:block w-56 shrink-0">
        <div className="bg-white rounded-xl border border-gray-100 p-4 sticky top-20">
          {panel}
        </div>
      </div>
    </>
  )
}
