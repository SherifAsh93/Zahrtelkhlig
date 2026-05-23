import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, stock: true, sizeStock: true, images: true, active: true },
          },
        },
      },
    },
  })

  if (!order) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(order)
}
