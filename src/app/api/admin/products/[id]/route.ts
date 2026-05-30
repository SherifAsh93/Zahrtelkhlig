import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'

async function adminGuard() {
  const session = await getAdminSession()
  if (!session) return null
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
  if (Array.isArray(body.variants)) {
    body.stock = (body.variants as { qty: number }[]).reduce((a, v) => a + v.qty, 0)
  } else if (body.sizeStock && typeof body.sizeStock === 'object') {
    body.stock = Object.values(body.sizeStock as Record<string, number>).reduce((a: number, b: number) => a + b, 0)
  }
  if (!body.categoryId) delete body.categoryId
  const product = await prisma.product.update({ where: { id }, data: body })
  return Response.json(product)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await prisma.product.delete({ where: { id } })
  return Response.json({ success: true })
}
