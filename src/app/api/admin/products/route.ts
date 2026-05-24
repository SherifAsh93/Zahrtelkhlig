import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function adminGuard() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return null
  return session
}

export async function GET(req: NextRequest) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const category = searchParams.get('category') || undefined
  const season = searchParams.get('season') || undefined
  const search = searchParams.get('search') || undefined

  const where: Record<string, unknown> = {}
  if (category) where.category = { slug: category }
  if (season) where.season = season
  if (search) {
    where.OR = [
      { nameAr: { contains: search, mode: 'insensitive' } },
      { nameEn: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])
  return Response.json({ products, total })
}

export async function POST(req: NextRequest) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  if (Array.isArray(body.variants)) {
    body.stock = (body.variants as { qty: number }[]).reduce((a, v) => a + v.qty, 0)
  } else if (body.sizeStock && typeof body.sizeStock === 'object') {
    body.stock = Object.values(body.sizeStock as Record<string, number>).reduce((a: number, b: number) => a + b, 0)
  }
  if (!body.categoryId) delete body.categoryId
  const product = await prisma.product.create({ data: body })
  return Response.json(product, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { ids } = await req.json() as { ids: string[] }
  if (!Array.isArray(ids) || ids.length === 0)
    return Response.json({ error: 'ids required' }, { status: 400 })
  const { count } = await prisma.product.deleteMany({ where: { id: { in: ids } } })
  return Response.json({ deleted: count })
}
