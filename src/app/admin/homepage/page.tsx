import { prisma } from '@/lib/prisma'
import HomepageSettingsForm from './HomepageSettingsForm'

export default async function AdminHomepagePage() {
  const rows = await prisma.siteSettings.findMany()
  const defaults = Object.fromEntries(rows.map((r) => [r.key, r.value]))

  return (
    <div dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-cairo">محتوى الصفحة الرئيسية</h1>
        <p className="text-gray-500 text-sm font-cairo mt-1">تعديل النصوص والمعلومات الظاهرة للزوار</p>
      </div>
      <HomepageSettingsForm defaults={defaults} />
    </div>
  )
}
