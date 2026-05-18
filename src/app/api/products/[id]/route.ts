import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id, active: true },
    include: { category: true },
  })
  if (!product) return Response.json({ error: 'Product not found' }, { status: 404 })
  return Response.json(product)
}
