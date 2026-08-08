import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function posGuard() {
  const session = await getSession()
  if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) return null
  return session
}

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await posGuard()
  if (!session) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params

  // Atomic conditional update: only the first caller to claim an order as
  // printed succeeds, so a slow/failed print never gets falsely marked done
  // and two racing printer stations don't both think they own the print job.
  const result = await prisma.order.updateMany({
    where: { id, printedAt: null },
    data: { printedAt: new Date() },
  })

  return Response.json({ claimed: result.count === 1 })
}
