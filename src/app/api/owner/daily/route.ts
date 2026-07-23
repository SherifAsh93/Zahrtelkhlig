import { prisma } from '@/lib/prisma'

export async function GET() {
  const now = new Date()
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999)

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: todayStart, lte: todayEnd },
      status: { not: 'CANCELLED' },
    },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      source: true,
      paymentMethod: true,
      subtotal: true,
      discount: true,
      shipping: true,
      total: true,
      notes: true,
      createdAt: true,
      user: { select: { name: true, role: true } },
      items: {
        select: {
          nameAr: true,
          price: true,
          quantity: true,
          size: true,
          color: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0)
  const totalDiscount = orders.reduce((s, o) => s + (o.discount ?? 0), 0)
  const posOrders = orders.filter(o => o.source === 'POS')
  const onlineOrders = orders.filter(o => o.source === 'ONLINE')

  // Staff breakdown for today
  const staffMap: Record<string, { name: string; orders: number; revenue: number }> = {}
  for (const o of posOrders) {
    const name = o.user?.name ?? 'غير محدد'
    if (!staffMap[name]) staffMap[name] = { name, orders: 0, revenue: 0 }
    staffMap[name].orders++
    staffMap[name].revenue += o.total
  }

  return Response.json({
    date: now.toISOString(),
    summary: {
      totalRevenue,
      totalOrders: orders.length,
      totalDiscount,
      pos: {
        revenue: posOrders.reduce((s, o) => s + o.total, 0),
        orders: posOrders.length,
      },
      online: {
        revenue: onlineOrders.reduce((s, o) => s + o.total, 0),
        orders: onlineOrders.length,
      },
      staffBreakdown: Object.values(staffMap),
    },
    orders: orders.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      source: o.source,
      paymentMethod: o.paymentMethod,
      subtotal: o.subtotal,
      discount: o.discount ?? 0,
      shipping: o.shipping,
      total: o.total,
      notes: o.notes,
      createdAt: o.createdAt,
      staffName: o.user?.name ?? null,
      items: o.items,
    })),
  })
}
