import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, Users, Package, TrendingUp, ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'

const STATUS_MAP = {
  PENDING:    { label: 'في الانتظار', variant: 'warning' as const },
  CONFIRMED:  { label: 'مؤكد',        variant: 'info'    as const },
  PROCESSING: { label: 'قيد التجهيز', variant: 'info'    as const },
  SHIPPED:    { label: 'تم الشحن',    variant: 'info'    as const },
  DELIVERED:  { label: 'تم التوصيل', variant: 'success' as const },
  CANCELLED:  { label: 'ملغي',        variant: 'danger'  as const },
}

export default async function AdminDashboard() {
  const [totalOrders, revenue, totalProducts, totalUsers, pendingOrders, recentOrders] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.product.count({ where: { active: true } }),
      prisma.user.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { items: { take: 1 } },
      }),
    ])

  const stats = [
    { label: 'إجمالي الطلبات',  value: totalOrders,                            icon: ShoppingBag, color: 'bg-blue-500',  href: '/admin/orders' },
    { label: 'الإيرادات الكلية', value: formatPrice(revenue._sum.total || 0),  icon: TrendingUp,  color: 'bg-green-500', href: '/admin/orders' },
    { label: 'المنتجات النشطة', value: totalProducts,                          icon: Package,     color: 'bg-brand-500', href: '/admin/products' },
    { label: 'المستخدمون',      value: totalUsers,                             icon: Users,       color: 'bg-amber-500', href: '/admin/users' },
  ]

  return (
    <div dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-cairo">لوحة التحكم</h1>
        {pendingOrders > 0 && (
          <p className="text-amber-600 text-sm font-cairo mt-1 font-semibold">
            ⚠️ {pendingOrders} طلب في الانتظار يحتاج مراجعة
          </p>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-brand-200 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
                <Icon size={18} className="text-white" />
              </div>
              <ArrowLeft size={14} className="text-gray-300 group-hover:text-brand-400 transition-colors mt-1" />
            </div>
            <p className="text-2xl font-bold text-gray-900 font-cairo">{value}</p>
            <p className="text-sm text-gray-500 font-cairo mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-gray-900 font-cairo">أحدث الطلبات</h2>
          <Link href="/admin/orders" className="text-sm text-brand-600 font-cairo hover:underline flex items-center gap-1">
            عرض الكل <ArrowLeft size={13} />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-400 font-cairo text-sm">لا توجد طلبات بعد</div>
        ) : (
          <div className="divide-y">
            {recentOrders.map((order) => {
              const status = STATUS_MAP[order.status]
              return (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 font-cairo">{order.customerName}</p>
                    <p className="text-xs text-gray-500 font-cairo">{order.orderNumber} • {order.city}</p>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                  <p className="font-bold text-sm text-gray-900 font-cairo shrink-0">{formatPrice(order.total)}</p>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
