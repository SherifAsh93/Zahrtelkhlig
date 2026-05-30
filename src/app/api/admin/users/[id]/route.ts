import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

async function adminGuard() {
  const session = await getAdminSession()
  if (!session) return null
  return session
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params

  const [user, orders, spent] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, username: true, phone: true, address: true, city: true, role: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { userId: id },
      select: { id: true, orderNumber: true, total: true, status: true, source: true, createdAt: true, items: { select: { nameAr: true, quantity: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.aggregate({
      where: { userId: id, status: { not: 'CANCELLED' } },
      _sum: { total: true },
    }),
  ])

  if (!user) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json({ user, orders, totalSpent: spent._sum.total ?? 0 })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const body = await req.json()
  const { name, phone, address, city, role, password } = body

  const updateData: Record<string, unknown> = {
    name: name || undefined,
    phone: phone || null,
    address: address || null,
    city: city || null,
    role: role || undefined,
  }

  if (password && password.length >= 6) {
    updateData.password = await bcrypt.hash(password, 12)
  }

  try {
    const user = await prisma.user.update({ where: { id }, data: updateData })
    return Response.json({ success: true, user })
  } catch {
    return Response.json({ error: 'فشل التحديث' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params

  try {
    await prisma.order.updateMany({ where: { userId: id }, data: { userId: null } })
    await prisma.cartItem.deleteMany({ where: { userId: id } })
    await prisma.wishlist.deleteMany({ where: { userId: id } })
    await prisma.user.delete({ where: { id } })
    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'فشل الحذف' }, { status: 500 })
  }
}
