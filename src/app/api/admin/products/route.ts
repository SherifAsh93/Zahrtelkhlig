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
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count(),
  ])
  return Response.json({ products, total })
}

export async function POST(req: NextRequest) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const product = await prisma.product.create({ data: body, include: { category: true } })
  return Response.json(product, { status: 201 })
}
