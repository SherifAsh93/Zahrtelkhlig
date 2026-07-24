'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import {
  TrendingUp, TrendingDown, ShoppingBag, Users, RefreshCw,
  Store, Globe, Package, ChevronLeft, Bell,
  UserPlus, CalendarDays, Zap,
} from 'lucide-react'

const LOGO_URL = 'https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/logo.jpg'

const S  = '#f1f5f9'
const W  = '#ffffff'
const BD = '#e2e8f0'
const T1 = '#0f172a'
const T2 = '#475569'
const T3 = '#94a3b8'
const BR = '#c8826a'

interface Stats {
  today: { revenue: number; orders: number }
  week:  { revenue: number; orders: number }
  month: { revenue: number; orders: number; growth: number | null; online: { revenue: number; orders: number }; pos: { revenue: number; orders: number } }
  total: { revenue: number; orders: number }
  topProducts: { productId: string; nameAr: string; image: string | null; _sum: { quantity: number }; _count: number }[]
  allProducts:  { id: string; nameAr: string; sku: string | null; stock: number }[]
  trend: { date: string; revenue: number; online: number; pos: number }[]
  totalCustomers: number
}

interface ActivityItem {
  id: string
  type: 'order' | 'user'
  buyer: string | null
  title: string
  subtitle: string
  time: string
  urgent: boolean
}

function card() {
  return { background: W, border: `1px solid ${BD}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', borderRadius: 16 }
}

function StatCard({ label, value, sub, icon: Icon, color, growth, href }: {
  label: string; value: string; sub?: string; icon: React.ElementType
  color: string; growth?: number | null; href?: string
}) {
  const inner = (
    <div className="rounded-2xl p-4 flex flex-col gap-2 h-full transition-all active:scale-[0.97]" style={card()}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: T2 }}>{label}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: color + '18' }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <p className="text-xl font-bold font-cairo" style={{ color: T1 }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: T3 }}>{sub}</p>}
      {growth !== undefined && growth !== null && (
        <div className={`flex items-center gap-1 text-xs ${growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{Math.abs(growth).toFixed(1)}% مقارنة بالشهر الماضي</span>
        </div>
      )}
      {href && (
        <div className="flex items-center gap-1 text-xs mt-auto pt-1" style={{ color: BR }}>
          <span>التفاصيل</span><ChevronLeft size={11} />
        </div>
      )}
    </div>
  )
  if (href) return <Link href={href} className="block">{inner}</Link>
  return inner
}

