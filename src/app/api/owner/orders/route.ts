import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') ?? 'today'

  const now = new Date()
  let gte: Date | undefined

  if (period === 'today') {
    gte = new Date(now)
    gte.setHours(0, 0, 0, 0)
  } else if (period === 'week') {
    gte = new Date(now)
    gte.setDate(now.getDate() - 6)
    gte.setHours(0, 0, 0, 0)
  } else if (period === 'month') {
    gte = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const where = gte ? { createdAt: { gte } } : {}

  const orders = await prisma.order.findMany({
    where,
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      customerPhone: true,
      city: true,
      total: true,
      status: true,
      paymentMethod: true,
      source: true,
      createdAt: true,
      items: { select: { quantity: true, nameAr: true, image: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json(
    orders.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      city: o.city,
      total: o.total,
      status: o.status,
      paymentMethod: o.paymentMethod,
      source: o.source,
      createdAt: o.createdAt,
      itemsCount: o.items.reduce((acc, i) => acc + i.quantity, 0),
      firstImage: o.items[0]?.image ?? null,
    }))
  )
}
