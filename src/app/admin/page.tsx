import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, Users, Package, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

const STATUS_MAP = {
  PENDING: { label: 'في الانتظار', variant: 'warning' as const },
  CONFIRMED: { label: 'مؤكد', variant: 'info' as const },
  PROCESSING: { label: 'قيد التجهيز', variant: 'info' as const },
  SHIPPED: { label: 'تم الشحن', variant: 'info' as const },
  DELIVERED: { label: 'تم التوصيل', variant: 'success' as const },
  CANCELLED: { label: 'ملغي', variant: 'danger' as const },
}

export default async function AdminDashboard() {
  const [totalOrders, revenue, totalProducts, totalUsers, recentOrders, orderStats] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.product.count({ where: { active: true } }),
      prisma.user.count(),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { items: { take: 1 } },
      }),
      prisma.order.groupBy({ by: ['status'], _count: { status: true } }),
    ])

  const stats = [
    { label: 'إجمالي الطلبات', value: totalOrders, icon: ShoppingBag, color: 'bg-blue-500', change: '+12%' },
    { label: 'الإيرادات الكلية', value: formatPrice(revenue._sum.total || 0), icon: TrendingUp, color: 'bg-green-500', change: '+8%' },
    { label: 'المنتجات النشطة', value: totalProducts, icon: Package, color: 'bg-brand-500', change: '' },
    { label: 'المستخدمون', value: totalUsers, icon: Users, color: 'bg-amber-500', change: '+5%' },
  ]

  return (
    <div dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-cairo">لوحة التحكم</h1>
        <p className="text-gray-500 text-sm font-cairo mt-1">مرحباً، هذا ملخص أداء المتجر</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, change }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
                <Icon size={18} className="text-white" />
              </div>
              {change && <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full">{change}</span>}
            </div>
            <p className="text-2xl font-bold text-gray-900 font-cairo">{value}</p>
            <p className="text-sm text-gray-500 font-cairo mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b">
            <h2 className="font-bold text-gray-900 font-cairo">أحدث الطلبات</h2>
            <Link href="/admin/orders" className="text-sm text-brand-600 font-cairo hover:underline">
              عرض الكل
            </Link>
          </div>
          <div className="divide-y">
            {recentOrders.map((order) => {
              const status = STATUS_MAP[order.status]
              return (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 font-cairo">{order.customerName}</p>
                    <p className="text-xs text-gray-500 font-cairo">{order.orderNumber}</p>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                  <p className="font-bold text-sm text-gray-900 font-cairo shrink-0">{formatPrice(order.total)}</p>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Order status breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b">
            <h2 className="font-bold text-gray-900 font-cairo">توزيع الطلبات</h2>
          </div>
          <div className="p-5 space-y-3">
            {orderStats.map(({ status, _count }) => {
              const statusInfo = STATUS_MAP[status]
              return (
                <div key={status} className="flex items-center justify-between">
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  <span className="font-bold text-gray-900 text-sm">{_count.status}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
