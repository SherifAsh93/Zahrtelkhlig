import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function posGuard() {
  const session = await getSession()
  if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) return null
  return session
}

interface Variant { size: string; color: string; qty: number }

interface CartItem {
  productId: string
  nameAr: string
  price: number
  quantity: number
  size?: string
  color?: string
  image?: string
}

export async function POST(req: NextRequest) {
  const session = await posGuard()
  if (!session) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { items, customerName, notes, paymentMethod, discount: rawDiscount } = await req.json() as {
    items: CartItem[]
    customerName?: string
    notes?: string
    paymentMethod?: string
    discount?: number
  }

  if (!items || items.length === 0) {
    return Response.json({ error: 'لا توجد منتجات' }, { status: 400 })
  }

  // Verify stock availability
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } })
    if (!product) return Response.json({ error: `المنتج غير موجود: ${item.nameAr}` }, { status: 400 })

    const variants = product.variants as Variant[] | null
    if (item.size && item.color && variants) {
      const variant = variants.find(v => v.size === item.size && v.color === item.color)
      const available = variant?.qty ?? 0
      if (available < item.quantity) {
        return Response.json({ error: `مخزون غير كافي: ${item.nameAr} مقاس ${item.size} / ${item.color}` }, { status: 400 })
      }
    } else if (item.size && variants) {
      const total = variants.filter(v => v.size === item.size).reduce((a, v) => a + v.qty, 0)
      if (total < item.quantity) {
        return Response.json({ error: `مخزون غير كافي: ${item.nameAr} مقاس ${item.size}` }, { status: 400 })
      }
    } else if (product.stock < item.quantity) {
      return Response.json({ error: `مخزون غير كافي: ${item.nameAr}` }, { status: 400 })
    }
  }

  const count = await prisma.order.count()
  const orderNumber = `POS-${String(count + 1).padStart(4, '0')}`
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const discount = Math.max(0, Math.min(Number(rawDiscount) || 0, subtotal))
  const total = subtotal - discount

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: session.userId,
      customerName: customerName || 'عميل محل',
      customerPhone: '00000000000',
      address: 'المحل',
      city: 'دمياط',
      notes: notes || null,
      status: 'DELIVERED',
      source: 'POS',
      paymentMethod: (paymentMethod as 'CASH_ON_DELIVERY' | 'VODAFONE_CASH' | 'INSTAPAY' | 'BANK_TRANSFER') || 'CASH_ON_DELIVERY',
      subtotal,
      discount,
      shipping: 0,
      total,
    },
  })

  await prisma.orderItem.createMany({
    data: items.map(item => ({
      orderId: order.id,
      productId: item.productId,
      nameAr: item.nameAr,
      nameEn: item.nameAr,
      price: item.price,
      quantity: item.quantity,
      size: item.size || null,
      color: item.color || null,
      image: item.image || null,
    })),
  })

  // Reduce stock for each item
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } })
    if (!product) continue

    const variants = product.variants as Variant[] | null
    if (item.size && item.color && variants) {
      const updatedVariants = variants.map(v =>
        v.size === item.size && v.color === item.color
          ? { ...v, qty: Math.max(0, v.qty - item.quantity) }
          : v
      )
      const newTotal = updatedVariants.reduce((a, v) => a + v.qty, 0)
      const sizeStock: Record<string, number> = {}
      for (const v of updatedVariants) { sizeStock[v.size] = (sizeStock[v.size] || 0) + v.qty }
      await prisma.product.update({
        where: { id: item.productId },
        data: { variants: updatedVariants as unknown as object[], sizeStock, stock: newTotal },
      })
    } else {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }
  }

  return Response.json({ success: true, orderNumber: order.orderNumber, orderId: order.id, discount, total })
}
