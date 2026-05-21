'use client'
import { useState, useTransition } from 'react'
import { saveHomepageConfig } from '@/app/actions/settings'
import {
  ChevronUp, ChevronDown, Eye, EyeOff, CheckCircle, ChevronRight,
  Plus, Trash2,
} from 'lucide-react'
import {
  DEFAULT_CONFIG, SECTION_LABELS,
  type HomepageConfig, type FeatureIcon, type GlanceTile, type FeatureItem,
} from '@/lib/homepage'
import ProductPicker, { type PickerProduct } from './ProductPicker'

interface Props {
  initial: HomepageConfig
  categories: { slug: string; nameAr: string }[]
  products: PickerProduct[]
}

const ICONS: FeatureIcon[] = ['Truck', 'Shield', 'Star', 'Clock', 'Heart', 'Phone', 'Gift', 'Zap']
const ICON_LABELS: Record<FeatureIcon, string> = {
  Truck: '🚚 شاحنة', Shield: '🛡️ درع', Star: '⭐ نجمة', Clock: '🕐 ساعة',
  Heart: '❤️ قلب', Phone: '📞 هاتف', Gift: '🎁 هدية', Zap: '⚡ برق',
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${on ? 'bg-brand-600' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${on ? 'right-0.5' : 'right-5'}`} />
    </button>
  )
}

function ModeToggle({ mode, onChange }: { mode: 'auto' | 'manual'; onChange: (v: 'auto' | 'manual') => void }) {
  return (
    <div className="flex gap-2 mb-4">
      <button
        type="button"
        onClick={() => onChange('auto')}
        className={`flex-1 py-2 text-sm font-cairo rounded-xl border transition-colors ${
          mode === 'auto' ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:border-brand-300'
        }`}
      >
        تلقائي
        <span className="block text-[10px] opacity-70">أحدث المنتجات تلقائيًا</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('manual')}
        className={`flex-1 py-2 text-sm font-cairo rounded-xl border transition-colors ${
          mode === 'manual' ? 'bg-brand-600 text-white border-brand-600' : 'border-gray-200 text-gray-600 hover:border-brand-300'
        }`}
      >
        يدوي
        <span className="block text-[10px] opacity-70">اختر المنتجات بنفسك</span>
      </button>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 font-cairo mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-cairo focus:outline-none focus:border-brand-400'

export default function HomepageSettingsForm({ initial, categories, products }: Props) {
  const [cfg, setCfg] = useState<HomepageConfig>(initial)
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function moveSection(idx: number, dir: -1 | 1) {
    setCfg((c) => {
      const order = [...c.sectionsOrder]
      const target = idx + dir
      if (target < 0 || target >= order.length) return c
      ;[order[idx], order[target]] = [order[target], order[idx]]
      return { ...c, sectionsOrder: order }
    })
  }

  function toggleSection(key: string, val: boolean) {
    setCfg((c) => ({
      ...c,
      sections: {
        ...c.sections,
        [key]: { ...(c.sections as Record<string, unknown>)[key] as object, enabled: val },
      },
    }))
  }

  function setSection<K extends keyof HomepageConfig['sections']>(
    key: K,
    patch: Partial<HomepageConfig['sections'][K]>,
  ) {
    setCfg((c) => ({
      ...c,
      sections: { ...c.sections, [key]: { ...c.sections[key], ...patch } },
    }))
  }

  function handleSave() {
    startTransition(async () => {
      await saveHomepageConfig(cfg)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  const sec = cfg.sections

  return (
    <div className="space-y-6" dir="rtl">

      {/* Phone */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-900 font-cairo mb-3">رقم الهاتف</h2>
        <p className="text-xs text-gray-400 font-cairo mb-3">يظهر في الشريط العلوي والتذييل</p>
        <input type="text" value={cfg.phone} onChange={(e) => setCfg((c) => ({ ...c, phone: e.target.value }))}
          dir="ltr" className={inputCls} placeholder="01002001446" />
      </div>

      {/* Sections list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 font-cairo">أقسام الصفحة الرئيسية</h2>
          <p className="text-xs text-gray-400 font-cairo mt-1">رتّب الأقسام، فعّل أو أوقف كل قسم، واضغط عليه لتعديل محتواه</p>
        </div>

        <div className="divide-y divide-gray-50">
          {cfg.sectionsOrder.map((key, idx) => {
            const s = (sec as Record<string, { enabled: boolean }>)[key]
            const isOpen = openSection === key
            return (
              <div key={key}>
                <div className={`flex items-center gap-3 px-5 py-3.5 ${isOpen ? 'bg-brand-50/40' : 'hover:bg-gray-50'} transition-colors`}>
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button type="button" onClick={() => moveSection(idx, -1)} disabled={idx === 0}
                      className="p-0.5 rounded text-gray-400 hover:text-gray-700 disabled:opacity-20">
                      <ChevronUp size={14} />
                    </button>
                    <button type="button" onClick={() => moveSection(idx, 1)} disabled={idx === cfg.sectionsOrder.length - 1}
                      className="p-0.5 rounded text-gray-400 hover:text-gray-700 disabled:opacity-20">
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <Toggle on={s.enabled} onChange={(v) => toggleSection(key, v)} />
                  <button type="button" onClick={() => setOpenSection(isOpen ? null : key)}
                    className="flex-1 flex items-center justify-between min-w-0">
                    <span className={`text-sm font-cairo ${s.enabled ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                      {SECTION_LABELS[key] ?? key}
                    </span>
                    <div className="flex items-center gap-2">
                      {s.enabled ? <Eye size={14} className="text-brand-500" /> : <EyeOff size={14} className="text-gray-300" />}
                      <ChevronRight size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                    </div>
                  </button>
                </div>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 bg-gray-50/60 border-t border-gray-100">
                    {key === 'features_bar'   && <FeaturesBarEditor   items={sec.features_bar.items}   onChange={(items) => setSection('features_bar', { items })} />}
                    {key === 'new_arrivals'   && <CarouselEditor      cfg={sec.new_arrivals}            onChange={(p) => setSection('new_arrivals', p)} allProducts={products} />}
                    {key === 'at_glance'      && <AtGlanceEditor      tiles={sec.at_glance.tiles}       onChange={(tiles) => setSection('at_glance', { tiles })} categories={categories} />}
                    {key === 'featured'       && <CarouselEditor      cfg={sec.featured}                onChange={(p) => setSection('featured', p)} allProducts={products} />}
                    {key === 'category_tabs'  && <CategoryTabsEditor  cfg={sec.category_tabs}           onChange={(p) => setSection('category_tabs', p)} />}
                    {key === 'brand_story'    && <BrandStoryEditor    cfg={sec.brand_story}             onChange={(p) => setSection('brand_story', p)} />}
                    {key === 'instagram'      && <InstagramEditor     cfg={sec.instagram}               onChange={(p) => setSection('instagram', p)} allProducts={products} />}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-4 pb-8">
        <button onClick={handleSave} disabled={isPending}
          className="px-8 py-3 bg-brand-600 text-white text-sm font-cairo rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-60 font-semibold">
          {isPending ? 'جارٍ الحفظ...' : 'حفظ جميع التغييرات'}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-green-600 text-sm font-cairo">
            <CheckCircle size={16} /> تم الحفظ وتحديث الموقع
          </span>
        )}
      </div>
    </div>
  )
}