function TrendChart({ data }: { data: Stats['trend'] }) {
  const [view, setView] = useState<'7' | '30'>('7')
  const displayed = view === '7' ? data.slice(-7) : data
  const maxRevenue = Math.max(...displayed.map(d => d.revenue), 1)

  return (
    <div className="rounded-2xl p-4" style={card()}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm" style={{ color: T1 }}>المبيعات اليومية</h3>
        <div className="flex gap-1">
          {(['7', '30'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className="px-2.5 py-1 rounded-lg text-xs transition-all font-cairo"
              style={view === v ? { background: BR, color: '#fff' } : { background: S, color: T2 }}>
              {v === '7' ? '٧ أيام' : '٣٠ يوم'}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-end gap-1 h-28">
        {displayed.map((d, i) => {
          const h = maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0
          const isToday = i === displayed.length - 1
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex z-10 pointer-events-none">
                <div className="bg-gray-800 text-white text-[10px] font-cairo px-2 py-0.5 rounded-lg whitespace-nowrap">
                  {d.revenue > 0 ? formatPrice(d.revenue) : '—'}
                </div>
              </div>
              <div className="w-full rounded-t-md transition-all" style={{
                height: `${Math.max(h, d.revenue > 0 ? 6 : 2)}%`,
                background: isToday ? BR : d.revenue > 0 ? BR + '55' : BD,
              }} />
              {view === '7' && (
                <span className="text-[9px] font-cairo" style={{ color: T3 }}>
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
    <div className="rounded-2xl p-4" style={card()}>
      <h3 className="font-bold text-sm mb-3" style={{ color: T1 }}>المبيعات هذا الشهر</h3>
      <div className="flex rounded-xl overflow-hidden h-3 mb-3">
        <div style={{ width: `${onlinePct}%`, background: '#6366f1' }} />
        <div style={{ width: `${posPct}%`, background: '#16a34a' }} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#ede9fe' }}>
            <Globe size={14} style={{ color: '#6366f1' }} />
          </div>
          <div>
            <p className="text-[11px]" style={{ color: T3 }}>الموقع · {onlinePct.toFixed(0)}%</p>
            <p className="text-sm font-bold font-cairo" style={{ color: T1 }}>{formatPrice(month.online.revenue)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#dcfce7' }}>
            <Store size={14} style={{ color: '#16a34a' }} />
          </div>
          <div>
            <p className="text-[11px]" style={{ color: T3 }}>المحل · {posPct.toFixed(0)}%</p>
            <p className="text-sm font-bold font-cairo" style={{ color: T1 }}>{formatPrice(month.pos.revenue)}</p>
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
  if (mins < 60) return `منذ ${mins} د`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `منذ ${hrs} س`
  return `منذ ${Math.floor(hrs / 24)} يوم`
}

function ActivityFeed({ items }: { items: ActivityItem[] }) {
  const iconMap = { order: ShoppingBag, user: UserPlus }
  const colorMap = { order: BR, user: '#6366f1' }
  if (items.length === 0) return (
    <div className="py-8 flex flex-col items-center gap-2">
      <Bell size={24} style={{ color: T3 }} />
      <p className="text-sm" style={{ color: T3 }}>لا يوجد نشاط بعد</p>
    </div>
  )
  return (
    <div className="divide-y" style={{ borderColor: BD }}>
      {items.map(item => {
        const Icon = iconMap[item.type]
        const color = item.urgent ? '#dc2626' : colorMap[item.type]
        return (
          <div key={item.id} className="flex items-start gap-3 py-3 rounded-xl px-1"
            style={{ background: item.urgent ? '#fef2f2' : 'transparent' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: color + '18' }}>
              <Icon size={14} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-snug" style={{ color: T1 }}>{item.title}</p>
              <p className="text-xs mt-0.5 leading-relaxed" style={{ color: T3 }}>{item.subtitle}</p>
            </div>
            <span className="text-[11px] shrink-0 mt-1" style={{ color: T3 }}>
              {timeAgo(item.time)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function OwnerPage() {
  const [stats, setStats]             = useState<Stats | null>(null)
  const [activity, setActivity]       = useState<ActivityItem[]>([])
  const [loading, setLoading]         = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [newTx, setNewTx]             = useState(false)
  const latestIdRef                   = useRef<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [sRes, aRes] = await Promise.all([fetch('/api/owner/stats'), fetch('/api/owner/activity')])
      setStats(await sRes.json())
      setActivity((await aRes.json()).items || [])
      setLastRefresh(new Date())
      setNewTx(false)
    } finally { setLoading(false) }
  }, [])

  // Smart polling: lightweight check every 15 s, full reload only on new order
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch('/api/owner/latest')
        const { id } = await res.json()
        if (latestIdRef.current === null) {
          latestIdRef.current = id
        } else if (id && id !== latestIdRef.current) {
          latestIdRef.current = id
          setNewTx(true)
          load()
        }
      } catch { /* ignore network errors */ }
    }
    const t = setInterval(poll, 15_000)
    return () => clearInterval(t)
  }, [load])

  // Refresh when tab becomes visible again
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') load() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [load])

  useEffect(() => { load() }, [load])

  return (
    <div className="min-h-[100dvh] font-cairo" style={{ background: S }} dir="rtl">

      {/* Header */}
      <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{ background: W, borderBottom: `1px solid ${BD}`, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center gap-3">
          <img src={LOGO_URL} alt="زهرة الخليج"
            className="w-9 h-9 rounded-xl object-cover shrink-0"
            style={{ border: `1px solid ${BD}` }} />
          <div>
            <p className="font-bold text-sm leading-none" style={{ color: T1 }}>مرحباً أشرف</p>
            <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: BR }}>
              زهرة الخليج
              {newTx && (
                <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: '#dcfce7', color: '#16a34a' }}>
                  <Zap size={9} />جديد
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className="hidden sm:block text-xs" style={{ color: T3 }}>
            {lastRefresh.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all disabled:opacity-50"
            style={{ background: '#fef5f1', color: BR, border: `1px solid #f0d8cc` }}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            تحديث
          </button>
        </div>
      </header>

      <main className="px-4 py-5 max-w-2xl mx-auto space-y-4">
        {loading && !stats ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: BR + '30', borderTopColor: BR }} />
            <p className="text-sm" style={{ color: T3 }}>جاري تحميل التقارير...</p>
          </div>
        ) : stats ? (
          <>
            {/* KPI grid */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="مبيعات اليوم"   value={formatPrice(stats.today.revenue)} sub={`${stats.today.orders} طلب`} icon={ShoppingBag} color={BR}      href="/owner/orders?period=today" />
              <StatCard label="مبيعات الأسبوع" value={formatPrice(stats.week.revenue)}  sub={`${stats.week.orders} طلب`}  icon={TrendingUp}  color="#6366f1" href="/owner/orders?period=week" />
              <StatCard label="مبيعات الشهر"   value={formatPrice(stats.month.revenue)} sub={`${stats.month.orders} طلب`} icon={TrendingUp}  color="#16a34a" growth={stats.month.growth} href="/owner/orders?period=month" />
              <StatCard label="إجمالي الكل"    value={formatPrice(stats.total.revenue)} sub={`${stats.total.orders} طلب`} icon={Users}       color="#f59e0b" href="/owner/orders?period=all" />
            </div>

            {/* Daily report shortcut */}
            <Link href="/owner/daily"
              className="rounded-2xl p-4 flex items-center justify-between gap-3 transition-all active:scale-[0.99]"
              style={{ background: 'linear-gradient(135deg, #16a34a, #059669)', boxShadow: '0 4px 14px rgba(22,163,74,0.3)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <CalendarDays size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-white">تقرير اليوم</p>
                  <p className="text-xs mt-0.5 text-green-100">مبيعات المحل · الموظفين · الخصومات</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-bold text-white">{formatPrice(stats.today.revenue)}</span>
                <ChevronLeft size={18} className="text-green-200" />
              </div>
            </Link>

            {/* Products link */}
            <Link href="/owner/products"
              className="rounded-2xl p-4 flex items-center justify-between gap-3 transition-all active:scale-[0.99]"
              style={card()}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: '#fef5f1' }}>
                  <Package size={18} style={{ color: BR }} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: T1 }}>جميع المنتجات</p>
                  <p className="text-xs mt-0.5" style={{ color: T3 }}>استعرض المخزون والصور</p>
                </div>
              </div>
              <ChevronLeft size={17} style={{ color: T3 }} />
            </Link>

            {/* Trend + Source */}
            <div className="grid sm:grid-cols-2 gap-4">
              <TrendChart data={stats.trend} />
              <SourceSplit month={stats.month} />
            </div>

            {/* Top selling */}
            {stats.topProducts.length > 0 && (
              <div className="rounded-2xl p-4" style={card()}>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp size={16} style={{ color: BR }} />
                  <h3 className="font-bold text-sm" style={{ color: T1 }}>أكثر المنتجات مبيعاً</h3>
                </div>
                <div className="space-y-1">
                  {stats.topProducts.slice(0, 5).map((p, i) => {
                    const maxQty = stats.topProducts[0]._sum.quantity ?? 1
                    const pct = ((p._sum.quantity ?? 0) / maxQty) * 100
                    return (
                      <Link key={p.productId} href={`/owner/products/${p.productId}`}
                        className="flex items-center gap-3 rounded-xl p-2 -mx-2 transition-colors active:bg-slate-50">
                        <span className="text-xs font-bold w-5 text-center shrink-0"
                          style={{ color: i < 3 ? BR : T3 }}>{i + 1}</span>
                        {p.image ? (
                          <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0" style={{ background: S }}>
                            <Image src={p.image} alt={p.nameAr} width={36} height={36} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center" style={{ background: '#fef5f1' }}>
                            <Package size={14} style={{ color: BR }} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: T1 }}>{p.nameAr}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: BD }}>
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: BR }} />
                            </div>
                            <span className="text-[11px] shrink-0" style={{ color: T3 }}>{p._sum.quantity ?? 0} قطعة</span>
                          </div>
                        </div>
                        <ChevronLeft size={14} style={{ color: T3 }} />
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Inventory — all products with stock per model */}
            <div className="rounded-2xl p-4" style={card()}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Package size={16} style={{ color: BR }} />
                  <h3 className="font-bold text-sm" style={{ color: T1 }}>المخزون الحالي</h3>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: S, color: T2 }}>
                  {stats.allProducts.length} موديل
                </span>
              </div>
              {stats.allProducts.length === 0 ? (
                <p className="text-center text-sm py-5" style={{ color: T3 }}>لا توجد منتجات</p>
              ) : (
                <div className="divide-y" style={{ borderColor: BD }}>
                  {stats.allProducts.map(p => (
                    <Link key={p.id} href={`/owner/products/${p.id}`}
                      className="flex items-center justify-between py-2.5 gap-3 active:bg-slate-50 -mx-1 px-1 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug" style={{ color: T1 }}>{p.nameAr}</p>
                        {p.sku && <p className="text-[11px] mt-0.5" style={{ color: T3 }}>#{p.sku}</p>}
                      </div>
                      <span className="text-sm font-bold px-3 py-1 rounded-full shrink-0 min-w-[52px] text-center"
                        style={{
                          background: p.stock === 0 ? '#fef2f2' : p.stock < 5 ? '#fffbeb' : p.stock < 15 ? '#f0fdf4' : S,
                          color:      p.stock === 0 ? '#dc2626' : p.stock < 5 ? '#d97706' : p.stock < 15 ? '#16a34a' : T2,
                        }}>
                        {p.stock === 0 ? 'نفد' : p.stock}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Activity — buyer name prominent */}
            <div className="rounded-2xl p-4" style={card()}>
              <div className="flex items-center gap-2 mb-1">
                <Bell size={16} style={{ color: BR }} />
                <h3 className="font-bold text-sm" style={{ color: T1 }}>نشاط حديث</h3>
                {activity.filter(a => a.urgent).length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-red-50 text-red-600 border border-red-200">
                    {activity.filter(a => a.urgent).length} عاجل
                  </span>
                )}
              </div>
              <ActivityFeed items={activity} />
            </div>

            <p className="text-center text-xs pb-6" style={{ color: T3 }}>
              يتحدث تلقائياً عند كل عملية · آخر تحديث {lastRefresh.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </>
        ) : null}
      </main>
    </div>
  )
}
