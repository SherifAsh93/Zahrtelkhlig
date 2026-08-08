import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function posGuard() {
  const session = await getSession()
  if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) return null
  return session
}

export async function GET() {
  const session = await posGuard()
  if (!session) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const orders = await prisma.order.findMany({
    where: { source: 'POS', printedAt: null },
    include: { items: true },
    orderBy: { createdAt: 'asc' },
    take: 20,
  })

  return Response.json({ orders })
}