/* ─── Sub-editors ─────────────────────────────────────────── */

function FeaturesBarEditor({ items, onChange }: { items: FeatureItem[]; onChange: (v: FeatureItem[]) => void }) {
  function update(i: number, patch: Partial<FeatureItem>) {
    onChange(items.map((item, idx) => (idx === i ? { ...item, ...patch } : item)))
  }
  return (
    <div className="space-y-4 mt-3">
      {items.map((item, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 font-cairo">العنصر #{i + 1}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="الأيقونة">
              <select value={item.icon} onChange={(e) => update(i, { icon: e.target.value as FeatureIcon })} className={inputCls}>
                {ICONS.map((ic) => <option key={ic} value={ic}>{ICON_LABELS[ic]}</option>)}
              </select>
            </Field>
            <Field label="العنوان">
              <input type="text" value={item.title} onChange={(e) => update(i, { title: e.target.value })} className={inputCls} />
            </Field>
            <Field label="الوصف">
              <input type="text" value={item.desc} onChange={(e) => update(i, { desc: e.target.value })} className={inputCls} />
            </Field>
          </div>
        </div>
      ))}
    </div>
  )
}

function CarouselEditor({
  cfg, onChange, allProducts,
}: {
  cfg: { headingAr: string; headingEn: string; count: number; mode: 'auto' | 'manual'; productIds: string[] }
  onChange: (v: Partial<typeof cfg>) => void
  allProducts: PickerProduct[]
}) {
  return (
    <div className="mt-3 space-y-4">
      {/* Headings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="العنوان بالعربية">
          <input type="text" value={cfg.headingAr} onChange={(e) => onChange({ headingAr: e.target.value })} className={inputCls} />
        </Field>
        <Field label="العنوان بالإنجليزية">
          <input type="text" dir="ltr" value={cfg.headingEn} onChange={(e) => onChange({ headingEn: e.target.value })} className={inputCls} />
        </Field>
      </div>

      {/* Mode toggle */}
      <ModeToggle mode={cfg.mode} onChange={(mode) => onChange({ mode })} />

      {/* Auto: count */}
      {cfg.mode === 'auto' && (
        <Field label={`عدد المنتجات المعروضة (${cfg.count})`}>
          <input type="range" min={1} max={20} value={cfg.count}
            onChange={(e) => onChange({ count: Number(e.target.value) })}
            className="w-full accent-brand-600" />
          <div className="flex justify-between text-xs text-gray-400 font-cairo mt-1">
            <span>١</span><span>٢٠</span>
          </div>
        </Field>
      )}

      {/* Manual: product picker */}
      {cfg.mode === 'manual' && (
        <ProductPicker
          allProducts={allProducts}
          selected={cfg.productIds}
          onChange={(productIds) => onChange({ productIds })}
        />
      )}
    </div>
  )
}

