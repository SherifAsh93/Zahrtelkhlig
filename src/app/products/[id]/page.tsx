import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import ProductDetailClient from './ProductDetailClient'
import ProductCard from '@/components/store/ProductCard'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id, active: true },
    include: { category: true },
  })
  if (!product) notFound()

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, active: true, id: { not: id } },
    include: { category: true },
    take: 4,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 font-cairo mb-6">
        <Link href="/" className="hover:text-rose-600">الرئيسية</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-rose-600">المنتجات</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-rose-600">
          {product.category.nameAr}
        </Link>
        <span>/</span>
        <span className="text-gray-900">{product.nameAr}</span>
      </nav>

      <ProductDetailClient product={product} />

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-gray-900 font-cairo mb-6">منتجات مشابهة</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
