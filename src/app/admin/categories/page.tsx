'use client'
import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Tag } from 'lucide-react'
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">رابط الصورة</label>
                <input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
                  placeholder="https://..."
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
          <table className="w-full">
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
        )}
      </div>
    </div>
  )
}
