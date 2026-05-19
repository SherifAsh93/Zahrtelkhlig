'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Phone, MapPin } from 'lucide-react'

const STATUS_MAP = {
  PENDING: { label: 'في الانتظار', variant: 'warning' as const },
  CONFIRMED: { label: 'مؤكد', variant: 'info' as const },
  PROCESSING: { label: 'قيد التجهيز', variant: 'info' as const },
  SHIPPED: { label: 'تم الشحن', variant: 'info' as const },
  DELIVERED: { label: 'تم التوصيل', variant: 'success' as const },
  CANCELLED: { label: 'ملغي', variant: 'danger' as const },
}

type OrderStatus = keyof typeof STATUS_MAP

interface OrderDetail {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  address: string
  city: string
  notes?: string
  status: OrderStatus
  paymentMethod: string
  subtotal: number
  shipping: number
  total: number
  createdAt: string
  items: Array<{
    id: string
    nameAr: string
    price: number
    quantity: number
    image?: string
  }>
  user?: { name: string; email: string }
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`).then((r) => r.json()).then(setOrder)
  }, [id])

  async function updateStatus(status: OrderStatus) {
    setUpdating(true)
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setOrder((o) => o ? { ...o, status } : o)
    setUpdating(false)
  }

  if (!order) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
    </div>
  )

  const status = STATUS_MAP[order.status]

  return (
    <div dir="rtl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/orders" className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
          <ArrowRight size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-cairo">{order.orderNumber}</h1>
          <p className="text-gray-500 text-sm font-cairo">{new Date(order.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <Badge variant={status.variant} className="mr-auto">{status.label}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 font-cairo mb-4">المنتجات</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="relative w-14 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                    <Image src={item.image || '/placeholder.jpg'} alt={item.nameAr} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold font-cairo">{item.nameAr}</p>
                    <p className="text-xs text-gray-500 font-cairo">x{item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <p className="font-bold font-cairo">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 space-y-2 text-sm font-cairo">
              <div className="flex justify-between text-gray-600"><span>المجموع الفرعي</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between text-gray-600"><span>الشحن</span><span>{order.shipping === 0 ? 'مجاني' : formatPrice(order.shipping)}</span></div>
              <div className="flex justify-between font-bold text-base"><span>الإجمالي</span><span className="text-brand-600">{formatPrice(order.total)}</span></div>
            </div>
          </div>

          {/* Update status */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 font-cairo mb-4">تحديث الحالة</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_MAP).map(([s, { label, variant }]) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s as OrderStatus)}
                  disabled={updating || order.status === s}
                  className={`px-3 py-2 rounded-xl text-sm font-cairo transition-colors disabled:opacity-50 ${
                    order.status === s ? 'bg-brand-600 text-white' : 'border border-gray-200 text-gray-700 hover:border-brand-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Customer info */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 font-cairo mb-4">بيانات العميل</h2>
            <div className="space-y-3 text-sm font-cairo">
              <p className="font-semibold text-gray-900">{order.customerName}</p>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={14} className="text-brand-400" />
                {order.customerPhone}
              </div>
              {order.customerEmail && <p className="text-gray-500">{order.customerEmail}</p>}
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin size={14} className="text-brand-400 mt-0.5 shrink-0" />
                {order.city} - {order.address}
              </div>
              {order.notes && (
                <div className="p-3 bg-amber-50 rounded-lg text-amber-700">
                  ملاحظة: {order.notes}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 font-cairo mb-3">الدفع</h2>
            <p className="text-sm font-cairo text-gray-700">
              {order.paymentMethod === 'CASH_ON_DELIVERY' ? '💵 الدفع عند الاستلام' : order.paymentMethod === 'VODAFONE_CASH' ? '📱 فودافون كاش' : '💳 إنستاباي'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
