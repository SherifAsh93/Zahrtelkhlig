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
  const dateStr = searchParams.get('date')

  const targetDate = dateStr ? new Date(dateStr) : new Date()
  const dayStart = new Date(targetDate); dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(targetDate); dayEnd.setHours(23, 59, 59, 999)

  const [dailyOrders, inventory] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: dayStart, lte: dayEnd }, status: { not: 'CANCELLED' } },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findMany({
      where: { active: true },
      select: { id: true, nameAr: true, sku: true, season: true, variants: true, sizes: true, sizeStock: true, stock: true, price: true },
      orderBy: [{ season: 'asc' }, { nameAr: 'asc' }],
    }),
  ])

  const soldMap: Record<string, {
    nameAr: string; qty: number; revenue: number;
    variants: { label: string; qty: number }[]
  }> = {}

  for (const order of dailyOrders) {
    for (const item of order.items) {
      if (!soldMap[item.productId]) {
        soldMap[item.productId] = { nameAr: item.nameAr, qty: 0, revenue: 0, variants: [] }
      }
      soldMap[item.productId].qty += item.quantity
      soldMap[item.productId].revenue += item.price * item.quantity

      const label = [item.size ? `مقاس ${item.size}` : '', (item as { color?: string }).color || ''].filter(Boolean).join(' / ')
      if (label) {
        const existing = soldMap[item.productId].variants.find(v => v.label === label)
        if (existing) { existing.qty += item.quantity }
        else { soldMap[item.productId].variants.push({ label, qty: item.quantity }) }
      }
    }
  }

  const soldItems = Object.entries(soldMap)
    .map(([productId, data]) => ({ productId, ...data }))
    .sort((a, b) => b.qty - a.qty)

  const totalRevenue = dailyOrders.reduce((sum, o) => sum + o.total, 0)
  const totalOrders = dailyOrders.length
  const onlineOrders = dailyOrders.filter(o => o.source === 'ONLINE').length
  const posOrders = dailyOrders.filter(o => o.source === 'POS').length
  const onlineRevenue = dailyOrders.filter(o => o.source === 'ONLINE').reduce((s, o) => s + o.total, 0)
  const posRevenue = dailyOrders.filter(o => o.source === 'POS').reduce((s, o) => s + o.total, 0)

  return Response.json({
    date: targetDate.toISOString().split('T')[0],
    totalRevenue, totalOrders, onlineOrders, posOrders, onlineRevenue, posRevenue,
    soldItems, orders: dailyOrders, inventory,
  })
}
