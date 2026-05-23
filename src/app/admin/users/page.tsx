'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, ShoppingBag, Plus, X, Eye, Trash2, User, Shield, Store } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

interface UserRow {
  id: string; name: string; email: string; username?: string; phone?: string
  city?: string; role: string; createdAt: string; _count: { orders: number }
}

interface Staff {
  id: string; name: string; username: string; createdAt: string
}

const ROLE_LABELS: Record<string, string> = { USER: 'عميل', STAFF: 'موظف', OWNER: 'مالك', ADMIN: 'مدير' }
const ROLE_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  USER: 'default', STAFF: 'success', OWNER: 'warning', ADMIN: 'danger',
}

export default function AdminUsersPage() {
  const [tab, setTab] = useState<'users' | 'staff'>('users')

  // Customers tab state
  const [users, setUsers] = useState<UserRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Staff tab state
  const [staff, setStaff] = useState<Staff[]>([])
  const [staffLoading, setStaffLoading] = useState(false)
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [staffForm, setStaffForm] = useState({ name: '', username: '', password: '' })
  const [staffError, setStaffError] = useState('')
  const [staffSuccess, setStaffSuccess] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: '1', limit: '50', role: 'USER' })
    if (search) params.set('search', search)
    const res = await fetch(`/api/admin/users?${params}`)
    const data = await res.json()
    setUsers(data.users ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [search])

  const loadStaff = useCallback(async () => {
    setStaffLoading(true)
    const res = await fetch('/api/admin/staff')
    const data = await res.json()
    setStaff(data.staff ?? [])
    setStaffLoading(false)
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])
  useEffect(() => { if (tab === 'staff') loadStaff() }, [tab, loadStaff])

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSearch(searchInput)
  }

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault()
    setStaffError('')
    setStaffSuccess(false)
    const res = await fetch('/api/admin/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(staffForm),
    })
    const data = await res.json()
    if (data.error) { setStaffError(data.error); return }
    setStaffSuccess(true)
    setStaffForm({ name: '', username: '', password: '' })
    setTimeout(() => { setShowAddStaff(false); setStaffSuccess(false); loadStaff() }, 1200)
  }

  async function handleDeleteStaff(id: string) {
    if (!confirm('حذف هذا الموظف؟')) return
    setDeletingId(id)
    await fetch('/api/admin/staff', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setDeletingId(null)
    loadStaff()
  }

  return (
    <div dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-cairo">المستخدمون</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {([['users', 'العملاء', User], ['staff', 'الموظفين', Store]] as const).map(([t, label, Icon]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-cairo font-medium transition-all ${
              tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <>
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="mb-4 flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="بحث بالاسم أو الإيميل أو الهاتف..."
                className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm font-cairo focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => { setSearchInput(''); setSearch('') }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-cairo hover:bg-brand-700 transition-colors"
            >
              بحث
            </button>
          </form>

          <p className="text-gray-500 text-sm font-cairo mb-4">{total} عميل مسجل</p>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
              </div>
            ) : users.length === 0 ? (
              <div className="py-16 text-center text-gray-400 font-cairo">
                {search ? 'لا توجد نتائج للبحث' : 'لا يوجد عملاء مسجلين بعد'}
              </div>
            ) : (
              <>
                {/* Mobile */}
                <div className="lg:hidden divide-y divide-gray-100">
                  {users.map(user => (
                    <div key={user.id} className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-brand-600 font-bold font-cairo">{user.name[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-gray-900 font-cairo truncate">{user.name}</p>
                          <Badge variant={ROLE_VARIANTS[user.role] ?? 'default'}>{ROLE_LABELS[user.role] ?? user.role}</Badge>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500 font-cairo flex-wrap">
                          {user.phone && <span>{user.phone}</span>}
                          {user.city && <span>{user.city}</span>}
                          <span className="flex items-center gap-0.5">
                            <ShoppingBag size={11} className="text-brand-400" />
                            {user._count.orders} طلب
                          </span>
                        </div>
                      </div>
                      <Link href={`/admin/users/${user.id}`} className="p-2 text-gray-400 hover:text-brand-600">
                        <Eye size={16} />
                      </Link>
                    </div>
                  ))}
                </div>
                {/* Desktop */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        {['المستخدم', 'الهاتف', 'المحافظة', 'الطلبات', 'تاريخ التسجيل', ''].map((h, i) => (
                          <th key={i} className="px-4 py-3 text-right text-xs font-bold text-gray-600 font-cairo">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-gray-50 group">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-brand-600 text-sm font-bold font-cairo">{user.name[0]}</span>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900 font-cairo">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 font-cairo">{user.phone || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 font-cairo">{user.city || '-'}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 text-sm text-gray-700 font-cairo">
                              <ShoppingBag size={14} className="text-brand-400" />
                              {user._count.orders}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 font-cairo">
                            {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-800 font-cairo opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Eye size={13} />
                              عرض
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {tab === 'staff' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-500 text-sm font-cairo">{staff.length} موظف</p>
            <button
              onClick={() => { setShowAddStaff(true); setStaffError(''); setStaffSuccess(false) }}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-cairo hover:bg-brand-700 transition-colors"
            >
              <Plus size={15} />
              إضافة موظف
            </button>
          </div>

          {/* Add staff modal */}
          {showAddStaff && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddStaff(false)} />
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold font-cairo text-gray-900">إضافة موظف جديد</h3>
                  <button onClick={() => setShowAddStaff(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleAddStaff} className="space-y-4">
                  {staffError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-cairo">{staffError}</div>
                  )}
                  {staffSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm font-cairo">تم إضافة الموظف بنجاح ✓</div>
                  )}
                  <div>
                    <label className="block text-sm font-medium font-cairo text-gray-700 mb-1.5">الاسم</label>
                    <input
                      value={staffForm.name}
                      onChange={e => setStaffForm(f => ({ ...f, name: e.target.value }))}
                      required
                      placeholder="اسم الموظف"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-cairo focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-cairo text-gray-700 mb-1.5">اسم المستخدم (للدخول)</label>
                    <input
                      value={staffForm.username}
                      onChange={e => setStaffForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                      required
                      placeholder="مثال: ahmed_staff"
                      dir="ltr"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <p className="text-xs text-gray-400 font-cairo mt-1">حروف إنجليزية صغيرة وأرقام فقط</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium font-cairo text-gray-700 mb-1.5">كلمة المرور</label>
                    <input
                      value={staffForm.password}
                      onChange={e => setStaffForm(f => ({ ...f, password: e.target.value }))}
                      required
                      type="password"
                      placeholder="6 أحرف على الأقل"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-brand-600 text-white rounded-xl font-bold font-cairo hover:bg-brand-700 transition-colors"
                  >
                    إضافة
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Staff list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {staffLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
              </div>
            ) : staff.length === 0 ? (
              <div className="py-16 text-center">
                <Shield size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 font-cairo text-sm">لا يوجد موظفين بعد</p>
                <p className="text-gray-400 font-cairo text-xs mt-1">أضف موظفاً ليتمكن من الوصول إلى نقطة البيع</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {staff.map(s => (
                  <div key={s.id} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-emerald-600 font-bold font-cairo">{s.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 font-cairo">{s.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{s.username}</p>
                      <p className="text-xs text-gray-400 font-cairo mt-0.5">
                        منذ {new Date(s.createdAt).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                    <Badge variant="success">موظف</Badge>
                    <button
                      onClick={() => handleDeleteStaff(s.id)}
                      disabled={deletingId === s.id}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className="mt-4 p-4 rounded-xl text-sm font-cairo"
            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}
          >
            <p className="text-emerald-800 font-semibold mb-1">تعليمات نقطة البيع</p>
            <p className="text-emerald-700">الموظفون يدخلون عبر: <span className="font-mono font-bold">zahrtelkhlig.vercel.app/pos</span></p>
            <p className="text-emerald-700 mt-0.5">يستخدمون اسم المستخدم + كلمة المرور أعلاه — لا يمكنهم الوصول للوحة التحكم.</p>
          </div>
        </>
      )}
    </div>
  )
}
