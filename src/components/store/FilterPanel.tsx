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
  const [priceOpen, setPriceOpen] = useState(false)

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
  const hasPriceFilter = minPrice || maxPrice

  const categoryButtons = (
    <>
      <button
        onClick={() => applyFilter('category', '')}
        className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-cairo transition-colors ${
          !activeCategory ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-brand-400'
        }`}
      >
        الكل
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => applyFilter('category', cat.slug)}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-cairo transition-colors ${
            activeCategory === cat.slug ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-brand-400'
          }`}
        >
          {cat.nameAr}
          <span className={`mr-1 text-xs ${activeCategory === cat.slug ? 'text-brand-100' : 'text-gray-400'}`}>
            ({cat._count.products})
          </span>
        </button>
      ))}
    </>
  )

  const pricePanel = (
    <div className="space-y-2" dir="rtl">
      <p className="text-sm font-bold text-gray-900 font-cairo">نطاق السعر (جنيه)</p>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          placeholder="من"
          defaultValue={minPrice}
          onBlur={(e) => applyFilter('minPrice', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo"
          dir="rtl"
        />
        <input
          type="number"
          placeholder="إلى"
          defaultValue={maxPrice}
          onBlur={(e) => applyFilter('maxPrice', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo"
          dir="rtl"
        />
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile: horizontal chip bar */}
      <div className="lg:hidden w-full" dir="rtl">
        <div className="flex items-center gap-2">
          <div className="flex-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="flex gap-2 pb-0.5">
              {categoryButtons}
            </div>
          </div>
          <button
            onClick={() => setPriceOpen(!priceOpen)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-cairo border transition-colors ${
              hasPriceFilter ? 'bg-brand-600 text-white border-brand-600' : 'bg-white border-gray-200 text-gray-700 hover:border-brand-400'
            }`}
          >
            <SlidersHorizontal size={14} />
            السعر
          </button>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="shrink-0 p-1.5 text-gray-400 hover:text-brand-600 transition-colors"
              title="مسح الفلاتر"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {priceOpen && (
          <div className="mt-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
            {pricePanel}
          </div>
        )}
      </div>

      {/* Desktop panel */}
      <div className="hidden lg:block w-56 shrink-0">
        <div className="bg-white rounded-xl border border-gray-100 p-4 sticky top-20" dir="rtl">
          <div className="space-y-6">
            {hasFilters && (
              <button onClick={clearAll} className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-cairo">
                <X size={14} />
                مسح الفلاتر
              </button>
            )}
            <div>
              <h3 className="font-bold text-gray-900 font-cairo mb-3">الأقسام</h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => applyFilter('category', '')}
                  className={`w-full text-right px-3 py-2 rounded-lg text-sm font-cairo transition-colors ${!activeCategory ? 'bg-brand-600 text-white' : 'text-gray-700 hover:bg-brand-50'}`}
                >
                  جميع المنتجات
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => applyFilter('category', cat.slug)}
                    className={`w-full text-right px-3 py-2 rounded-lg text-sm font-cairo transition-colors flex justify-between items-center ${activeCategory === cat.slug ? 'bg-brand-600 text-white' : 'text-gray-700 hover:bg-brand-50'}`}
                  >
                    <span>{cat.nameAr}</span>
                    <span className={`text-xs ${activeCategory === cat.slug ? 'text-brand-100' : 'text-gray-400'}`}>
                      ({cat._count.products})
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              {pricePanel}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
