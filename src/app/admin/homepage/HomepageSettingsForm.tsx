'use client'
import { useState, useTransition } from 'react'
import { saveHomepageSettings } from '@/app/actions/settings'
import { CheckCircle } from 'lucide-react'

interface Props {
  defaults: Record<string, string>
}

export default function HomepageSettingsForm({ defaults }: Props) {
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const [fields, setFields] = useState({
    feature1Title: defaults.feature1_title ?? 'شحن لجميع المحافظات',
    feature1Desc:  defaults.feature1_desc  ?? 'لجميع أنحاء مصر',
    feature2Title: defaults.feature2_title ?? 'الدفع عند الاستلام',
    feature2Desc:  defaults.feature2_desc  ?? 'ادفعي لما يوصلك الطلب',
    feature3Title: defaults.feature3_title ?? 'ماركة مصرية أصيلة',
    feature3Desc:  defaults.feature3_desc  ?? 'Proudly Egyptian Since 2000 🇪🇬',
    feature4Title: defaults.feature4_title ?? 'استلام يومي',
    feature4Desc:  defaults.feature4_desc  ?? 'من ١١ صباحًا حتي ١٢ مساءً',
    brandStoryTitle: defaults.brand_story_title ?? 'Every Piece Begins With a\nFabric, a Feeling, and a Story',
    brandStoryText:  defaults.brand_story_text  ?? 'زهرة الخليج — ماركة مصرية أصيلة منذ عام ٢٠٠٠. نؤمن بأن الأناقة الحقيقية تبدأ من الداخل، ونصنع لكِ ملابس تعبر عن شخصيتك الفريدة وتناسب كل مناسبة.',
    phone: defaults.phone ?? '01002001446',
  })

  function set(key: keyof typeof fields) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((f) => ({ ...f, [key]: e.target.value }))
  }

  function handleSave() {
    startTransition(async () => {
      await saveHomepageSettings(fields)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <div className="space-y-8" dir="rtl">

      {/* Phone */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 font-cairo mb-4">رقم الهاتف</h2>
        <p className="text-xs text-gray-500 font-cairo mb-3">يظهر في الشريط العلوي والتذييل</p>
        <input
          type="text"
          value={fields.phone}
          onChange={set('phone')}
          dir="ltr"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-cairo focus:outline-none focus:border-brand-400"
        />
      </section>

      {/* Features bar */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 font-cairo mb-1">شريط المميزات</h2>
        <p className="text-xs text-gray-500 font-cairo mb-5">الأيقونات الأربعة أسفل البانر الرئيسي</p>
        <div className="space-y-4">
          {([1, 2, 3, 4] as const).map((n) => (
            <div key={n} className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-cairo mb-1 block">العنوان #{n}</label>
                <input
                  type="text"
                  value={fields[`feature${n}Title` as keyof typeof fields]}
                  onChange={set(`feature${n}Title` as keyof typeof fields)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-cairo focus:outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-cairo mb-1 block">الوصف #{n}</label>
                <input
                  type="text"
                  value={fields[`feature${n}Desc` as keyof typeof fields]}
                  onChange={set(`feature${n}Desc` as keyof typeof fields)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-cairo focus:outline-none focus:border-brand-400"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand story */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 font-cairo mb-1">قصة العلامة التجارية</h2>
        <p className="text-xs text-gray-500 font-cairo mb-5">القسم المركزي في منتصف الصفحة الرئيسية</p>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 font-cairo mb-1 block">العنوان الكبير</label>
            <textarea
              value={fields.brandStoryTitle}
              onChange={set('brandStoryTitle')}
              rows={2}
              dir="ltr"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-cairo focus:outline-none focus:border-brand-400 resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-cairo mb-1 block">النص</label>
            <textarea
              value={fields.brandStoryText}
              onChange={set('brandStoryText')}
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-cairo focus:outline-none focus:border-brand-400 resize-none"
            />
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-8 py-3 bg-brand-600 text-white text-sm font-cairo rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-60"
        >
          {isPending ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-green-600 text-sm font-cairo">
            <CheckCircle size={16} />
            تم الحفظ بنجاح
          </span>
        )}
      </div>
    </div>
  )
}
