import { prisma } from '@/lib/prisma'

export async function GET() {
  const banners = await prisma.banner.findMany({
    where: { active: true },
    orderBy: { sortOrder: 'asc' },
  })
  return Response.json(banners, {
    headers: { 'Cache-Control': 's-maxage=120, stale-while-revalidate=300' },
  })
}
