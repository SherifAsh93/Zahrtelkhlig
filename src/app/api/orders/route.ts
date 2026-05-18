import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('id')

  if (orderId) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: session.userId },
      include: { items: true },
    })
    if (!order) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json(order)
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: { items: { take: 1 } },
    orderBy: { createdAt: 'desc' },
  })
  return Response.json(orders)
}
