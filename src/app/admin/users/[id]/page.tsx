'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit2, Trash2, X, Check, ShoppingBag, Phone, MapPin, Mail, Calendar, User } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'

interface Order {
  id: string; orderNumber: string; total: number; status: string
  source: string; createdAt: string
  items: { nameAr: string; quantity: number }[]
}

interface UserDetail {
  id: string; name: string; email: string; username?: string; phone?: string
  address?: string; city?: string; role: string; createdAt: string
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'قيد الانتظار', CONFIRMED: 'مؤكد', PROCESSING: 'جاري التحضير',
  SHIPPED: 'في الشحن', DELIVERED: 'تم التسليم', CANCELLED: 'ملغي',
}
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'warning', CONFIRMED: 'success', PROCESSING: 'default',
  SHIPPED: 'default', DELIVERED: 'success', CANCELLED: 'danger',
}
const ROLE_LABELS: Record<string, string> = { USER: 'عميل', STAFF: 'موظف', OWNER: 'مالك', ADMIN: 'مدير' }

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [totalSpent, setTotalSpent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', role: '' })

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
          setOrders(data.orders ?? [])
          setTotalSpent(data.totalSpent ?? 0)
          setForm({
            name: data.user.name ?? '',
            phone: data.user.phone ?? '',
            address: data.user.address ?? '',
            city: data.user.city ?? '',
            role: data.user.role ?? 'USER',
          })
        }
        setLoading(false)
      })
  }, [id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setSaveError(''); setSaveSuccess(false)
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (data.error) { setSaveError(data.error); return }
    setSaveSuccess(true)
    setUser(prev => prev ? { ...prev, ...form } : prev)
    setTimeout(() => { setEditing(false); setSaveSuccess(false) }, 800)
  }

  async function handleDelete() {
    if (!confirm(`حذف مستخدم "${user?.name}"؟ لن يمكن استرجاع البيانات.`)) return
    setDeleting(true)
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    router.push('/admin/users')
  }

  if (loading) {
    return (
      <div dir="rtl" className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    return (
      <div dir="rtl" className="text-center py-20">
        <p className="text-gray-500 font-cairo">لم يتم العثور على المستخدم</p>
        <Link href="/admin/users" className="text-brand-600 font-cairo text-sm mt-2 inline-block">← رجوع</Link>
      </div>
    )
  }

  return (
    <div dir="rtl" className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/admin/users" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-cairo">
          <ArrowLeft size={16} className="rotate-180" />
          المستخدمون
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => { setEditing(!editing); setSaveError('') }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-cairo transition-all border border-gray-200 hover:border-brand-300 hover:text-brand-600"
          >
            {editing ? <X size={14} /> : <Edit2 size={14} />}
            {editing ? 'إلغاء' : 'تعديل'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-cairo text-red-600 border border-red-200 hover:bg-red-50 transition-all disabled:opacity-50"
          >
            <Trash2 size={14} />
            {deleting ? 'جاري الحذف...' : 'حذف'}
          </button>
        </div>
      </div>

      {/* User card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center shrink-0">
            <span className="text-brand-600 font-bold text-xl font-cairo">{user.name[0]}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900 font-cairo">{user.name}</h2>
              <Badge variant={(STATUS_COLORS[user.role] as 'default' | 'success' | 'warning' | 'danger') ?? 'default'}>
                {ROLE_LABELS[user.role] ?? user.role}
              </Badge>
            </div>
            <div className="flex flex-col gap-1 mt-2 text-sm text-gray-500 font-cairo">
              <span className="flex items-center gap-1.5"><Mail size={13} />{user.email}</span>
              {user.phone && <span className="flex items-center gap-1.5"><Phone size={13} />{user.phone}</span>}
              {user.city && <span className="flex items-center gap-1.5"><MapPin size={13} />{user.city}</span>}
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                تسجيل {new Date(user.createdAt).toLocaleDateString('ar-EG')}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-brand-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-brand-700 font-cairo">{formatPrice(totalSpent)}</p>
            <p className="text-xs text-brand-600 font-cairo mt-0.5">إجمالي الإنفاق</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-gray-700 font-cairo">{orders.length}</p>
            <p className="text-xs text-gray-500 font-cairo mt-0.5">طلبات</p>
          </div>
        </div>

        {/* Edit form */}
        {editing && (
          <form onSubmit={handleSave} className="border-t border-gray-100 pt-5 space-y-4">
            <h3 className="font-bold text-gray-900 font-cairo flex items-center gap-2">
              <User size={16} />
              تعديل البيانات
            </h3>
            {saveError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-cairo">{saveError}</div>
            )}
            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm font-cairo flex items-center gap-2">
                <Check size={15} /> تم الحفظ
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'الاسم', key: 'name' as const, required: true },
                { label: 'الهاتف', key: 'phone' as const },
                { label: 'العنوان', key: 'address' as const },
                { label: 'المحافظة', key: 'city' as const },
              ].map(({ label, key, required }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 font-cairo mb-1">{label}</label>
                  <input
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    required={required}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-cairo focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 font-cairo mb-1">الدور</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm font-cairo focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="USER">عميل</option>
                  <option value="STAFF">موظف</option>
                  <option value="ADMIN">مدير</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold font-cairo hover:bg-brand-700 transition-colors disabled:opacity-50 text-sm"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </form>
        )}
      </div>

      {/* Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <ShoppingBag size={16} className="text-brand-500" />
          <h3 className="font-bold text-gray-900 font-cairo">سجل الطلبات</h3>
          <span className="text-sm text-gray-500 font-cairo">({orders.length})</span>
        </div>
        {orders.length === 0 ? (
          <div className="py-12 text-center text-gray-400 font-cairo text-sm">لا توجد طلبات بعد</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.map(order => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-gray-900 font-cairo">{order.orderNumber}</span>
                    <Badge variant={(STATUS_COLORS[order.status] as 'default' | 'success' | 'warning' | 'danger') ?? 'default'} >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </Badge>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-cairo">
                      {order.source === 'POS' ? 'محل' : 'موقع'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-cairo mt-0.5">
                    {order.items.slice(0, 2).map(i => `${i.nameAr} ×${i.quantity}`).join('، ')}
                    {order.items.length > 2 && ` +${order.items.length - 2}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900 font-cairo">{formatPrice(order.total)}</p>
                  <p className="text-xs text-gray-400 font-cairo">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
