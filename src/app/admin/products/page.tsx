'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Trash2, Search, Package, X, ChevronRight, ChevronLeft } from 'lucide-react'
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
  s === 'SUMMER'
    ? 'bg-amber-100 text-amber-700'
    : 'bg-blue-100 text-blue-700'

const LIMIT = 24

function AdminProductsInner() {
  const searchParams = useSearchParams()
  const categoryFilter = searchParams.get('category') || ''
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    const qs = new URLSearchParams({ page: String(page), limit: String(LIMIT) })
    if (categoryFilter) qs.set('category', categoryFilter)
    const res = await fetch(`/api/admin/products?${qs}`)
    const data = await res.json()
    setProducts(data.products)
    setTotal(data.total)
    setLoading(false)
  }

  useEffect(() => { load() }, [page, categoryFilter])

  async function deleteProduct(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    load()
  }

  const filtered = search
    ? products.filter((p) => p.nameAr.includes(search))
    : products

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
            <Link href="/admin/products" className="hover:text-brand-900">
              <X size={12} />
            </Link>
          </span>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5 max-w-xs">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث..."
          className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo"
        />
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
            {filtered.map((product) => (
              <div key={product.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                {/* Image */}
                <div className="relative w-full aspect-[3/4] bg-gray-100">
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
                </div>

                {/* Info */}
                <div className="p-2 flex flex-col gap-1 flex-1">
                  <p className="text-xs font-bold text-gray-900 font-cairo leading-tight line-clamp-2">
                    {product.nameAr}
                  </p>

                  {/* Season + Category */}
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

                  {/* Price + Stock */}
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
                  >
                    <Edit size={14} />
                  </Link>
                  <div className="w-px bg-gray-100" />
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="flex-1 flex items-center justify-center py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
              <span className="text-sm text-gray-600 font-cairo px-3">
                {page} / {totalPages}
              </span>
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
