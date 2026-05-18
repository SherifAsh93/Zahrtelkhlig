'use server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { generateOrderNumber, SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/lib/utils'

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

  const cart = JSON.parse(cartJson)
  if (!cart.length) return { error: 'السلة فارغة' }

  const subtotal = cart.reduce(
    (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
    0,
  )
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
      paymentMethod: (paymentMethod as 'CASH_ON_DELIVERY' | 'VODAFONE_CASH' | 'INSTAPAY') || 'CASH_ON_DELIVERY',
      subtotal,
      shipping,
      total,
      items: {
        create: cart.map((item: { productId: string; nameAr: string; nameEn: string; price: number; quantity: number; image: string }) => ({
          productId: item.productId,
          nameAr: item.nameAr,
          nameEn: item.nameEn,
          price: item.price,
          quantity: item.quantity,
          image: item.image || null,
        })),
      },
    },
  })

  redirect(`/orders/${order.id}?success=true`)
}
