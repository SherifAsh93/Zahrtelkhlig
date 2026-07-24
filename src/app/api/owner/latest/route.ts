import { prisma } from '@/lib/prisma'

export async function GET() {
  const latest = await prisma.order.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { id: true, createdAt: true },
  })
  return Response.json({ id: latest?.id ?? null, ts: latest?.createdAt ?? null })
}
