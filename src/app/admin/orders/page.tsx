'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { ShoppingBag, ChevronLeft } from 'lucide-react'

const STATUS_MAP = {
  PENDING: { label: 'في الانتظار', variant: 'warning' as const },
  CONFIRMED: { label: 'مؤكد', variant: 'info' as const },
  PROCESSING: { label: 'قيد التجهيز', variant: 'info' as const },
  SHIPPED: { label: 'تم الشحن', variant: 'info' as const },
  DELIVERED: { label: 'تم التوصيل', variant: 'success' as const },
  CANCELLED: { label: 'ملغي', variant: 'danger' as const },
}

type OrderStatus = keyof typeof STATUS_MAP

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  city: string
  total: number
  status: OrderStatus
  createdAt: string
  items: { id: string }[]
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  async function load() {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '15' })
    if (statusFilter) params.set('status', statusFilter)
    const res = await fetch(`/api/admin/orders?${params}`)
    const data = await res.json()
    setOrders(data.orders)
    setTotal(data.total)
    setLoading(false)
  }

  useEffect(() => { load() }, [page, statusFilter])

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-cairo">الطلبات</h1>
          <p className="text-gray-500 text-sm font-cairo mt-1">{total} طلب</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[{ value: '', label: 'الكل' }, ...Object.entries(STATUS_MAP).map(([v, { label }]) => ({ value: v, label }))].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => { setStatusFilter(value); setPage(1) }}
            className={`px-3 py-1.5 rounded-full text-sm font-cairo transition-colors ${statusFilter === value ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-brand-400'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-cairo">
            <ShoppingBag size={48} className="mx-auto mb-3 text-gray-200" />
            لا توجد طلبات
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['رقم الطلب', 'العميل', 'المحافظة', 'الإجمالي', 'الحالة', 'التاريخ', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-right text-xs font-bold text-gray-600 font-cairo">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => {
                  const status = STATUS_MAP[order.status]
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono font-bold text-gray-900">{order.orderNumber}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900 font-cairo">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.customerPhone}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-cairo">{order.city}</td>
                      <td className="px-4 py-3 text-sm font-bold text-brand-600 font-cairo">{formatPrice(order.total)}</td>
                      <td className="px-4 py-3"><Badge variant={status.variant}>{status.label}</Badge></td>
                      <td className="px-4 py-3 text-xs text-gray-500 font-cairo">
                        {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/orders/${order.id}`} className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors inline-flex">
                          <ChevronLeft size={15} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
