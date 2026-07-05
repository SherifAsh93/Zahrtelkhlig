import { prisma } from '@/lib/prisma'

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: { where: { active: true } } } } },
    orderBy: [{ sortOrder: 'asc' }, { nameAr: 'asc' }],
  })
  return Response.json(categories, {
    headers: { 'Cache-Control': 's-maxage=120, stale-while-revalidate=300' },
  })
}