function AtGlanceEditor({
  tiles, onChange, categories,
}: { tiles: GlanceTile[]; onChange: (v: GlanceTile[]) => void; categories: { slug: string; nameAr: string }[] }) {
  function update(i: number, patch: Partial<GlanceTile>) {
    onChange(tiles.map((t, idx) => (idx === i ? { ...t, ...patch } : t)))
  }
  function remove(i: number) { onChange(tiles.filter((_, idx) => idx !== i)) }
  function add() {
    if (tiles.length >= 3) return
    onChange([...tiles, { slug: categories[0]?.slug ?? '', label: 'جديد', title: 'قسم جديد' }])
  }

  return (
    <div className="space-y-3 mt-3">
      <p className="text-xs text-gray-400 font-cairo">حتى 3 بطاقات. كل بطاقة تعرض صورة القسم أو يمكنك رفع صورة مخصصة.</p>
      {tiles.map((tile, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 font-cairo">البطاقة #{i + 1}</p>
            <button type="button" onClick={() => remove(i)} className="p-1 text-red-400 hover:text-red-600">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <Field label="القسم">
              <select value={tile.slug} onChange={(e) => update(i, { slug: e.target.value })} className={inputCls}>
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.nameAr} ({c.slug})</option>)}
              </select>
            </Field>
            <Field label="الوسم الصغير">
              <input type="text" value={tile.label} onChange={(e) => update(i, { label: e.target.value })} className={inputCls} placeholder="كولكشن جديد" />
            </Field>
            <Field label="العنوان الكبير">
              <input type="text" value={tile.title} onChange={(e) => update(i, { title: e.target.value })} className={inputCls} placeholder="كولكشن العيد" />
            </Field>
          </div>
          <Field label="صورة مخصصة (URL) — اتركها فارغة لاستخدام صورة القسم تلقائيًا">
            <input type="url" dir="ltr" value={tile.customImage ?? ''}
              onChange={(e) => update(i, { customImage: e.target.value || undefined })}
              className={inputCls} placeholder="https://..." />
          </Field>
        </div>
      ))}
      {tiles.length < 3 && (
        <button type="button" onClick={add}
          className="flex items-center gap-2 text-sm text-brand-600 font-cairo hover:text-brand-800">
          <Plus size={15} /> إضافة بطاقة
        </button>
      )}
    </div>
  )
}

