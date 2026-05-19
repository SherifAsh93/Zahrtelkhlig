'use client'
import { useState, useEffect } from 'react'
import { Users, ShoppingBag } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  city?: string
  role: string
  createdAt: string
  _count: { orders: number }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/users').then((r) => r.json()).then((data) => {
      setUsers(data.users)
      setTotal(data.total)
      setLoading(false)
    })
  }, [])

  return (
    <div dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-cairo">المستخدمون</h1>
        <p className="text-gray-500 text-sm font-cairo mt-1">{total} مستخدم</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Mobile card view */}
            <div className="lg:hidden divide-y divide-gray-100">
              {users.map((user) => (
                <div key={user.id} className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-brand-600 font-bold font-cairo">{user.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-gray-900 font-cairo truncate">{user.name}</p>
                      <Badge variant={user.role === 'ADMIN' ? 'danger' : 'default'}>
                        {user.role === 'ADMIN' ? 'مدير' : 'مستخدم'}
                      </Badge>
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
                </div>
              ))}
            </div>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['المستخدم', 'الهاتف', 'المحافظة', 'الطلبات', 'الدور', 'تاريخ التسجيل'].map((h) => (
                      <th key={h} className="px-4 py-3 text-right text-xs font-bold text-gray-600 font-cairo">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
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
                      <td className="px-4 py-3">
                        <Badge variant={user.role === 'ADMIN' ? 'danger' : 'default'}>
                          {user.role === 'ADMIN' ? 'مدير' : 'مستخدم'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-cairo">
                        {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
