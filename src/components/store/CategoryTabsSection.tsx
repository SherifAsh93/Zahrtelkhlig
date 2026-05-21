'use client'
import { useState } from 'react'
import Link from 'next/link'
import ProductCarousel from './ProductCarousel'

interface TabProduct {
  id: string
  nameAr: string
  price: number
  comparePrice?: number | null
  images: string[]
  stock: number
  category: { nameAr: string; slug: string }
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

export default function CategoryTabsSection({ products, categories, headingAr = 'تسوقي حسب القسم', headingEn = 'Shop by Category' }: Props) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null)

  const visible = activeSlug
    ? products.filter((p) => p.category.slug === activeSlug)
    : products

  const activeCategory = categories.find((c) => c.slug === activeSlug)

  return (
    <section className="py-16 border-t border-gray-100" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs text-gray-400 font-cairo mb-1">{headingAr}</p>
            <h2 className="text-3xl font-cormorant italic text-gray-900 leading-none">{headingEn}</h2>
          </div>
        </div>

        {/* Tab row */}
        <div className="flex items-center gap-7 mb-10 overflow-x-auto no-scrollbar pb-1 border-b border-gray-100">
          <button
            onClick={() => setActiveSlug(null)}
            className={`shrink-0 text-sm font-cairo pb-3 -mb-px transition-all border-b-2 ${
              activeSlug === null
                ? 'text-gray-900 border-gray-900 font-medium'
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
                  ? 'text-gray-900 border-gray-900 font-medium'
                  : 'text-gray-400 border-transparent hover:text-gray-700'
              }`}
            >
              {cat.nameAr}
            </button>
          ))}
        </div>

        {/* Product carousel */}
        <ProductCarousel products={visible} />

        {/* View all CTA */}
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
