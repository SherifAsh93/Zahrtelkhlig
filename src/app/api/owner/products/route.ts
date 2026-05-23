import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const season = searchParams.get('season') as 'WINTER' | 'SUMMER' | null
  const stock = searchParams.get('stock') // 'low' | 'out' | null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { active: true }
  if (search) {
    where.OR = [
      { nameAr: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (season) where.season = season
  if (stock === 'out') where.stock = 0
  else if (stock === 'low') where.stock = { gt: 0, lt: 10 }

  const products = await prisma.product.findMany({
    where,
    select: {
      id: true,
      nameAr: true,
      sku: true,
      price: true,
      comparePrice: true,
      season: true,
      stock: true,
      images: true,
      sizes: true,
      sizeStock: true,
      variants: true,
      featured: true,
      category: { select: { nameAr: true } },
    },
    orderBy: { nameAr: 'asc' },
  })

  return Response.json(products)
}
