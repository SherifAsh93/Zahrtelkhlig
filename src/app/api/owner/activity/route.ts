import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'

function statusLabel(s: string) {
  const map: Record<string, string> = {
    PENDING: 'في الانتظار',
    CONFIRMED: 'مؤكد',
    SHIPPED: 'تم الشحن',
    DELIVERED: 'مُسلَّم',
    CANCELLED: 'ملغي',
  }
  return map[s] ?? s
}

export async function GET() {
  const [recentOrders, recentUsers] = await Promise.all([
    prisma.order.findMany({
      take: 12,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        status: true,
        source: true,
        paymentMethod: true,
        createdAt: true,
      },
    }),
    prisma.user.findMany({
      take: 5,
      where: { role: 'USER' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, createdAt: true },
    }),
  ])

  type ActivityItem = {
    id: string
    type: 'order' | 'user'
    buyer: string | null
    title: string
    subtitle: string
    time: Date
    urgent: boolean
  }

  const payLabel = (p: string | null) => {
    if (!p) return ''
    const map: Record<string, string> = { CASH: 'كاش', VODAFONE: 'فودافون', INSTAPAY: 'انستاباي', BANK: 'بنك', CARD: 'بطاقة' }
    return map[p] ?? p
  }

  const items: ActivityItem[] = [
    ...recentOrders.map(o => ({
      id: `order-${o.id}`,
      type: 'order' as const,
      buyer: o.customerName || null,
      title: o.customerName ? o.customerName : `طلب #${o.orderNumber}`,
      subtitle: `#${o.orderNumber} · ${o.source === 'POS' ? 'محل' : 'موقع'} · ${formatPrice(o.total)}${payLabel(o.paymentMethod) ? ' · ' + payLabel(o.paymentMethod) : ''} · ${statusLabel(o.status)}`,
      time: o.createdAt,
      urgent: o.status === 'PENDING' && o.source === 'ONLINE',
    })),
    ...recentUsers.map(u => ({
      id: `user-${u.id}`,
      type: 'user' as const,
      buyer: null,
      title: u.name || u.email,
      subtitle: `عميل جديد · ${u.email}`,
      time: u.createdAt,
      urgent: false,
    })),
  ]

  items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

  return Response.json({ items: items.slice(0, 15) })
}
