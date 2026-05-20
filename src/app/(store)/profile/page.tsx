'use client'
import { useState, useEffect } from 'react'
import { User, Package, LogOut } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { CITIES } from '@/lib/utils'

interface UserData {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => {
        if (r.status === 401) window.location.href = '/login'
        return r.json()
      })
      .then(setUser)
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const form = new FormData(e.currentTarget)
    await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        phone: form.get('phone'),
        address: form.get('address'),
        city: form.get('city'),
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" /></div>
  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-10" dir="rtl">
      <h1 className="text-2xl font-bold text-gray-900 font-cairo mb-8 flex items-center gap-2">
        <User size={24} className="text-brand-600" />
        حسابي
      </h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-brand-600 font-bold text-2xl font-cairo">{user.name[0]}</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900 font-cairo text-lg">{user.name}</h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {saved && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm font-cairo">
              تم حفظ التغييرات ✓
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">الاسم</label>
              <input
                name="name"
                defaultValue={user.name}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">رقم الهاتف</label>
              <input
                name="phone"
                defaultValue={user.phone || ''}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo"
                placeholder="01XXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">المحافظة</label>
              <select
                name="city"
                defaultValue={user.city || ''}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo bg-white"
              >
                <option value="">اختاري المحافظة</option>
                {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">العنوان</label>
              <input
                name="address"
                defaultValue={user.address || ''}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo"
                placeholder="عنوانك التفصيلي"
              />
            </div>
          </div>

          <Button type="submit" loading={saving} className="w-full sm:w-auto">
            {saved ? 'تم الحفظ ✓' : 'حفظ التغييرات'}
          </Button>
        </form>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/orders" className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-cairo text-sm hover:border-brand-400 transition-colors">
          <Package size={18} />
          طلباتي
        </Link>
        <form action={logout}>
          <button type="submit" className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 font-cairo text-sm hover:bg-red-100 transition-colors">
            <LogOut size={18} />
            تسجيل الخروج
          </button>
        </form>
      </div>
    </div>
  )
}
