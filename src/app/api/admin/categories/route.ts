import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function adminGuard() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return null
  return session
}

export async function GET() {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { nameAr: 'asc' },
  })
  return Response.json(categories)
}

export async function POST(req: NextRequest) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const category = await prisma.category.create({ data: body })
  return Response.json(category, { status: 201 })
}
