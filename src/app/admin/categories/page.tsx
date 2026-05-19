'use client'
import { useState, useEffect, useRef } from 'react'
import { Plus, Edit, Trash2, Tag, Camera, Loader2, X } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { slugify } from '@/lib/utils'

interface Category {
  id: string
  nameAr: string
  nameEn: string
  slug: string
  image?: string
  _count: { products: number }
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ nameAr: '', nameEn: '', slug: '', image: '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/categories')
    setCategories(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openAdd() {
    setEditing(null)
    setForm({ nameAr: '', nameEn: '', slug: '', image: '' })
    setShowForm(true)
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setForm({ nameAr: cat.nameAr, nameEn: cat.nameEn, slug: cat.slug, image: cat.image || '' })
    setShowForm(true)
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

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-cairo">الأقسام</h1>
        <Button onClick={openAdd}>
          <Plus size={16} />
          إضافة قسم
        </Button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="font-bold text-gray-900 font-cairo mb-4">{editing ? 'تعديل القسم' : 'إضافة قسم جديد'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">الاسم (عربي) *</label>
                <input
                  value={form.nameAr}
                  onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name (English)</label>
                <input
                  value={form.nameEn}
                  onChange={(e) => setForm({ ...form, nameEn: e.target.value, slug: slugify(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">صورة القسم</label>
                {form.image && (
                  <div className="relative w-full h-32 mb-2 rounded-xl overflow-hidden bg-gray-100">
                    <Image src={form.image} alt="صورة القسم" fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, image: '' }))}
                      className="absolute top-2 left-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X size={12} />
                    </button>
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
                  {uploading ? 'جاري الرفع...' : 'رفع من الجهاز أو الكاميرا'}
                </button>
                <input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                  placeholder="أو الصق رابط الصورة..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button onClick={save} loading={saving} className="flex-1">{editing ? 'حفظ' : 'إضافة'}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Mobile card view */}
            <div className="lg:hidden divide-y divide-gray-100">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                    <Tag size={16} className="text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 font-cairo">{cat.nameAr}</p>
                    <p className="text-xs text-gray-500">{cat.nameEn} • {cat._count.products} منتج</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => openEdit(cat)} className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                      <Edit size={15} />
                    </button>
                    <button onClick={() => deleteCategory(cat.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop table */}
            <table className="hidden lg:table w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['القسم', 'Slug', 'عدد المنتجات', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-right text-xs font-bold text-gray-600 font-cairo">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Tag size={16} className="text-brand-400" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 font-cairo">{cat.nameAr}</p>
                          <p className="text-xs text-gray-500">{cat.nameEn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">{cat.slug}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-cairo">{cat._count.products} منتج</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEdit(cat)} className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                          <Edit size={15} />
                        </button>
                        <button onClick={() => deleteCategory(cat.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}
