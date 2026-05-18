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
  const product = await prisma.product.findUnique({ where: { id }, include: { category: true } })
  if (!product) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(product)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const body = await req.json()
  const product = await prisma.product.update({ where: { id }, data: body, include: { category: true } })
  return Response.json(product)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await prisma.product.delete({ where: { id } })
  return Response.json({ success: true })
}
