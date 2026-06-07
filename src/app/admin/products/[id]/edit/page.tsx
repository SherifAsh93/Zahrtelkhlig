import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProductForm from '@/components/admin/ProductForm'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) notFound()

  return (
    <div dir="rtl">
      <h1 className="text-2xl font-bold text-gray-900 font-cairo mb-8">تعديل المنتج</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <ProductForm product={{
          id: product.id,
          nameAr: product.nameAr,
          nameEn: product.nameEn,
          descriptionAr: product.descriptionAr,
          descriptionEn: product.descriptionEn,
          sku: product.sku ?? undefined,
          price: product.price,

          season: product.season as 'WINTER' | 'SUMMER',
          variants: (product.variants as { size: string; color: string; qty: number }[]) ?? [],
          stock: product.stock,
          images: product.images,
        }} />
      </div>
    </div>
  )
}
