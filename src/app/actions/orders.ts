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
    data: cart.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      nameAr: item.nameAr,
      nameEn: item.nameEn,
      price: item.price,
      quantity: item.quantity,
      size: item.size || null,
      color: item.color || null,
      image: item.image || null,
    })),
  })

  // Reduce stock per variant (color + size) for each item
  for (const item of cart) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } })
    if (!product) continue

    const variants = product.variants as Variant[] | null

    if (item.size && item.color && variants && variants.length > 0) {
      // Reduce the specific color+size variant
      const updatedVariants = variants.map(v =>
        v.size === item.size && v.color === item.color
          ? { ...v, qty: Math.max(0, v.qty - item.quantity) }
          : v
      )
      const newTotal = updatedVariants.reduce((sum, v) => sum + v.qty, 0)
      const sizeStock: Record<string, number> = {}
      for (const v of updatedVariants) {
        sizeStock[v.size] = (sizeStock[v.size] || 0) + v.qty
      }
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          variants: updatedVariants as unknown as object[],
          sizeStock,
          stock: newTotal,
        },
      })
    } else {
      // Fallback: reduce total stock (no variants)
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: Math.max(0, product.stock - item.quantity) },
      })
    }
  }

  redirect(`/orders/${order.id}?success=true`)
}
