'use client'
import { useState, useEffect, useCallback } from 'react'
import { Snowflake, Sun, Search, AlertTriangle, Package } from 'lucide-react'
import Image from 'next/image'

interface Variant { size: string; color: string; qty: number }

interface Product {
  id: string
  nameAr: string
  sku?: string
  season: 'WINTER' | 'SUMMER'
  variants: Variant[] | null
  sizes: string[]
  sizeStock: Record<string, number> | null
  stock: number
  images: string[]
  price: number
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [season, setSeason] = useState<'ALL' | 'WINTER' | 'SUMMER'>('ALL')
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState<Record<string, boolean>>({})

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (season !== 'ALL') params.set('season', season)
    if (search) params.set('search', search)
    const res = await fetch(`/api/admin/inventory?${params}`)
    setProducts(await res.json())
    setLoading(false)
  }, [season, search])

  useEffect(() => { load() }, [load])

  async function updateVariantQty(productId: string, size: string, color: string, qty: number) {
    const key = `${productId}-${size}-${color}`
    setSaving(s => ({ ...s, [key]: true }))
    const res = await fetch('/api/admin/inventory', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, size, color, qty }),
    })
    if (res.ok) {
      const data = await res.json()
      setProducts(prev => prev.map(p =>
        p.id === productId ? { ...p, variants: data.variants, stock: data.stock } : p
      ))
    }
    setSaving(s => ({ ...s, [key]: false }))
  }

  const lowStockCount = products.filter(p => p.stock < 5).length

  return (
    <div dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-cairo">إدارة المخزون</h1>
        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 mt-2 text-amber-600 text-sm font-cairo">
            <AlertTriangle size={16} />
            {lowStockCount} منتج بمخزون منخفض (أقل من 5 قطع)
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم أو الكود..."
            className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm font-cairo focus:outline-none focus:ring-2 focus:ring-brand-300" />
        </div>
        {(['ALL', 'WINTER', 'SUMMER'] as const).map(s => (
          <button key={s} onClick={() => setSeason(s)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-cairo font-medium transition-colors ${
              season === s ? s === 'WINTER' ? 'bg-blue-600 text-white' : s === 'SUMMER' ? 'bg-amber-500 text-white' : 'bg-gray-800 text-white'
              : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-400'}`}>
            {s === 'WINTER' && <Snowflake size={14} />}
            {s === 'SUMMER' && <Sun size={14} />}
            {s === 'ALL' ? 'الكل' : s === 'WINTER' ? 'شتوي' : 'صيفي'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400 font-cairo">
          <Package size={48} className="mx-auto mb-3 text-gray-200" />لا توجد منتجات
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(product => {
            const variants = product.variants && product.variants.length > 0
              ? product.variants
              : product.sizes.map(s => ({ size: s, color: '', qty: product.sizeStock?.[s] ?? 0 }))
            const isLow = product.stock < 5

            return (
              <div key={product.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isLow ? 'border-amber-200' : 'border-gray-100'}`}>
                <div className="p-4">
                  {/* Product header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative w-12 h-14 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                      {product.images[0]
                        ? <Image src={product.images[0]} alt={product.nameAr} fill className="object-cover" unoptimized />
                        : <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={20} /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-gray-900 font-cairo text-sm">{product.nameAr}</p>
                        {product.sku && <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{product.sku}</span>}
                        <span className={`text-xs font-cairo px-2 py-0.5 rounded-full ${product.season === 'WINTER' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                          {product.season === 'WINTER' ? '❄️ شتوي' : '☀️ صيفي'}
                        </span>
                        {isLow && <span className="text-xs font-cairo bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertTriangle size={10} />منخفض</span>}
                      </div>
                      <p className="text-xs text-gray-500 font-cairo mt-0.5">الإجمالي: <span className="font-bold text-gray-800">{product.stock} قطعة</span></p>
                    </div>
                  </div>

                  {/* Variants */}
                  {variants.length === 0 ? (
                    <p className="text-xs text-gray-400 font-cairo text-center py-2">لا توجد متغيرات — أضفها من صفحة تعديل المنتج</p>
                  ) : (
                    <div className="space-y-2">
                      {variants.map((v, idx) => {
                        const key = `${product.id}-${v.size}-${v.color}`
                        const isVariantLow = v.qty < 3
                        return (
                          <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border ${isVariantLow ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-gray-50'}`}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-gray-800 font-cairo">مقاس {v.size}</span>
                                {v.color && <span className="text-sm text-gray-600 font-cairo">{v.color}</span>}
                              </div>
                              {isVariantLow && v.qty > 0 && <p className="text-[10px] text-amber-600 font-cairo mt-0.5">مخزون منخفض</p>}
                              {v.qty === 0 && <p className="text-[10px] text-red-500 font-cairo mt-0.5">نفد من المخزون</p>}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button onClick={() => updateVariantQty(product.id, v.size, v.color, v.qty - 1)}
                                disabled={v.qty <= 0 || saving[key]}
                                className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 text-base font-bold">
                                −
                              </button>
                              <input type="number" min="0" value={v.qty}
                                onChange={(e) => updateVariantQty(product.id, v.size, v.color, parseInt(e.target.value) || 0)}
                                className="w-16 text-center py-1.5 border border-gray-200 rounded-lg text-sm font-bold font-cairo bg-white focus:outline-none focus:ring-1 focus:ring-brand-300" />
                              <button onClick={() => updateVariantQty(product.id, v.size, v.color, v.qty + 1)}
                                disabled={saving[key]}
                                className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 text-base font-bold">
                                +
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
