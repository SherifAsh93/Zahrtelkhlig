'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Trash2, Search, Package, X, ChevronRight, ChevronLeft, CheckSquare, Square, Trash } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  nameAr: string
  price: number
  stock: number
  season: 'WINTER' | 'SUMMER'
  active: boolean
  featured: boolean
  images: string[]
  category: { nameAr: string; slug: string } | null
  createdAt: string
}

const seasonLabel = (s: 'WINTER' | 'SUMMER') => s === 'SUMMER' ? 'صيفي' : 'شتوي'
const seasonStyle = (s: 'WINTER' | 'SUMMER') =>
  s === 'SUMMER' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'

const LIMIT = 24

function AdminProductsInner() {
  const searchParams = useSearchParams()
  const categoryFilter = searchParams.get('category') || ''
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const qs = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
    if (categoryFilter) qs.set('category', categoryFilter)
    const res = await fetch(`/api/admin/products?${qs}`)
    const data = await res.json()
    setProducts(data.products ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [page, categoryFilter])

  useEffect(() => { load() }, [load])

  // Clear selection when page changes
  useEffect(() => { setSelected(new Set()) }, [page, categoryFilter])

  const filtered = search
    ? products.filter((p) => p.nameAr.includes(search))
    : products

  const visibleIds = filtered.map(p => p.id)
  const allSelected = visibleIds.length > 0 && visibleIds.every(id => selected.has(id))
  const someSelected = selected.size > 0

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(prev => {
        const next = new Set(prev)
        visibleIds.forEach(id => next.delete(id))
        return next
      })
    } else {
      setSelected(prev => {
        const next = new Set(prev)
        visibleIds.forEach(id => next.add(id))
        return next
      })
    }
  }

  function clearSelection() {
    setSelected(new Set())
  }

  async function deleteProduct(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (!res.ok) { alert('فشل الحذف'); return }
    setProducts(prev => prev.filter(p => p.id !== id))
    setTotal(prev => prev - 1)
    setSelected(prev => { const next = new Set(prev); next.delete(id); return next })
  }

  async function bulkDelete() {
    const ids = Array.from(selected)
    if (!confirm(`هل أنت متأكد من حذف ${ids.length} منتج؟`)) return
    setBulkLoading(true)
    const res = await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    })
    if (!res.ok) { alert('فشل الحذف'); setBulkLoading(false); return }
    const { deleted } = await res.json()
    setProducts(prev => prev.filter(p => !selected.has(p.id)))
    setTotal(prev => prev - deleted)
    setSelected(new Set())
    setBulkLoading(false)
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-cairo">المنتجات</h1>
          <p className="text-gray-500 text-sm font-cairo mt-1">{total} منتج إجمالاً</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus size={16} />
            إضافة منتج
          </Button>
        </Link>
      </div>

      {/* Category filter badge */}
      {categoryFilter && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-gray-500 font-cairo">فلتر حسب القسم:</span>
          <span className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 text-xs font-cairo font-semibold px-3 py-1 rounded-full">
            {products[0]?.category?.nameAr || categoryFilter}
            <Link href="/admin/products" className="hover:text-brand-900"><X size={12} /></Link>
          </span>
        </div>
      )}

      {/* Search + Select All row */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث..."
            className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo"
          />
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Select all toggle */}
        {filtered.length > 0 && (
          <button
            onClick={toggleAll}
            className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-cairo text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {allSelected
              ? <CheckSquare size={16} className="text-brand-600" />
              : <Square size={16} />}
            تحديد الكل
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 font-cairo bg-white rounded-2xl border border-gray-100">
          <Package size={48} className="mx-auto mb-3 text-gray-200" />
          لا توجد منتجات
        </div>
      ) : (
        <>
          {/* Product grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filtered.map((product) => {
              const isSelected = selected.has(product.id)
              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col cursor-pointer transition-all ${
                    isSelected ? 'border-brand-500 ring-2 ring-brand-300' : 'border-gray-100'
                  }`}
                >
                  {/* Image with checkbox overlay */}
                  <div
                    className="relative w-full aspect-[3/4] bg-gray-100"
                    onClick={() => toggleSelect(product.id)}
                  >
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.nameAr}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Package size={28} />
                      </div>
                    )}
                    {/* Checkbox */}
                    <div className={`absolute top-1.5 right-1.5 w-5 h-5 rounded flex items-center justify-center transition-all ${
                      isSelected ? 'bg-brand-600' : 'bg-white/80 border border-gray-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    {/* Selected overlay */}
                    {isSelected && <div className="absolute inset-0 bg-brand-600/10" />}
                  </div>

                  {/* Info */}
                  <div className="p-2 flex flex-col gap-1 flex-1">
                    <p className="text-xs font-bold text-gray-900 font-cairo leading-tight line-clamp-2">
                      {product.nameAr}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium font-cairo ${seasonStyle(product.season)}`}>
                        {seasonLabel(product.season)}
                      </span>
                      {product.category && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium font-cairo bg-gray-100 text-gray-600">
                          {product.category.nameAr}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-1">
                      <span className="text-xs font-bold text-brand-600 font-cairo">{formatPrice(product.price)}</span>
                      <span className="text-[10px] text-gray-500 font-cairo">كمية: {product.stock}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex border-t border-gray-100">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="flex-1 flex items-center justify-center py-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      onClick={e => e.stopPropagation()}
                    >
                      <Edit size={14} />
                    </Link>
                    <div className="w-px bg-gray-100" />
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteProduct(product.id) }}
                      className="flex-1 flex items-center justify-center py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 pb-24">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
              <span className="text-sm text-gray-600 font-cairo px-3">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Bulk action bar — sticks to bottom when items selected */}
      {someSelected && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl">
          <span className="font-cairo text-sm">
            {selected.size} منتج محدد
          </span>
          <button
            onClick={clearSelection}
            className="text-gray-400 hover:text-white transition-colors"
            title="إلغاء التحديد"
          >
            <X size={16} />
          </button>
          <div className="w-px h-5 bg-gray-600" />
          <button
            onClick={bulkDelete}
            disabled={bulkLoading}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white text-sm font-cairo font-semibold px-4 py-1.5 rounded-xl transition-colors"
          >
            <Trash size={14} />
            {bulkLoading ? 'جاري الحذف...' : 'حذف المحددة'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function AdminProductsPage() {
  return (
    <Suspense>
      <AdminProductsInner />
    </Suspense>
  )
}
