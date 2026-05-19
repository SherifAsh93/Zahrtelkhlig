import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle2, Package, Truck, MapPin, Phone, Clock } from 'lucide-react'

const STATUS_MAP = {
  PENDING: { label: 'في الانتظار', variant: 'warning' as const, step: 1 },
  CONFIRMED: { label: 'مؤكد', variant: 'info' as const, step: 2 },
  PROCESSING: { label: 'قيد التجهيز', variant: 'info' as const, step: 2 },
  SHIPPED: { label: 'تم الشحن', variant: 'info' as const, step: 3 },
  DELIVERED: { label: 'تم التوصيل', variant: 'success' as const, step: 4 },
  CANCELLED: { label: 'ملغي', variant: 'danger' as const, step: 0 },
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ success?: string }>
}) {
  const { id } = await params
  const { success } = await searchParams

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  })
  if (!order) notFound()

  const status = STATUS_MAP[order.status]

  return (
    <div className="max-w-4xl mx-auto px-4 py-10" dir="rtl">
      {success === 'true' && (
        <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-2xl text-center">
          <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-green-800 font-cairo mb-2">تم تأكيد طلبك بنجاح!</h2>
          <p className="text-green-600 font-cairo">سنتواصل معك قريباً لتأكيد التوصيل</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-cairo">طلب {order.orderNumber}</h1>
          <p className="text-gray-500 text-sm font-cairo mt-1 flex items-center gap-1">
            <Clock size={14} />
            {new Date(order.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <Badge variant={status.variant} className="text-sm px-3 py-1">{status.label}</Badge>
      </div>

      {/* Tracking steps */}
      {order.status !== 'CANCELLED' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-bold text-gray-900 font-cairo mb-6">تتبع الطلب</h2>
          <div className="flex items-center justify-between">
            {[
              { label: 'تم الاستلام', icon: Package, step: 1 },
              { label: 'قيد التجهيز', icon: Package, step: 2 },
              { label: 'تم الشحن', icon: Truck, step: 3 },
              { label: 'تم التوصيل', icon: CheckCircle2, step: 4 },
            ].map((s, i) => (
              <div key={s.label} className="flex-1 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                  status.step >= s.step ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <s.icon size={18} />
                </div>
                <p className="text-xs text-center font-cairo text-gray-600">{s.label}</p>
                {i < 3 && (
                  <div className={`absolute h-0.5 w-full ${status.step > s.step ? 'bg-brand-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order items */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 font-cairo mb-4">المنتجات</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="relative w-14 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                    <Image src={item.image || '/placeholder.jpg'} alt={item.nameAr} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold font-cairo text-gray-900 line-clamp-2">{item.nameAr}</p>
                    <p className="text-xs text-gray-500 font-cairo">x{item.quantity}</p>
                  </div>
                  <p className="font-bold font-cairo text-gray-900 shrink-0">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 space-y-2 text-sm font-cairo">
              <div className="flex justify-between text-gray-600">
                <span>المجموع الفرعي</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>الشحن</span>
                <span>{order.shipping === 0 ? 'مجاني' : formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between font-bold text-base">
                <span>الإجمالي</span>
                <span className="text-brand-600">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer info */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 font-cairo mb-4">بيانات الشحن</h2>
            <div className="space-y-3 text-sm font-cairo">
              <div className="flex items-start gap-2">
                <Package size={16} className="text-brand-400 mt-0.5 shrink-0" />
                <span className="text-gray-700">{order.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-brand-400 shrink-0" />
                <span className="text-gray-700">{order.customerPhone}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-brand-400 mt-0.5 shrink-0" />
                <span className="text-gray-700">{order.city} - {order.address}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 font-cairo mb-3">طريقة الدفع</h2>
            <p className="text-sm font-cairo text-gray-700">
              {order.paymentMethod === 'CASH_ON_DELIVERY' ? '💵 الدفع عند الاستلام' : order.paymentMethod === 'VODAFONE_CASH' ? '📱 فودافون كاش' : '💳 إنستاباي'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link href="/orders" className="text-sm text-brand-600 font-cairo hover:underline">
          ← العودة إلى طلباتي
        </Link>
      </div>
    </div>
  )
}
