'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface Banner {
  id: string
  titleAr: string
  titleEn: string
  subtitleAr?: string
  image: string
  link?: string
  active: boolean
  sortOrder: number
}

const defaultForm = { titleAr: '', titleEn: '', subtitleAr: '', image: '', link: '', active: true, sortOrder: 0 }

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Banner | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/banners')
    setBanners(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openAdd() {
    setEditing(null)
    setForm(defaultForm)
    setShowForm(true)
  }

  function openEdit(b: Banner) {
    setEditing(b)
    setForm({ titleAr: b.titleAr, titleEn: b.titleEn, subtitleAr: b.subtitleAr || '', image: b.image, link: b.link || '', active: b.active, sortOrder: b.sortOrder })
    setShowForm(true)
  }

  async function save() {
    setSaving(true)
    if (editing) {
      await fetch(`/api/admin/banners/${editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    } else {
      await fetch('/api/admin/banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    }
    setSaving(false)
    setShowForm(false)
    load()
  }

  async function deleteBanner(id: string) {
    if (!confirm('حذف هذا البانر؟')) return
    await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-cairo">إدارة البانرات</h1>
        <Button onClick={openAdd}><Plus size={16} />إضافة بانر</Button>
      </div>

      {/* Image CDN hint */}
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm font-cairo text-blue-700">
        💡 ارفع الصور في <code className="bg-blue-100 px-1 rounded">public/images/banners/</code> ثم استخدم رابط jsDelivr:
        <code className="block bg-blue-100 px-2 py-1 rounded mt-1 text-xs">
          https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/banners/filename.jpg
        </code>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <h2 className="font-bold text-gray-900 font-cairo mb-4">{editing ? 'تعديل البانر' : 'إضافة بانر جديد'}</h2>
            <div className="space-y-4">
              {[
                { key: 'titleAr', label: 'العنوان (عربي) *', required: true },
                { key: 'titleEn', label: 'Title (English)', required: false },
                { key: 'subtitleAr', label: 'النص الفرعي (عربي)', required: false },
                { key: 'image', label: 'رابط الصورة *', required: true },
                { key: 'link', label: 'رابط الزر', required: false },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">{label}</label>
                  <input
                    value={(form as Record<string, string | boolean | number>)[key] as string}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo"
                  />
                </div>
              ))}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-brand-600" />
                  <span className="text-sm font-cairo">نشط</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-cairo">الترتيب:</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) })}
                    className="w-16 px-2 py-1 border border-gray-200 rounded-lg text-sm" />
                </div>
              </div>
              {form.image && (
                <div className="relative h-32 rounded-xl overflow-hidden bg-gray-100">
                  <Image src={form.image} alt="Preview" fill className="object-cover" />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <Button onClick={save} loading={saving} className="flex-1">{editing ? 'حفظ' : 'إضافة'}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>إلغاء</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
          </div>
        ) : banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="relative h-40 bg-gray-100">
              {banner.image ? (
                <Image src={banner.image} alt={banner.titleAr} fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <ImageIcon size={32} className="text-gray-300" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge variant={banner.active ? 'success' : 'default'}>{banner.active ? 'نشط' : 'مخفي'}</Badge>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold font-cairo text-gray-900 mb-1">{banner.titleAr}</h3>
              {banner.subtitleAr && <p className="text-sm text-gray-500 font-cairo">{banner.subtitleAr}</p>}
              <div className="flex gap-2 mt-3">
                <button onClick={() => openEdit(banner)} className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-cairo hover:border-brand-400 transition-colors">
                  <Edit size={14} />تعديل
                </button>
                <button onClick={() => deleteBanner(banner.id)} className="p-2 border border-gray-200 text-gray-500 rounded-xl hover:border-red-400 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
