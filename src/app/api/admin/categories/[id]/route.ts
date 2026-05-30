import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/session'

async function adminGuard() {
  const session = await getAdminSession()
  if (!session) return null
  return session
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const body = await req.json()
  const category = await prisma.category.update({ where: { id }, data: body })
  return Response.json(category)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await prisma.category.delete({ where: { id } })
  return Response.json({ success: true })
}
