import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function adminGuard() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return null
  return session
}

export async function GET() {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } })
  return Response.json(banners)
}

export async function POST(req: NextRequest) {
  if (!await adminGuard()) return Response.json({ error: 'Forbidden' }, { status: 403 })
  const body = await req.json()
  const banner = await prisma.banner.create({ data: body })
  return Response.json(banner, { status: 201 })
}
