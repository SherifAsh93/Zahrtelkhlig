import { prisma } from '@/lib/prisma'
import { parseConfig } from '@/lib/homepage'
import HomepageSettingsForm from './HomepageSettingsForm'

export default async function AdminHomepagePage() {
  let config = parseConfig(null)
  let categories: { slug: string; nameAr: string }[] = []
  let products: { id: string; nameAr: string; images: string[]; price: number; category: { nameAr: string } | null }[] = []

  try {
    const [raw, cats, prods] = await Promise.all([
      prisma.siteSettings.findUnique({ where: { key: 'homepage_config' } }),
      prisma.category.findMany({
        orderBy: [{ sortOrder: 'asc' }, { nameAr: 'asc' }],
        select: { slug: true, nameAr: true },
      }),
      prisma.product.findMany({
        where: { active: true },
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          nameAr: true,
          images: true,
          price: true,
          category: { select: { nameAr: true } },
        },
      }),
    ])
    config = parseConfig(raw?.value)
    categories = cats
    products = prods
  } catch {
    // DB may not have SiteSettings table yet on first deploy — use defaults
  }

  return (
    <div dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-cairo">تحكم في الصفحة الرئيسية</h1>
        <p className="text-gray-500 text-sm font-cairo mt-1">فعّل / أوقف الأقسام، رتّبها، واختر المنتجات يدويًا لكل قسم</p>
      </div>
      <HomepageSettingsForm initial={config} categories={categories} products={products} />
    </div>
  )
}
