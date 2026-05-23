import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: { select: { nameAr: true } } },
  })

  if (!product) return Response.json({ error: 'Not found' }, { status: 404 })

  const orderItems = await prisma.orderItem.findMany({
    where: { productId: id, order: { status: { not: 'CANCELLED' } } },
    select: { quantity: true, price: true, size: true },
  })

  const totalRevenue = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const totalSold = orderItems.reduce((acc, item) => acc + item.quantity, 0)
  const ordersCount = orderItems.length

  const sizeMap: Record<string, number> = {}
  for (const item of orderItems) {
    const sz = item.size ?? 'بدون مقاس'
    sizeMap[sz] = (sizeMap[sz] ?? 0) + item.quantity
  }
  const sizeSales = Object.entries(sizeMap)
    .map(([size, qty]) => ({ size, qty }))
    .sort((a, b) => b.qty - a.qty)

  return Response.json({ ...product, soldTotal: totalSold, revenueTotal: totalRevenue, ordersCount, sizeSales })
}
