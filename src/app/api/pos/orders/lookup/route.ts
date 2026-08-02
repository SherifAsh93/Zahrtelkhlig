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
  const orderNumber = (searchParams.get('orderNumber') || '').trim()
  if (!orderNumber) return Response.json({ error: 'رقم الفاتورة مطلوب' }, { status: 400 })

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, user: { select: { name: true } } },
  })
  if (!order) return Response.json({ error: 'لم يتم العثور على فاتورة بهذا الرقم' }, { status: 404 })

  const returnedGroups = await prisma.returnItem.groupBy({
    by: ['orderItemId'],
    where: { orderItemId: { in: order.items.map(i => i.id) } },
    _sum: { quantity: true },
  })
  const returnedMap = new Map(returnedGroups.map(g => [g.orderItemId, g._sum.quantity || 0]))

  return Response.json({
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    customerName: order.customerName,
    staffName: order.user?.name || null,
    source: order.source,
    paymentMethod: order.paymentMethod,
    subtotal: order.subtotal,
    discount: order.discount,
    total: order.total,
    items: order.items.map(item => {
      const alreadyReturned = returnedMap.get(item.id) || 0
      return {
        id: item.id,
        productId: item.productId,
        nameAr: item.nameAr,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: item.image,
        alreadyReturned,
        returnable: Math.max(0, item.quantity - alreadyReturned),
      }
    }),
  })
}
