import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function adminGuard() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return null
  return session
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const body = await req.json()
  const banner = await prisma.banner.update({ where: { id }, data: body })
  return Response.json(banner)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await prisma.banner.delete({ where: { id } })
  return Response.json({ success: true })
}
