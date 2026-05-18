import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return Response.json({ error: 'Forbidden' }, { status: 403 })

  const [totalOrders, totalRevenue, totalProducts, totalUsers, recentOrders, ordersByStatus] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.product.count({ where: { active: true } }),
      prisma.user.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { items: { take: 1 } },
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ])

  return Response.json({
    totalOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    totalProducts,
    totalUsers,
    recentOrders,
    ordersByStatus,
  })
}
