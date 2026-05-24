import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PRODUCT_IMAGES } from './images'

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('token') !== '114891zahr2024') {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const deleted = await prisma.product.deleteMany({})

  const BATCH = 50
  let inserted = 0
  for (let i = 0; i < PRODUCT_IMAGES.length; i += BATCH) {
    const batch = PRODUCT_IMAGES.slice(i, i + BATCH)
    await prisma.product.createMany({
      data: batch.map((url) => ({
        nameAr: 'منتج',
        nameEn: 'Product',
        descriptionAr: '',
        descriptionEn: '',
        price: 0,
        images: [url],
        active: false,
        featured: false,
      })),
    })
    inserted += batch.length
  }

  return Response.json({ deleted: deleted.count, inserted })
}
