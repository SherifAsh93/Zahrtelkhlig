'use client'
import { useState, useEffect } from 'react'
import { Snowflake, Sun, Package, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  nameAr: string
  sku?: string
  price: number
  stock: number
  season: 'WINTER' | 'SUMMER'
  images: string[]
  active: boolean
}

export default function AdminCategoriesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [season, setSeason] = useState<'WINTER' | 'SUMMER'>('WINTER')
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    const params = new URLSearchParams({ season, limit: '100' })
    if (search) params.set('search', search)
    const res = await fetch(`/api/admin/products?${params}`)
    const data = await res.json()
    setProducts(data.products || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [season, search])

  const winterCount = products.filter((p) => p.season === 'WINTER').length
  const summerCount = products.filter((p) => p.season === 'SUMMER').length

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-cairo">المنتجات بالموسم</h1>
          <p className="text-gray-500 text-sm font-cairo mt-1">
            عرض وإدارة المنتجات مصنفةً حسب الموسم
          </p>
        </div>
        <Link href="/admin/products/new" className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-cairo hover:bg-brand-700 transition-colors">
          <Package size={15} />
          منتج جديد
        </Link>
      </div>

      {/* Season tabs */}
      <div className="flex gap-3 mb-5">
        <button
          onClick={() => setSeason('WINTER')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-cairo font-semibold transition-all ${
            season === 'WINTER' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300'
          }`}
        >
          <Snowflake size={16} />
          شتوي
          <span className={`text-xs px-2 py-0.5 rounded-full ${season === 'WINTER' ? 'bg-blue-500' : 'bg-gray-100 text-gray-500'}`}>
            {winterCount}
          </span>
        </button>
        <button
          onClick={() => setSeason('SUMMER')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-cairo font-semibold transition-all ${
            season === 'SUMMER' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-white border border-gray-200 text-gray-700 hover:border-amber-300'
          }`}
        >
          <Sun size={16} />
          صيفي
          <span className={`text-xs px-2 py-0.5 rounded-full ${season === 'SUMMER' ? 'bg-amber-400' : 'bg-gray-100 text-gray-500'}`}>
            {summerCount}
          </span>
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو الكود..."
          className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm font-cairo focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400 font-cairo">
          <Package size={48} className="mx-auto mb-3 text-gray-200" />
          لا توجد منتجات في هذا الموسم
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/admin/products/${product.id}/edit`}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-brand-300 hover:shadow-md transition-all group"
            >
              <div className="relative aspect-[3/4] bg-gray-100">
                {product.images[0] ? (
                  <Image src={product.images[0]} alt={product.nameAr} fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Package size={24} />
                  </div>
                )}
                {!product.active && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-red-500 text-white text-xs font-cairo px-2 py-0.5 rounded-full">غير نشط</span>
                  </div>
                )}
                {product.stock === 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-cairo font-bold px-1.5 py-0.5 rounded-full">نفد</div>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-cairo font-bold text-gray-900 leading-tight line-clamp-2">{product.nameAr}</p>
                {product.sku && <p className="text-[10px] font-mono text-gray-400 mt-0.5">{product.sku}</p>}
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-xs font-bold text-brand-600 font-cairo">{product.price} ج</p>
                  <p className={`text-[10px] font-cairo ${product.stock < 5 ? 'text-amber-600' : 'text-gray-400'}`}>{product.stock} قطعة</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
