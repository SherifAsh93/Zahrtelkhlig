import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const CDN = 'https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/products'

const updates = [
  { slug: 'eid',      image: `${CDN}/p01.jpg` },
  { slug: 'summer',   image: `${CDN}/p12.jpg` },
  { slug: 'cardigan', image: `${CDN}/p16.jpg` },
  { slug: 'winter',   image: `${CDN}/p17.jpg` },
]

for (const { slug, image } of updates) {
  const result = await prisma.category.updateMany({ where: { slug }, data: { image } })
  console.log(`${slug}: updated ${result.count} row(s)`)
}

await prisma.$disconnect()
