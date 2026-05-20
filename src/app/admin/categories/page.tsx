'use client'
import { useState, useEffect, useRef } from 'react'
import { Plus, Edit, Trash2, Camera, Loader2, X, ImageIcon, Package } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { slugify } from '@/lib/utils'

interface Category {
  id: string
  nameAr: string
  nameEn: string
  slug: string
  image?: string | null
  seasonal: boolean
  sortOrder: number
  _count: { products: number }
}

interface ProductThumb {
  id: string
  nameAr: string
  images: string[]
}

type FilterType = 'all' | 'permanent' | 'seasonal'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ nameAr: '', nameEn: '', slug: '', image: '', seasonal: false, sortOrder: 0 })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [catProducts, setCatProducts] = useState<ProductThumb[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/categories')
    setCategories(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function loadCategoryProducts(slug: string) {
    setLoadingProducts(true)
    setCatProducts([])
    try {
      const res = await fetch(`/api/admin/products?category=${slug}&limit=50`)
      const data = await res.json()
      setCatProducts((data.products || []).filter((p: ProductThumb) => p.images?.length > 0))
    } finally {
      setLoadingProducts(false)
    }
  }

  function openAdd() {
    setEditing(null)
    setForm({ nameAr: '', nameEn: '', slug: '', image: '', seasonal: false, sortOrder: 0 })
    setCatProducts([])
    setShowForm(true)
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setForm({ nameAr: cat.nameAr, nameEn: cat.nameEn, slug: cat.slug, image: cat.image || '', seasonal: cat.seasonal, sortOrder: cat.sortOrder })
    setShowForm(true)
    loadCategoryProducts(cat.slug)
  }

  async function save() {
    setSaving(true)
    const data = { ...form, slug: form.slug || slugify(form.nameEn || form.nameAr) }
    if (editing) {
      await fetch(`/api/admin/categories/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    } else {
      await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    }
    setSaving(false)
    setShowForm(false)
    load()
  }

  async function uploadCategoryImage(file: File) {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) setForm((f) => ({ ...f, image: data.url }))
    } finally {
      setUploading(false)
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm('حذف هذا القسم؟')) return
    await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
    load()
  }

  const filtered = categories.filter((c) =>
    filter === 'all' ? true : filter === 'seasonal' ? c.seasonal : !c.seasonal
  )

  const permanentCount = categories.filter((c) => !c.seasonal).length
  const seasonalCount = categories.filter((c) => c.seasonal).length

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-cairo">الأقسام</h1>
        <Button onClick={openAdd}>
          <Plus size={16} />
          إضافة قسم
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {([
          { key: 'all',       label: `الكل (${categories.length})` },
          { key: 'permanent', label: `دائمة (${permanentCount})` },
          { key: 'seasonal',  label: `موسمية (${seasonalCount})` },
        ] as { key: FilterType; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-cairo transition-colors ${
              filter === key ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-brand-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 font-cairo text-lg">{editing ? 'تعديل القسم' : 'إضافة قسم جديد'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Basic info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 font-cairo mb-1.5">الاسم (عربي) *</label>
                  <input
                    value={form.nameAr}
                    onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo"
                    placeholder="مثلاً: عباية"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">الاسم (إنجليزي)</label>
                  <input
                    value={form.nameEn}
                    onChange={(e) => setForm({ ...form, nameEn: e.target.value, slug: slugify(e.target.value) })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                    placeholder="e.g. abaya"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-mono"
                    placeholder="abaya"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">الترتيب</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Seasonal toggle */}
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-amber-400 transition-colors has-[:checked]:border-amber-400 has-[:checked]:bg-amber-50">
                <input
                  type="checkbox"
                  checked={form.seasonal}
                  onChange={(e) => setForm({ ...form, seasonal: e.target.checked })}
                  className="accent-amber-500 w-4 h-4"
                />
                <div>
                  <p className="text-sm font-cairo font-semibold text-gray-800">موسمي / مؤقت</p>
                  <p className="text-xs text-gray-500 font-cairo">مثل: كولكشن العيد، كولكشن الشتاء</p>
                </div>
              </label>

              {/* Image section */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 font-cairo mb-2">صورة القسم</label>

                {form.image ? (
                  <div className="relative w-full aspect-video mb-3 rounded-xl overflow-hidden bg-gray-100 group">
                    <Image src={form.image} alt="صورة القسم" fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, image: '' }))}
                      className="absolute top-2 left-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={13} />
                    </button>
                    <div className="absolute bottom-2 right-2 bg-green-500 text-white text-[10px] font-cairo px-2 py-0.5 rounded-full">
                      الصورة المختارة
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-video mb-3 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                    <ImageIcon size={28} className="mb-1" />
                    <p className="text-xs font-cairo">لم يتم اختيار صورة</p>
                  </div>
                )}

                {editing && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-600 font-cairo mb-2">اختر صورة من منتجات القسم:</p>
                    {loadingProducts ? (
                      <div className="flex items-center gap-2 text-gray-400 text-xs font-cairo py-2">
                        <Loader2 size={14} className="animate-spin" />
                        جاري التحميل...
                      </div>
                    ) : catProducts.length === 0 ? (
                      <p className="text-xs text-gray-400 font-cairo py-2">لا توجد منتجات في هذا القسم بعد</p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2 max-h-52 overflow-y-auto">
                        {catProducts.flatMap((p) =>
                          p.images.slice(0, 3).map((imgUrl, idx) => {
                            const isSelected = form.image === imgUrl
                            return (
                              <button
                                key={`${p.id}-${idx}`}
                                type="button"
                                onClick={() => setForm((f) => ({ ...f, image: imgUrl }))}
                                className={`relative aspect-[2/3] rounded-lg overflow-hidden border-2 transition-all ${
                                  isSelected ? 'border-brand-500 ring-2 ring-brand-300' : 'border-transparent hover:border-brand-300'
                                }`}
                                title={p.nameAr}
                              >
                                <Image src={imgUrl} alt={p.nameAr} fill className="object-cover object-left-top" unoptimized />
                                {isSelected && (
                                  <div className="absolute inset-0 bg-brand-600/20 flex items-center justify-center">
                                    <div className="w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">✓</div>
                                  </div>
                                )}
                              </button>
                            )
                          })
                        )}
                      </div>
                    )}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) uploadCategoryImage(file)
                    e.target.value = ''
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mb-2 border-2 border-dashed border-brand-300 rounded-xl text-sm font-cairo text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                  {uploading ? 'جاري الرفع...' : 'أو ارفع صورة من جهازك'}
                </button>
                <input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                  placeholder="أو الصق رابط صورة..."
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <Button onClick={save} loading={saving} className="flex-1">{editing ? 'حفظ التعديلات' : 'إضافة القسم'}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            </div>
          </div>
        </div>
      )}

      {/* Categories grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 font-cairo">
          لا توجد أقسام في هذا الفلتر
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Image area */}
              <div className="relative aspect-[4/3] bg-gray-100 group">
                {cat.image ? (
                  <Image src={cat.image} alt={cat.nameAr} fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                    <ImageIcon size={32} className="mb-1" />
                    <p className="text-xs font-cairo text-gray-400">لا توجد صورة</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {/* Seasonal / Permanent badge */}
                <div className="absolute top-2 right-2">
                  {cat.seasonal ? (
                    <span className="bg-amber-500 text-white text-[10px] font-cairo font-bold px-2 py-0.5 rounded-full">موسمي</span>
                  ) : (
                    <span className="bg-green-600 text-white text-[10px] font-cairo font-bold px-2 py-0.5 rounded-full">دائم</span>
                  )}
                </div>
                <div className="absolute bottom-0 inset-x-0 p-3 text-white">
                  <p className="font-bold font-cairo text-base leading-tight">{cat.nameAr}</p>
                  <p className="text-xs text-gray-300 font-cairo">{cat._count.products} منتج</p>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => openEdit(cat)}
                    className="bg-white text-gray-900 text-xs font-cairo font-semibold px-4 py-2 rounded-full shadow-lg hover:bg-brand-50 transition-colors"
                  >
                    تعديل البيانات
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="p-3 flex items-center justify-between gap-2">
                <Link
                  href={`/admin/products?category=${cat.slug}`}
                  className="flex items-center gap-1.5 text-xs text-brand-600 font-cairo font-medium hover:underline"
                >
                  <Package size={13} />
                  إدارة المنتجات
                </Link>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)} className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="تعديل">
                    <Edit size={15} />
                  </button>
                  <button onClick={() => deleteCategory(cat.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
