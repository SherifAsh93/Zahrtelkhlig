import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function adminGuard() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return null
  return session
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, user: true },
  })
  if (!order) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(order)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const { status } = await req.json()
  const order = await prisma.order.update({ where: { id }, data: { status } })
  return Response.json(order)
}