function CategoryTabsEditor({
  cfg, onChange,
}: { cfg: { headingAr: string; headingEn: string }; onChange: (v: Partial<typeof cfg>) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
      <Field label="العنوان بالعربية">
        <input type="text" value={cfg.headingAr} onChange={(e) => onChange({ headingAr: e.target.value })} className={inputCls} />
      </Field>
      <Field label="العنوان بالإنجليزية">
        <input type="text" dir="ltr" value={cfg.headingEn} onChange={(e) => onChange({ headingEn: e.target.value })} className={inputCls} />
      </Field>
    </div>
  )
}

function BrandStoryEditor({
  cfg, onChange,
}: { cfg: { title: string; text: string; buttonText: string }; onChange: (v: Partial<typeof cfg>) => void }) {
  return (
    <div className="space-y-3 mt-3">
      <Field label="العنوان الكبير (Enter لتقسيمه)">
        <textarea dir="ltr" rows={2} value={cfg.title} onChange={(e) => onChange({ title: e.target.value })} className={`${inputCls} resize-none`} />
      </Field>
      <Field label="النص">
        <textarea rows={3} value={cfg.text} onChange={(e) => onChange({ text: e.target.value })} className={`${inputCls} resize-none`} />
      </Field>
      <Field label="نص الزر">
        <input type="text" value={cfg.buttonText} onChange={(e) => onChange({ buttonText: e.target.value })} className={inputCls} />
      </Field>
    </div>
  )
}

function InstagramEditor({
  cfg, onChange, allProducts,
}: {
  cfg: { handle: string; url: string; count: number; mode: 'auto' | 'manual'; productIds: string[] }
  onChange: (v: Partial<typeof cfg>) => void
  allProducts: PickerProduct[]
}) {
  return (
    <div className="mt-3 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="الاسم (@handle)">
          <input type="text" dir="ltr" value={cfg.handle} onChange={(e) => onChange({ handle: e.target.value })} className={inputCls} />
        </Field>
        <Field label="رابط الصفحة">
          <input type="url" dir="ltr" value={cfg.url} onChange={(e) => onChange({ url: e.target.value })} className={inputCls} />
        </Field>
      </div>

      <ModeToggle mode={cfg.mode} onChange={(mode) => onChange({ mode })} />

      {cfg.mode === 'auto' && (
        <Field label={`عدد الصور (${cfg.count})`}>
          <input type="range" min={1} max={9} value={cfg.count}
            onChange={(e) => onChange({ count: Number(e.target.value) })}
            className="w-full accent-brand-600" />
          <div className="flex justify-between text-xs text-gray-400 font-cairo mt-1">
            <span>١</span><span>٩</span>
          </div>
        </Field>
      )}

      {cfg.mode === 'manual' && (
        <ProductPicker
          allProducts={allProducts}
          selected={cfg.productIds}
          onChange={(productIds) => onChange({ productIds })}
        />
      )}
    </div>
  )
}
