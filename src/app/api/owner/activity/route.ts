import { prisma } from '@/lib/prisma'

export async function GET() {
  const [recentOrders, recentUsers, lowStock] = await Promise.all([
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        city: true,
        total: true,
        status: true,
        source: true,
        createdAt: true,
      },
    }),
    prisma.user.findMany({
      take: 5,
      where: { role: 'USER' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    prisma.product.findMany({
      where: { active: true, stock: { lte: 5 } },
      orderBy: { stock: 'asc' },
      take: 10,
      select: { id: true, nameAr: true, stock: true, sku: true },
    }),
  ])

  type ActivityItem = {
    id: string
    type: 'order' | 'user' | 'stock'
    title: string
    subtitle: string
    time: Date
    urgent: boolean
  }

  const items: ActivityItem[] = [
    ...recentOrders.map(o => ({
      id: `order-${o.id}`,
      type: 'order' as const,
      title: `طلب #${o.orderNumber} — ${o.customerName}`,
      subtitle: `${o.city} · ${o.source === 'POS' ? 'محل' : 'موقع'} · ${o.status === 'PENDING' ? 'في الانتظار' : o.status === 'CONFIRMED' ? 'مؤكد' : o.status === 'SHIPPED' ? 'تم الشحن' : o.status === 'DELIVERED' ? 'مُسلَّم' : 'ملغي'}`,
      time: o.createdAt,
      urgent: o.status === 'PENDING',
    })),
    ...recentUsers.map(u => ({
      id: `user-${u.id}`,
      type: 'user' as const,
      title: `عميل جديد: ${u.name || u.email}`,
      subtitle: u.email,
      time: u.createdAt,
      urgent: false,
    })),
    ...lowStock.map(p => ({
      id: `stock-${p.id}`,
      type: 'stock' as const,
      title: `مخزون منخفض: ${p.nameAr}`,
      subtitle: p.stock === 0 ? 'نفد المخزون' : `باقي ${p.stock} قطعة فقط`,
      time: new Date(),
      urgent: p.stock === 0,
    })),
  ]

  items.sort((a, b) => {
    if (a.type === 'stock' && b.type !== 'stock') return 1
    if (b.type === 'stock' && a.type !== 'stock') return -1
    return new Date(b.time).getTime() - new Date(a.time).getTime()
  })

  return Response.json({ items: items.slice(0, 15) })
}
