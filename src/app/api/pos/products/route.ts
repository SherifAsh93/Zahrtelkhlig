import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function posGuard() {
  const session = await getSession()
  if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) return null
  return session
}

export async function GET(req: NextRequest) {
  if (!await posGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const season = searchParams.get('season') || undefined

  const where: Record<string, unknown> = { active: true, stock: { gt: 0 } }
  if (season) where.season = season
  if (q) {
    where.OR = [
      { nameAr: { contains: q, mode: 'insensitive' } },
      { nameEn: { contains: q, mode: 'insensitive' } },
      { sku: { equals: q } },
    ]
  }

  const products = await prisma.product.findMany({
    where,
    select: { id: true, nameAr: true, sku: true, season: true, price: true, variants: true, sizes: true, sizeStock: true, stock: true, images: true },
    orderBy: [{ season: 'asc' }, { nameAr: 'asc' }],
    take: 40,
  })
  return Response.json(products)
}
