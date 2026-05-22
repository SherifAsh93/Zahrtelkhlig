import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function adminGuard() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return null
  return session
}

interface CartItem {
  productId: string
  nameAr: string
  price: number
  quantity: number
  size?: string
  image?: string
}

export async function POST(req: NextRequest) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { items, customerName, notes, paymentMethod } = await req.json() as {
    items: CartItem[]
    customerName?: string
    notes?: string
    paymentMethod?: string
  }

  if (!items || items.length === 0) {
    return Response.json({ error: 'لا توجد منتجات' }, { status: 400 })
  }

  // Verify stock availability
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } })
    if (!product) return Response.json({ error: `المنتج غير موجود: ${item.nameAr}` }, { status: 400 })

    const sizeStock = product.sizeStock as Record<string, number> | null
    if (item.size && sizeStock) {
      const available = sizeStock[item.size] ?? 0
      if (available < item.quantity) {
        return Response.json({ error: `مخزون غير كافي: ${item.nameAr} مقاس ${item.size}` }, { status: 400 })
      }
    } else if (product.stock < item.quantity) {
      return Response.json({ error: `مخزون غير كافي: ${item.nameAr}` }, { status: 400 })
    }
  }

  // Generate order number
  const count = await prisma.order.count()
  const orderNumber = `POS-${String(count + 1).padStart(4, '0')}`

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)

  // Create order
  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName: customerName || 'عميل محل',
      customerPhone: '00000000000',
      address: 'المحل',
      city: 'دمياط',
      notes: notes || null,
      status: 'DELIVERED',
      source: 'POS',
      paymentMethod: (paymentMethod as 'CASH_ON_DELIVERY' | 'VODAFONE_CASH' | 'INSTAPAY' | 'BANK_TRANSFER') || 'CASH_ON_DELIVERY',
      subtotal,
      shipping: 0,
      total: subtotal,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          nameAr: item.nameAr,
          nameEn: item.nameAr,
          price: item.price,
          quantity: item.quantity,
          size: item.size || null,
          image: item.image || null,
        })),
      },
    },
  })

  // Reduce stock for each item
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } })
    if (!product) continue

    const sizeStock = product.sizeStock as Record<string, number> | null
    if (item.size && sizeStock) {
      const updatedSizeStock = { ...sizeStock, [item.size]: Math.max(0, (sizeStock[item.size] ?? 0) - item.quantity) }
      const newTotal = Object.values(updatedSizeStock).reduce((a, b) => a + b, 0)
      await prisma.product.update({
        where: { id: item.productId },
        data: { sizeStock: updatedSizeStock, stock: newTotal },
      })
    } else {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }
  }

  return Response.json({ success: true, orderNumber: order.orderNumber, orderId: order.id })
}
