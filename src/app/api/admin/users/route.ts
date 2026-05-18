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
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, name: true, email: true, phone: true, city: true, role: true, createdAt: true, _count: { select: { orders: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count(),
  ])
  return Response.json({ users, total })
}
