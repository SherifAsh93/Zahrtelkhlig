'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Trash2, Eye, Store } from 'lucide-react'

const STATUS_MAP = {
  PENDING:    { label: 'في الانتظار', variant: 'warning' as const },
  CONFIRMED:  { label: 'مؤكد',        variant: 'info'    as const },
  PROCESSING: { label: 'قيد التجهيز', variant: 'info'    as const },
  SHIPPED:    { label: 'تم الشحن',    variant: 'info'    as const },
  DELIVERED:  { label: 'تم التوصيل', variant: 'success' as const },
  CANCELLED:  { label: 'ملغي',        variant: 'danger'  as const },
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  city: string
  total: number
  status: keyof typeof STATUS_MAP
  source: string
}

export default function RecentOrdersClient({ initial }: { initial: Order[] }) {
  const [orders, setOrders] = useState(initial)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  async function deleteOrder(id: string, orderNumber: string) {
    if (!confirm(`حذف الطلب ${orderNumber}؟`)) return
    setDeleting(id)
    const res = await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== id))
      router.refresh()
    }
    setDeleting(null)
  }

  if (orders.length === 0) {
    return <div className="p-8 text-center text-gray-400 font-cairo text-sm">لا توجد طلبات بعد</div>
  }

  return (
    <div className="divide-y">
      {orders.map((order) => {
        const status = STATUS_MAP[order.status]
        return (
          <div key={order.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="font-medium text-sm text-gray-900 font-cairo">{order.customerName}</p>
                {order.source === 'POS' && (
                  <span className="flex items-center gap-0.5 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-cairo">
                    <Store size={9} />محل
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-cairo">{order.orderNumber} • {order.city}</p>
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
            <p className="font-bold text-sm text-gray-900 font-cairo shrink-0">{formatPrice(order.total)}</p>
            <div className="flex items-center gap-1 shrink-0">
              <Link
                href={`/admin/orders/${order.id}`}
                className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                title="عرض التفاصيل"
              >
                <Eye size={15} />
              </Link>
              <button
                onClick={() => deleteOrder(order.id, order.orderNumber)}
                disabled={deleting === order.id}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                title="حذف"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
