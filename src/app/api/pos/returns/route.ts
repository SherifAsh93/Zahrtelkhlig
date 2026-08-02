import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function posGuard() {
  const session = await getSession()
  if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) return null
  return session
}

function isUniqueConstraintError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code?: string }).code === 'P2002'
}

interface Variant { size: string; color: string; qty: number }

interface ReturnRequestLine { orderItemId: string; quantity: number }

export async function POST(req: NextRequest) {
  const session = await posGuard()
  if (!session) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { orderId, items, reason, refundMethod } = await req.json() as {
    orderId: string
    items: ReturnRequestLine[]
    reason?: string
    refundMethod?: string
  }

  if (!orderId || !items || items.length === 0) {
    return Response.json({ error: 'اختر المنتجات المطلوب استرجاعها' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } })
  if (!order) return Response.json({ error: 'الفاتورة غير موجودة' }, { status: 404 })

  const orderItemIds = order.items.map(i => i.id)
  const returnedGroups = await prisma.returnItem.groupBy({
    by: ['orderItemId'],
    where: { orderItemId: { in: orderItemIds } },
    _sum: { quantity: true },
  })
  const returnedMap = new Map(returnedGroups.map(g => [g.orderItemId, g._sum.quantity || 0]))

  const toProcess: { orderItem: (typeof order.items)[number]; quantity: number }[] = []
  for (const line of items) {
    if (!line.quantity || line.quantity <= 0) continue
    const orderItem = order.items.find(i => i.id === line.orderItemId)
    if (!orderItem) return Response.json({ error: 'صنف غير موجود في هذه الفاتورة' }, { status: 400 })
    const alreadyReturned = returnedMap.get(orderItem.id) || 0
    const returnable = orderItem.quantity - alreadyReturned
    if (line.quantity > returnable) {
      return Response.json({ error: `الكمية المطلوب استرجاعها من "${orderItem.nameAr}" أكبر من المتاح (${returnable})` }, { status: 400 })
    }
    toProcess.push({ orderItem, quantity: line.quantity })
  }

  if (toProcess.length === 0) {
    return Response.json({ error: 'لم يتم اختيار كميات صحيحة للاسترجاع' }, { status: 400 })
  }

  const refundAmount = toProcess.reduce((s, { orderItem, quantity }) => s + orderItem.price * quantity, 0)

  // returnNumber is derived from a count-then-format, which races under concurrent
  // returns. Retry with a fresh count on a unique-constraint collision.
  let ret
  const MAX_ATTEMPTS = 5
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const count = await prisma.saleReturn.count()
    const returnNumber = `RET-${String(count + 1 + attempt).padStart(4, '0')}`
    try {
      ret = await prisma.saleReturn.create({
        data: {
          returnNumber,
          orderId: order.id,
          orderNumber: order.orderNumber,
          staffName: session.name,
          reason: reason || null,
          refundMethod: (refundMethod as 'CASH_ON_DELIVERY' | 'VODAFONE_CASH' | 'INSTAPAY' | 'BANK_TRANSFER') || order.paymentMethod,
          subtotal: refundAmount,
        },
      })
      break
    } catch (err) {
      if (!isUniqueConstraintError(err) || attempt === MAX_ATTEMPTS - 1) throw err
    }
  }
  if (!ret) return Response.json({ error: 'تعذر إنشاء رقم مرتجع، حاول مرة أخرى' }, { status: 500 })

  await prisma.returnItem.createMany({
    data: toProcess.map(({ orderItem, quantity }) => ({
      returnId: ret.id,
      orderItemId: orderItem.id,
      productId: orderItem.productId,
      nameAr: orderItem.nameAr,
      price: orderItem.price,
      quantity,
      size: orderItem.size,
      color: orderItem.color,
    })),
  })

  await prisma.order.update({
    where: { id: order.id },
    data: {
      total: Math.max(0, order.total - refundAmount),
      subtotal: Math.max(0, order.subtotal - refundAmount),
    },
  })

  // Restock inventory — mirrors /api/pos/sale's decrement logic in reverse
  for (const { orderItem, quantity } of toProcess) {
    const product = await prisma.product.findUnique({ where: { id: orderItem.productId } })
    if (!product) continue

    const variants = product.variants as Variant[] | null
    if (orderItem.size && orderItem.color && variants) {
      const updatedVariants = variants.map(v =>
        v.size === orderItem.size && v.color === orderItem.color
          ? { ...v, qty: v.qty + quantity }
          : v
      )
      const newTotal = updatedVariants.reduce((a, v) => a + v.qty, 0)
      const sizeStock: Record<string, number> = {}
      for (const v of updatedVariants) { sizeStock[v.size] = (sizeStock[v.size] || 0) + v.qty }
      await prisma.product.update({
        where: { id: orderItem.productId },
        data: { variants: updatedVariants as unknown as object[], sizeStock, stock: newTotal },
      })
    } else {
      await prisma.product.update({
        where: { id: orderItem.productId },
        data: { stock: { increment: quantity } },
      })
    }
  }

  return Response.json({ success: true, returnNumber: ret.returnNumber, refundAmount })
}
