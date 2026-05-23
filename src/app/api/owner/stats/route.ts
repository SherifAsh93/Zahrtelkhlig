import { prisma } from '@/lib/prisma'

export async function GET() {

  const now = new Date()
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999)

  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - 6); weekStart.setHours(0, 0, 0, 0)

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)

  // Last 30 days for trend chart
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 29); thirtyDaysAgo.setHours(0, 0, 0, 0)

  const [
    todayOrders,
    weekOrders,
    monthOrders,
    prevMonthOrders,
    allOrders,
    topProducts,
    lowStockProducts,
    trendOrders,
    totalCustomers,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { createdAt: { gte: todayStart, lte: todayEnd }, status: { not: 'CANCELLED' } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: weekStart, lte: todayEnd }, status: { not: 'CANCELLED' } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: monthStart }, status: { not: 'CANCELLED' } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: prevMonthStart, lte: prevMonthEnd }, status: { not: 'CANCELLED' } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { status: { not: 'CANCELLED' } },
      _sum: { total: true },
      _count: true,
    }),
    // Top products by quantity sold
    prisma.orderItem.groupBy({
      by: ['productId', 'nameAr', 'image'],
      _sum: { quantity: true },
      _count: true,
      orderBy: { _sum: { quantity: 'desc' } },
      take: 8,
    }),
    // Low stock (stock < 10 and active)
    prisma.product.findMany({
      where: { active: true, stock: { lt: 10 } },
      select: { id: true, nameAr: true, sku: true, stock: true, season: true },
      orderBy: { stock: 'asc' },
      take: 10,
    }),
    // Orders per day last 30 days
    prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo }, status: { not: 'CANCELLED' } },
      select: { createdAt: true, total: true, source: true },
    }),
    prisma.user.count({ where: { role: 'USER' } }),
  ])

  // Online vs POS breakdown for this month
  const [onlineMonth, posMonth] = await Promise.all([
    prisma.order.aggregate({
      where: { createdAt: { gte: monthStart }, status: { not: 'CANCELLED' }, source: 'ONLINE' },
      _sum: { total: true },
      _count: true,
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: monthStart }, status: { not: 'CANCELLED' }, source: 'POS' },
      _sum: { total: true },
      _count: true,
    }),
  ])


  // Build daily trend map
  const trendMap: Record<string, { revenue: number; online: number; pos: number }> = {}
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo)
    d.setDate(thirtyDaysAgo.getDate() + i)
    const key = d.toISOString().split('T')[0]
    trendMap[key] = { revenue: 0, online: 0, pos: 0 }
  }
  for (const order of trendOrders) {
    const key = order.createdAt.toISOString().split('T')[0]
    if (trendMap[key]) {
      trendMap[key].revenue += order.total
      if (order.source === 'ONLINE') trendMap[key].online += order.total
      else trendMap[key].pos += order.total
    }
  }

  const monthGrowth = prevMonthOrders._sum.total
    ? ((monthOrders._sum.total ?? 0) - (prevMonthOrders._sum.total ?? 0)) / (prevMonthOrders._sum.total ?? 1) * 100
    : null

  return Response.json({
    today: { revenue: todayOrders._sum.total ?? 0, orders: todayOrders._count },
    week: { revenue: weekOrders._sum.total ?? 0, orders: weekOrders._count },
    month: {
      revenue: monthOrders._sum.total ?? 0,
      orders: monthOrders._count,
      growth: monthGrowth,
      online: { revenue: onlineMonth._sum.total ?? 0, orders: onlineMonth._count },
      pos: { revenue: posMonth._sum.total ?? 0, orders: posMonth._count },
    },
    total: { revenue: allOrders._sum.total ?? 0, orders: allOrders._count },
    topProducts,
    lowStock: lowStockProducts,
    trend: Object.entries(trendMap).map(([date, data]) => ({ date, ...data })),
    totalCustomers,
  })
}
