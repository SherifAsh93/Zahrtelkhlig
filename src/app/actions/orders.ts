'use server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { generateOrderNumber, SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/lib/utils'

interface Variant { size: string; color: string; qty: number }

interface CartItem {
  productId: string
  nameAr: string
  nameEn: string
  price: number
  quantity: number
  image?: string
  size?: string
  color?: string
}

export async function createOrder(_: unknown, formData: FormData) {
  const session = await getSession()

  const customerName = formData.get('customerName') as string
  const customerEmail = formData.get('customerEmail') as string
  const customerPhone = formData.get('customerPhone') as string
  const address = formData.get('address') as string
  const city = formData.get('city') as string
  const notes = formData.get('notes') as string
  const paymentMethod = formData.get('paymentMethod') as string
  const cartJson = formData.get('cart') as string

  if (!cartJson) return { error: 'السلة فارغة' }
  const cart: CartItem[] = JSON.parse(cartJson)
  if (!cart.length) return { error: 'السلة فارغة' }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const total = subtotal + shipping

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: session?.userId ?? null,
      customerName,
      customerEmail: customerEmail || null,
      customerPhone,
      address,
      city,
      notes: notes || null,
      paymentMethod: (paymentMethod as 'CASH_ON_DELIVERY' | 'VODAFONE_CASH' | 'INSTAPAY' | 'BANK_TRANSFER') || 'CASH_ON_DELIVERY',
      subtotal,
      shipping,
      total,
    },
  })

  await prisma.orderItem.createMany({
    data: cart.map(item => ({
      orderId: order.id,
      productId: item.productId,
      nameAr: item.nameAr,
      nameEn: item.nameEn,
      price: item.price,
      quantity: item.quantity,
      size: item.size || null,
      color: null,
      image: item.image || null,
    })),
  })

  // Reduce stock per ordered size using sizeStock as source of truth
  for (const item of cart) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } })
    if (!product) continue

    const sizeStockMap = (product.sizeStock ?? {}) as Record<string, number>
    const hasSizeStock = Object.keys(sizeStockMap).length > 0

    if (item.size && hasSizeStock) {
      // Deduct from sizeStock
      const currentQty = sizeStockMap[item.size] ?? 0
      const newSizeStock = {
        ...sizeStockMap,
        [item.size]: Math.max(0, currentQty - item.quantity),
      }
      const newTotal = Object.values(newSizeStock).reduce((sum, qty) => sum + qty, 0)

      // Keep variants in sync: deduct from color variants of this size FIFO
      const variants = (product.variants ?? []) as unknown as Variant[]
      let remaining = item.quantity
      const updatedVariants = variants.map(v => {
        if (v.size === item.size && remaining > 0 && v.qty > 0) {
          const deduct = Math.min(v.qty, remaining)
          remaining -= deduct
          return { ...v, qty: v.qty - deduct }
        }
        return v
      })

      await prisma.product.update({
        where: { id: item.productId },
        data: {
          sizeStock: newSizeStock,
          variants: updatedVariants as unknown as object[],
          stock: newTotal,
        },
      })
    } else {
      // No size tracking — deduct from total stock
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: Math.max(0, product.stock - item.quantity) },
      })
    }
  }

  redirect(`/orders/${order.id}?success=true`)
}
