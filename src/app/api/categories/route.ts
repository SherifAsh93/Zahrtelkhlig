import { prisma } from '@/lib/prisma'

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: { where: { active: true } } } } },
    orderBy: { nameAr: 'asc' },
  })
  return Response.json(categories)
}
