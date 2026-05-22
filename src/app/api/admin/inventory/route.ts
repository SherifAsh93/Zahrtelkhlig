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
  const season = searchParams.get('season') || undefined
  const search = searchParams.get('search') || undefined

  const where: Record<string, unknown> = { active: true }
  if (season) where.season = season
  if (search) {
    where.OR = [
      { nameAr: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ]
  }

  const products = await prisma.product.findMany({
    where,
    select: { id: true, nameAr: true, sku: true, season: true, sizes: true, sizeStock: true, stock: true, images: true, price: true },
    orderBy: [{ season: 'asc' }, { nameAr: 'asc' }],
  })
  return Response.json(products)
}

export async function PATCH(req: NextRequest) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { productId, size, qty } = await req.json()

  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) return Response.json({ error: 'Not found' }, { status: 404 })

  const currentStock = (product.sizeStock as Record<string, number> | null) ?? {}
  const updatedStock: Record<string, number> = { ...currentStock, [size]: Math.max(0, qty) }
  const totalStock = Object.values(updatedStock).reduce((a: number, b: number) => a + b, 0)

  await prisma.product.update({
    where: { id: productId },
    data: { sizeStock: updatedStock, stock: totalStock },
  })
  return Response.json({ sizeStock: updatedStock, stock: totalStock })
}
