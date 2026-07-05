export const revalidate = 30

import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/store/ProductCard'
import FilterPanel from '@/components/store/FilterPanel'
import { Spinner } from '@/components/ui/Spinner'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SearchParams {
  season?: string
  search?: string
  featured?: string
  page?: string
  minPrice?: string
  maxPrice?: string
}

async function getProducts(params: SearchParams) {
  const page = parseInt(params.page || '1')
  const limit = 12
  const where: Record<string, unknown> = { active: true }
  if (params.season) where.season = params.season
  if (params.featured === 'true') where.featured = true
  if (params.search) {
    where.OR = [
      { nameAr: { contains: params.search, mode: 'insensitive' } },
      { nameEn: { contains: params.search, mode: 'insensitive' } },
    ]
  }
  if (params.minPrice || params.maxPrice) {
    where.price = {
      ...(params.minPrice && { gte: parseFloat(params.minPrice) }),
      ...(params.maxPrice && { lte: parseFloat(params.maxPrice) }),
    }
  }
  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { createdAt: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])
    return { products, total, page, pages: Math.ceil(total / limit) }
  } catch {
    return { products: [], total: 0, page: 1, pages: 0 }
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { products, total, page, pages } = await getProducts(params)

  const title = params.search
    ? `نتائج البحث: "${params.search}"`
    : params.featured === 'true'
    ? 'المنتجات المميزة'
    : params.season === 'WINTER'
    ? 'ملابس الشتاء'
    : params.season === 'SUMMER'
    ? 'ملابس الصيف'
    : 'جميع المنتجات'

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-cairo">{title}</h1>
        <p className="text-gray-500 text-sm font-cairo mt-1">{total} منتج</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <Suspense>
          <FilterPanel />
        </Suspense>

        <div className="flex-1 min-w-0">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-6xl mb-4">🔍</span>
              <h3 className="text-lg font-bold text-gray-900 font-cairo mb-2">لا توجد منتجات</h3>
              <p className="text-gray-500 font-cairo mb-6">جربي البحث بكلمات مختلفة أو فلاتر أخرى</p>
              <Link href="/products" className="px-5 py-2 bg-brand-600 text-white rounded-full text-sm font-cairo hover:bg-brand-700">
                عرض جميع المنتجات
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {page > 1 && (
                    <Link
                      href={`?${new URLSearchParams({ ...params, page: String(page - 1) }).toString()}`}
                      className="p-2 border border-gray-200 rounded-lg hover:border-brand-400 transition-colors"
                    >
                      <ChevronRight size={18} />
                    </Link>
                  )}
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      href={`?${new URLSearchParams({ ...params, page: String(p) }).toString()}`}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                        p === page ? 'bg-brand-600 text-white' : 'border border-gray-200 text-gray-700 hover:border-brand-400'
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                  {page < pages && (
                    <Link
                      href={`?${new URLSearchParams({ ...params, page: String(page + 1) }).toString()}`}
                      className="p-2 border border-gray-200 rounded-lg hover:border-brand-400 transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
