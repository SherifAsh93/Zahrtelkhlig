import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'

async function adminGuard() {
  const session = await getAdminSession()
  if (!session) return null
  return session
}

interface Variant { size: string; color: string; qty: number }

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
    select: { id: true, nameAr: true, sku: true, season: true, variants: true, sizes: true, sizeStock: true, stock: true, images: true, price: true },
    orderBy: [{ season: 'asc' }, { nameAr: 'asc' }],
  })
  return Response.json(products)
}

export async function PATCH(req: NextRequest) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { productId, size, color, qty } = await req.json()

  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) return Response.json({ error: 'Not found' }, { status: 404 })

  const existing = (product.variants as Variant[] | null) ?? []
  let found = false
  const updatedVariants = existing.map(v => {
    if (v.size === size && v.color === color) { found = true; return { ...v, qty: Math.max(0, qty) } }
    return v
  })
  if (!found) updatedVariants.push({ size, color, qty: Math.max(0, qty) })

  const totalStock = updatedVariants.reduce((a, v) => a + v.qty, 0)
  const sizeStock: Record<string, number> = {}
  for (const v of updatedVariants) { sizeStock[v.size] = (sizeStock[v.size] || 0) + v.qty }

  await prisma.product.update({
    where: { id: productId },
    data: { variants: updatedVariants as unknown as object[], sizeStock, stock: totalStock },
  })
  return Response.json({ variants: updatedVariants, stock: totalStock })
}
