'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import {
  TrendingUp, TrendingDown, ShoppingBag, Users, RefreshCw,
  AlertTriangle, Store, Globe, Package, ChevronLeft, Bell,
  UserPlus, Truck, CalendarDays,
} from 'lucide-react'

const LOGO_URL = 'https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/logo.jpg'

interface Stats {
  today: { revenue: number; orders: number }
  week: { revenue: number; orders: number }
  month: {
    revenue: number; orders: number; growth: number | null
    online: { revenue: number; orders: number }
    pos: { revenue: number; orders: number }
  }
  total: { revenue: number; orders: number }
  topProducts: { productId: string; nameAr: string; image: string | null; _sum: { quantity: number }; _count: number }[]
  lowStock: { id: string; nameAr: string; sku: string | null; stock: number; season: string }[]
  trend: { date: string; revenue: number; online: number; pos: number }[]
  totalCustomers: number
}

interface ActivityItem {
  id: string
  type: 'order' | 'user' | 'stock'
  title: string
  subtitle: string
  time: string
  urgent: boolean
}

function StatCard({
  label, value, sub, icon: Icon, color, growth, href,
}: {
  label: string; value: string; sub?: string; icon: React.ElementType
  color: string; growth?: number | null; href?: string
}) {
  const inner = (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 h-full transition-all active:scale-[0.97]"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,149,108,0.15)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-cairo font-medium" style={{ color: '#9ca3af' }}>{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + '22' }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white font-cairo">{value}</p>
        {sub && <p className="text-xs font-cairo mt-0.5" style={{ color: '#9ca3af' }}>{sub}</p>}
      </div>
      {growth !== undefined && growth !== null && (
        <div className={`flex items-center gap-1 text-xs font-cairo ${growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {growth >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>{Math.abs(growth).toFixed(1)}% مقارنة بالشهر الماضي</span>
        </div>
      )}
      {href && (
        <div className="flex items-center gap-1 text-xs font-cairo mt-auto pt-1" style={{ color: '#c8956c' }}>
          <span>عرض التفاصيل</span>
          <ChevronLeft size={12} />
        </div>
      )}
    </div>
  )

  if (href) return <Link href={href} className="block">{inner}</Link>
  return inner
}

function TrendChart({ data }: { data: Stats['trend'] }) {
  const [view, setView] = useState<'7' | '30'>('30')
  const displayed = view === '7' ? data.slice(-7) : data
  const maxRevenue = Math.max(...displayed.map(d => d.revenue), 1)

  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,149,108,0.15)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold font-cairo">المبيعات اليومية</h3>
        <div className="flex gap-1">
          {(['7', '30'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-2.5 py-1 rounded-lg text-xs font-cairo transition-all"
              style={view === v
                ? { background: 'linear-gradient(135deg, #c8956c, #8b5e52)', color: '#fff' }
                : { background: 'rgba(255,255,255,0.08)', color: '#9ca3af' }}
            >
              {v === '7' ? '٧ أيام' : '٣٠ يوم'}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-end gap-1 h-32">
        {displayed.map((d, i) => {
          const heightPct = maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0
          const isToday = i === displayed.length - 1
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                <div className="bg-gray-900 text-white text-xs font-cairo px-2 py-1 rounded-lg whitespace-nowrap border border-gray-700">
                  {d.revenue > 0 ? formatPrice(d.revenue) : 'لا مبيعات'}
                </div>
              </div>
              <div className="w-full rounded-t-lg transition-all" style={{
                height: `${Math.max(heightPct, d.revenue > 0 ? 4 : 1)}%`,
                background: isToday
                  ? 'linear-gradient(180deg, #c8956c, #8b5e52)'
                  : d.revenue > 0
                    ? 'rgba(200,149,108,0.6)'
                    : 'rgba(255,255,255,0.05)',
              }} />
              {view === '7' && (
                <span className="text-[9px] font-cairo" style={{ color: '#6b7280' }}>
                  {new Date(d.date).toLocaleDateString('ar-EG', { weekday: 'narrow' })}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SourceSplit({ month }: { month: Stats['month'] }) {
  const total = month.online.revenue + month.pos.revenue
  const onlinePct = total > 0 ? (month.online.revenue / total * 100) : 50
  const posPct = 100 - onlinePct

  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,149,108,0.15)' }}>
      <h3 className="text-white font-bold font-cairo mb-4">مصادر المبيعات — هذا الشهر</h3>
      <div className="flex rounded-xl overflow-hidden h-4 mb-4">
        <div className="transition-all" style={{ width: `${onlinePct}%`, background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }} />
        <div className="transition-all" style={{ width: `${posPct}%`, background: 'linear-gradient(90deg, #10b981, #059669)' }} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)' }}>
            <Globe size={16} className="text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-cairo" style={{ color: '#9ca3af' }}>الموقع</p>
            <p className="text-sm font-bold text-white font-cairo">{formatPrice(month.online.revenue)}</p>
            <p className="text-xs font-cairo" style={{ color: '#6b7280' }}>{month.online.orders} طلب · {onlinePct.toFixed(0)}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
            <Store size={16} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-cairo" style={{ color: '#9ca3af' }}>المحل</p>
            <p className="text-sm font-bold text-white font-cairo">{formatPrice(month.pos.revenue)}</p>
            <p className="text-xs font-cairo" style={{ color: '#6b7280' }}>{month.pos.orders} طلب · {posPct.toFixed(0)}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'الآن'
  if (mins < 60) return `منذ ${mins} دقيقة`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `منذ ${hrs} ساعة`
  return `منذ ${Math.floor(hrs / 24)} يوم`
}

function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <Bell size={28} className="text-gray-600" />
        <p className="text-sm font-cairo" style={{ color: '#6b7280' }}>لا يوجد نشاط بعد</p>
      </div>
    )
  }

  const iconMap = {
    order: ShoppingBag,
    user: UserPlus,
    stock: AlertTriangle,
  }
  const colorMap = {
    order: '#c8956c',
    user: '#6366f1',
    stock: '#f59e0b',
  }

  return (
    <div className="space-y-1">
      {items.map(item => {
        const Icon = iconMap[item.type]
        const color = item.urgent ? '#ef4444' : colorMap[item.type]
        return (
          <div
            key={item.id}
            className="flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors"
            style={{ background: item.urgent ? 'rgba(239,68,68,0.05)' : 'transparent' }}
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: color + '18' }}
            >
              <Icon size={15} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-cairo font-semibold text-white leading-snug">{item.title}</p>
              <p className="text-xs font-cairo mt-0.5" style={{ color: '#9ca3af' }}>{item.subtitle}</p>
            </div>
            <span className="text-[11px] font-cairo shrink-0 mt-1" style={{ color: '#4b5563' }}>
              {item.type !== 'stock' ? timeAgo(item.time) : ''}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function OwnerPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, activityRes] = await Promise.all([
        fetch('/api/owner/stats'),
        fetch('/api/owner/activity'),
      ])
      const statsData = await statsRes.json()
      const activityData = await activityRes.json()
      setStats(statsData)
      setActivity(activityData.items || [])
      setLastRefresh(new Date())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const interval = setInterval(load, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [load])

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #0f0508 0%, #1a0a10 50%, #0f0508 100%)' }}
      dir="rtl"
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 px-4 sm:px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(15,5,8,0.9)', borderBottom: '1px solid rgba(200,149,108,0.15)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-3">
          <img
            src={LOGO_URL}
            alt="زهرة الخليج"
            className="w-9 h-9 rounded-xl object-cover shrink-0"
            style={{ border: '1px solid rgba(200,149,108,0.3)' }}
          />
          <div>
            <p className="text-white font-bold font-cairo text-sm leading-none">مرحباً أشرف</p>
            <p className="text-xs font-cairo mt-0.5" style={{ color: '#c8956c' }}>زهرة الخليج</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className="hidden sm:block text-xs font-cairo" style={{ color: '#6b7280' }}>
            آخر تحديث: {lastRefresh.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-cairo transition-all disabled:opacity-50"
            style={{ background: 'rgba(200,149,108,0.15)', color: '#c8956c', border: '1px solid rgba(200,149,108,0.25)' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            تحديث
          </button>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6 max-w-6xl mx-auto space-y-6">
        {loading && !stats ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'rgba(200,149,108,0.3)', borderTopColor: '#c8956c' }} />
            <p className="text-gray-400 font-cairo">جاري تحميل التقارير...</p>
          </div>
        ) : stats ? (
          <>
            {/* KPI Cards — all clickable */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard
                label="مبيعات اليوم"
                value={formatPrice(stats.today.revenue)}
                sub={`${stats.today.orders} طلب`}
                icon={ShoppingBag}
                color="#c8956c"
                href="/owner/orders?period=today"
              />
              <StatCard
                label="مبيعات الأسبوع"
                value={formatPrice(stats.week.revenue)}
                sub={`${stats.week.orders} طلب`}
                icon={TrendingUp}
                color="#6366f1"
                href="/owner/orders?period=week"
              />
              <StatCard
                label="مبيعات الشهر"
                value={formatPrice(stats.month.revenue)}
                sub={`${stats.month.orders} طلب`}
                icon={TrendingUp}
                color="#10b981"
                growth={stats.month.growth}
                href="/owner/orders?period=month"
              />
              <StatCard
                label="إجمالي الكل"
                value={formatPrice(stats.total.revenue)}
                sub={`${stats.total.orders} طلب · ${stats.totalCustomers} عميل`}
                icon={Users}
                color="#f59e0b"
                href="/owner/orders?period=all"
              />
            </div>

            {/* Daily report — most important shortcut */}
            <Link
              href="/owner/daily"
              className="rounded-2xl p-4 flex items-center justify-between gap-3 transition-all active:scale-[0.99]"
              style={{ background: 'linear-gradient(135deg, rgba(200,149,108,0.18), rgba(139,94,82,0.10))', border: '1px solid rgba(200,149,108,0.4)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(200,149,108,0.2)' }}>
                  <CalendarDays size={22} style={{ color: '#c8956c' }} />
                </div>
                <div>
                  <p className="text-base font-bold font-cairo text-white">تقرير اليوم</p>
                  <p className="text-xs font-cairo mt-0.5" style={{ color: '#9ca3af' }}>كل مبيعات اليوم · الموظفين · الخصومات</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-base font-bold font-cairo" style={{ color: '#c8956c' }}>{formatPrice(stats.today.revenue)}</span>
                <ChevronLeft size={18} style={{ color: '#c8956c' }} />
              </div>
            </Link>

            {/* Products overview nav card */}
            <Link
              href="/owner/products"
              className="rounded-2xl p-4 flex items-center justify-between gap-3 transition-all active:scale-[0.99]"
              style={{ background: 'rgba(200,149,108,0.07)', border: '1px solid rgba(200,149,108,0.25)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(200,149,108,0.15)' }}>
                  <Package size={20} style={{ color: '#c8956c' }} />
                </div>
                <div>
                  <p className="text-sm font-bold font-cairo text-white">جميع المنتجات</p>
                  <p className="text-xs font-cairo mt-0.5" style={{ color: '#9ca3af' }}>استعرض وتتبع كل منتجاتك بالصور والمخزون</p>
                </div>
              </div>
              <ChevronLeft size={18} style={{ color: '#c8956c' }} className="shrink-0" />
            </Link>

            {/* Trend + Source */}
            <div className="grid lg:grid-cols-2 gap-4">
              <TrendChart data={stats.trend} />
              <SourceSplit month={stats.month} />
            </div>

            {/* Top Products */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,149,108,0.15)' }}>
              <div className="flex items-center gap-2 mb-4">
                <Package size={18} style={{ color: '#c8956c' }} />
                <h3 className="text-white font-bold font-cairo">أكثر المنتجات مبيعاً</h3>
              </div>
              {stats.topProducts.length === 0 ? (
                <p className="text-center text-gray-500 font-cairo py-6 text-sm">لا توجد مبيعات بعد</p>
              ) : (
                <div className="space-y-1">
                  {stats.topProducts.map((p, i) => {
                    const maxQty = stats.topProducts[0]._sum.quantity ?? 1
                    const pct = ((p._sum.quantity ?? 0) / maxQty) * 100
                    return (
                      <Link
                        key={p.productId}
                        href={`/owner/products/${p.productId}`}
                        className="flex items-center gap-3 rounded-xl p-2 -mx-2 transition-colors"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <span className="text-xs font-bold font-cairo w-5 text-center shrink-0" style={{ color: i < 3 ? '#c8956c' : '#4b5563' }}>
                          {i + 1}
                        </span>
                        {p.image ? (
                          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-gray-800">
                            <Image src={p.image} alt={p.nameAr} width={40} height={40} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center" style={{ background: 'rgba(200,149,108,0.1)' }}>
                            <Package size={16} style={{ color: '#c8956c' }} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-cairo font-semibold text-white truncate">{p.nameAr}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #c8956c, #8b5e52)' }}
                              />
                            </div>
                            <span className="text-xs font-cairo shrink-0" style={{ color: '#9ca3af' }}>
                              {p._sum.quantity ?? 0} قطعة
                            </span>
                          </div>
                        </div>
                        <ChevronLeft size={15} className="shrink-0" style={{ color: '#4b5563' }} />
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Low Stock — full width */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,149,108,0.15)' }}>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle size={18} className="text-amber-400" />
                <h3 className="text-white font-bold font-cairo">تنبيهات المخزون</h3>
                {stats.lowStock.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-cairo font-bold bg-amber-900/40 text-amber-400">
                    {stats.lowStock.length}
                  </span>
                )}
              </div>
              {stats.lowStock.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 gap-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
                    <Package size={18} className="text-emerald-400" />
                  </div>
                  <p className="text-sm font-cairo" style={{ color: '#9ca3af' }}>المخزون في حالة جيدة</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-1">
                  {stats.lowStock.map(p => (
                    <Link
                      key={p.id}
                      href={`/owner/products/${p.id}`}
                      className="flex items-center justify-between gap-2 py-2 px-2 rounded-xl transition-colors"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: p.stock === 0 ? '#ef4444' : p.stock < 5 ? '#f59e0b' : '#10b981' }}
                        />
                        <span className="text-sm font-cairo text-white truncate">{p.nameAr}</span>
                        {p.sku && <span className="text-xs font-cairo shrink-0" style={{ color: '#6b7280' }}>#{p.sku}</span>}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className="text-xs font-bold font-cairo px-2 py-0.5 rounded-lg"
                          style={{
                            background: p.stock === 0 ? 'rgba(239,68,68,0.15)' : p.stock < 5 ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                            color: p.stock === 0 ? '#f87171' : p.stock < 5 ? '#fbbf24' : '#34d399',
                          }}
                        >
                          {p.stock === 0 ? 'نفد' : `${p.stock} قطعة`}
                        </span>
                        <ChevronLeft size={14} style={{ color: '#4b5563' }} />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Feed */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,149,108,0.15)' }}>
              <div className="flex items-center gap-2 mb-4">
                <Bell size={18} style={{ color: '#c8956c' }} />
                <h3 className="text-white font-bold font-cairo">نشاط حديث</h3>
                {activity.filter(a => a.urgent).length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-cairo font-bold bg-red-900/40 text-red-400">
                    {activity.filter(a => a.urgent).length} عاجل
                  </span>
                )}
              </div>
              <ActivityFeed items={activity} />
            </div>

            {/* Footer */}
            <div className="text-center py-4">
              <p className="text-xs font-cairo" style={{ color: '#374151' }}>
                البيانات تتحدث تلقائياً كل ٥ دقائق · آخر تحديث {lastRefresh.toLocaleString('ar-EG')}
              </p>
            </div>
          </>
        ) : null}
      </main>
    </div>
  )
}
