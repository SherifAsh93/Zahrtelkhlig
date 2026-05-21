import { prisma } from '@/lib/prisma'
import { parseConfig } from '@/lib/homepage'
import HomepageSettingsForm from './HomepageSettingsForm'

export default async function AdminHomepagePage() {
  let config = parseConfig(null)
  let categories: { slug: string; nameAr: string }[] = []

  try {
    const [raw, cats] = await Promise.all([
      prisma.siteSettings.findUnique({ where: { key: 'homepage_config' } }),
      prisma.category.findMany({ orderBy: [{ sortOrder: 'asc' }, { nameAr: 'asc' }], select: { slug: true, nameAr: true } }),
    ])
    config = parseConfig(raw?.value)
    categories = cats
  } catch {
    // DB might not have SiteSettings table yet on first deploy — use defaults
  }

  return (
    <div dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-cairo">تحكم في الصفحة الرئيسية</h1>
        <p className="text-gray-500 text-sm font-cairo mt-1">فعّل / أوقف الأقسام، رتّبها، وعدّل محتوى كل قسم</p>
      </div>
      <HomepageSettingsForm initial={config} categories={categories} />
    </div>
  )
}
