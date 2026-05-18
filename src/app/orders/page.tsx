import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { Package, Clock, ChevronLeft } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

const STATUS_MAP = {
  PENDING: { label: 'في الانتظار', variant: 'warning' as const },
  CONFIRMED: { label: 'مؤكد', variant: 'info' as const },
  PROCESSING: { label: 'قيد التجهيز', variant: 'info' as const },
  SHIPPED: { label: 'تم الشحن', variant: 'info' as const },
  DELIVERED: { label: 'تم التوصيل', variant: 'success' as const },
  CANCELLED: { label: 'ملغي', variant: 'danger' as const },
}

export default async function OrdersPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    include: { items: { take: 1 } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-10" dir="rtl">
      <h1 className="text-2xl font-bold text-gray-900 font-cairo mb-8 flex items-center gap-2">
        <Package size={24} className="text-rose-600" />
        طلباتي
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package size={64} className="text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 font-cairo mb-2">لا توجد طلبات</h2>
          <p className="text-gray-500 font-cairo mb-6">لم تقومي بأي طلبات بعد</p>
          <Link href="/products" className="px-6 py-2.5 bg-rose-600 text-white rounded-full font-cairo font-bold hover:bg-rose-700">
            تسوقي الآن
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_MAP[order.status]
            return (
              <Link key={order.id} href={`/orders/${order.id}`} className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-rose-200 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 font-cairo text-sm">{order.orderNumber}</span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-cairo mt-1">
                      <Clock size={12} />
                      {new Date(order.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <p className="text-sm text-gray-600 font-cairo mt-1">
                      {order.items.length > 0 && `${order.items[0]?.nameAr}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-rose-600 font-cairo">{formatPrice(order.total)}</span>
                    <ChevronLeft size={16} className="text-gray-400" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
