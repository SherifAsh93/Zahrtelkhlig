'use client'
import { useState } from 'react'
import Link from 'next/link'
import ProductCarousel from './ProductCarousel'

interface TabProduct {
  id: string
  nameAr: string
  price: number

  images: string[]
  stock: number
  category?: { nameAr: string; slug: string } | null
  season?: string
}

interface TabCategory {
  id: string
  nameAr: string
  slug: string
  _count: { products: number }
}

interface Props {
  products: TabProduct[]
  categories: TabCategory[]
  headingAr?: string
  headingEn?: string
}

export default function CategoryTabsSection({
  products,
  categories,
  headingAr = 'تسوقي حسب القسم',
}: Props) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null)

  const visible = activeSlug
    ? products.filter((p) => p.category?.slug === activeSlug)
    : products

  const activeCategory = categories.find((c) => c.slug === activeSlug)

  return (
    <section className="py-16 border-t border-gray-100" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-cairo font-bold text-gray-900 leading-tight">
              {headingAr}
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs text-gray-400 border-b border-gray-300 pb-0.5 hover:text-gray-900 hover:border-gray-900 transition-colors font-cairo shrink-0"
          >
            عرض الكل
          </Link>
        </div>

        {/* Tab row */}
        <div className="flex items-center gap-7 mb-10 overflow-x-auto no-scrollbar pb-1 border-b border-gray-100">
          <button
            onClick={() => setActiveSlug(null)}
            className={`shrink-0 text-sm font-cairo pb-3 -mb-px transition-all border-b-2 ${
              activeSlug === null
                ? 'text-brand-700 border-brand-500 font-semibold'
                : 'text-gray-400 border-transparent hover:text-gray-700'
            }`}
          >
            الكل
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveSlug(cat.slug)}
              className={`shrink-0 text-sm font-cairo pb-3 -mb-px transition-all border-b-2 ${
                activeSlug === cat.slug
                  ? 'text-brand-700 border-brand-500 font-semibold'
                  : 'text-gray-400 border-transparent hover:text-gray-700'
              }`}
            >
              {cat.nameAr}
            </button>
          ))}
        </div>

        <ProductCarousel products={visible} />

        <div className="text-center mt-10">
          <Link
            href={activeSlug ? `/products?category=${activeSlug}` : '/products'}
            className="inline-block border border-gray-900 text-gray-900 px-10 py-3 text-sm font-cairo hover:bg-gray-900 hover:text-white transition-colors duration-200"
          >
            {activeCategory ? `عرض ${activeCategory.nameAr} كاملة` : 'عرض جميع المنتجات'}
          </Link>
        </div>
      </div>
    </section>
  )
}
