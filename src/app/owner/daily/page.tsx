'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import {
  RefreshCw, ChevronRight, Store, Globe, ShoppingBag,
  Tag, Clock, User, CreditCard, Package,
} from 'lucide-react'

const PAY_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: 'كاش',
  VODAFONE_CASH: 'فودافون كاش',
  INSTAPAY: 'إنستاباي',
  BANK_TRANSFER: 'تحويل بنكي',
}

interface OrderItem { nameAr: string; price: number; quantity: number; size: string | null; color: string | null }
interface Order {
  id: string; orderNumber: string; customerName: string; source: 'POS' | 'ONLINE'
  paymentMethod: string; subtotal: number; discount: number; shipping: number; total: number
  notes: string | null; createdAt: string; staffName: string | null; items: OrderItem[]
}
interface StaffStat { name: string; orders: number; revenue: number }
interface Summary {
  totalRevenue: number; totalOrders: number; totalDiscount: number
  pos: { revenue: number; orders: number }
  online: { revenue: number; orders: number }
  staffBreakdown: StaffStat[]
}
interface DailyData { date: string; summary: Summary; orders: Order[] }

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
}
function formatDateAr(iso: string) {
  return new Date(iso).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export default function DailyReportPage() {
  const [data, setData] = useState<DailyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/owner/daily')
      const json = await res.json()
      setData(json)
      setLastRefresh(new Date())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const id = setInterval(load, 2 * 60 * 1000)
    return () => clearInterval(id)
  }, [load])

  const bg = 'linear-gradient(135deg, #0f0508 0%, #1a0a10 50%, #0f0508 100%)'
  const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(200,149,108,0.15)' }
  const brand = '#c8956c'

  return (
    <div className="min-h-screen" style={{ background: bg }} dir="rtl">
      {/* Header */}
      <header
        className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{ background: 'rgba(15,5,8,0.92)', borderBottom: '1px solid rgba(200,149,108,0.15)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-3">
          <Link href="/owner" className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors"
            style={{ background: 'rgba(200,149,108,0.12)', color: brand }}>
            <ChevronRight size={18} />
          </Link>
          <div>
            <p className="text-white font-bold font-cairo text-sm leading-none">تقرير اليوم</p>
            {data && <p className="text-[11px] font-cairo mt-0.5" style={{ color: brand }}>{formatDateAr(data.date)}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-cairo" style={{ color: '#4b5563' }}>
            {lastRefresh.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-cairo transition-all disabled:opacity-50"
            style={{ background: 'rgba(200,149,108,0.12)', color: brand, border: '1px solid rgba(200,149,108,0.2)' }}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            تحديث
          </button>
        </div>
      </header>

      <main className="px-4 py-5 max-w-xl mx-auto space-y-4">
        {loading && !data ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <div className="w-12 h-12 rounded-full border-4 animate-spin"
              style={{ borderColor: 'rgba(200,149,108,0.2)', borderTopColor: brand }} />
            <p className="text-sm font-cairo" style={{ color: '#9ca3af' }}>جاري تحميل مبيعات اليوم...</p>
          </div>
        ) : data ? (
          <>
            {/* Hero — total revenue */}
            <div className="rounded-2xl p-5 text-center" style={{ background: 'linear-gradient(135deg, rgba(200,149,108,0.15), rgba(139,94,82,0.08))', border: '1px solid rgba(200,149,108,0.3)' }}>
              <p className="text-xs font-cairo mb-1" style={{ color: '#9ca3af' }}>إجمالي مبيعات اليوم</p>
              <p className="text-4xl font-bold font-cairo text-white mb-1">{formatPrice(data.summary.totalRevenue)}</p>
              <p className="text-sm font-cairo" style={{ color: brand }}>{data.summary.totalOrders} فاتورة</p>
              {data.summary.totalDiscount > 0 && (
                <p className="text-xs font-cairo mt-1.5" style={{ color: '#f59e0b' }}>
                  إجمالي الخصومات: {formatPrice(data.summary.totalDiscount)}
                </p>
              )}
            </div>

            {/* POS vs Online */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl p-4" style={card}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
                    <Store size={14} className="text-emerald-400" />
                  </div>
                  <span className="text-xs font-cairo" style={{ color: '#9ca3af' }}>المحل</span>
                </div>
                <p className="text-lg font-bold text-white font-cairo">{formatPrice(data.summary.pos.revenue)}</p>
                <p className="text-xs font-cairo mt-0.5" style={{ color: '#6b7280' }}>{data.summary.pos.orders} فاتورة</p>
              </div>
              <div className="rounded-2xl p-4" style={card}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
                    <Globe size={14} className="text-indigo-400" />
                  </div>
                  <span className="text-xs font-cairo" style={{ color: '#9ca3af' }}>أونلاين</span>
                </div>
                <p className="text-lg font-bold text-white font-cairo">{formatPrice(data.summary.online.revenue)}</p>
                <p className="text-xs font-cairo mt-0.5" style={{ color: '#6b7280' }}>{data.summary.online.orders} طلب</p>
              </div>
            </div>

            {/* Staff breakdown */}
            {data.summary.staffBreakdown.length > 0 && (
              <div className="rounded-2xl p-4" style={card}>
                <div className="flex items-center gap-2 mb-3">
                  <User size={15} style={{ color: brand }} />
                  <h3 className="text-sm font-bold font-cairo text-white">أداء الموظفين اليوم</h3>
                </div>
                <div className="space-y-2">
                  {data.summary.staffBreakdown.map(s => (
                    <div key={s.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-cairo text-white"
                          style={{ background: 'rgba(200,149,108,0.2)' }}>
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-cairo font-semibold text-white">{s.name}</p>
                          <p className="text-[11px] font-cairo" style={{ color: '#6b7280' }}>{s.orders} فاتورة</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold font-cairo" style={{ color: brand }}>{formatPrice(s.revenue)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders list */}
            <div>
              <h3 className="text-sm font-bold font-cairo text-white mb-3 flex items-center gap-2">
                <ShoppingBag size={15} style={{ color: brand }} />
                فواتير اليوم
                {data.orders.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-cairo" style={{ background: 'rgba(200,149,108,0.15)', color: brand }}>
                    {data.orders.length}
                  </span>
                )}
              </h3>

              {data.orders.length === 0 ? (
                <div className="rounded-2xl p-10 text-center" style={card}>
                  <Package size={36} className="mx-auto mb-3" style={{ color: '#374151' }} />
                  <p className="text-sm font-cairo" style={{ color: '#6b7280' }}>لم تتم أي مبيعات اليوم بعد</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.orders.map(order => (
                    <div key={order.id} className="rounded-2xl overflow-hidden" style={card}>
                      {/* Order header */}
                      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-mono font-bold text-white">{order.orderNumber}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-cairo font-bold"
                              style={order.source === 'POS'
                                ? { background: 'rgba(16,185,129,0.15)', color: '#34d399' }
                                : { background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                              {order.source === 'POS' ? 'المحل' : 'أونلاين'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="flex items-center gap-1 text-[11px] font-cairo" style={{ color: '#9ca3af' }}>
                              <Clock size={11} />
                              {formatTime(order.createdAt)}
                            </span>
                            {order.source === 'POS' && order.staffName && (
                              <span className="flex items-center gap-1 text-[11px] font-cairo" style={{ color: '#34d399' }}>
                                <User size={11} />
                                {order.staffName}
                              </span>
                            )}
                            {order.source === 'ONLINE' && (
                              <span className="flex items-center gap-1 text-[11px] font-cairo" style={{ color: '#818cf8' }}>
                                <User size={11} />
                                {order.customerName}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded-lg font-cairo shrink-0"
                          style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af' }}>
                          {PAY_LABELS[order.paymentMethod] ?? order.paymentMethod}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="px-4 py-3 space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-cairo font-semibold text-white leading-tight">{item.nameAr}</p>
                              {(item.size || item.color) && (
                                <p className="text-[11px] font-cairo mt-0.5" style={{ color: '#6b7280' }}>
                                  {[item.size ? `م${item.size}` : '', item.color ?? ''].filter(Boolean).join(' · ')}
                                </p>
                              )}
                            </div>
                            <div className="text-left shrink-0 text-left">
                              <p className="text-xs font-cairo" style={{ color: '#9ca3af' }}>{item.quantity}×</p>
                              <p className="text-sm font-bold font-cairo text-white">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Totals footer */}
                      <div className="px-4 pb-4 pt-2 space-y-1"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-xs font-cairo">
                            <span className="flex items-center gap-1" style={{ color: '#f59e0b' }}>
                              <Tag size={11} />خصم
                            </span>
                            <span style={{ color: '#f59e0b' }}>- {formatPrice(order.discount)}</span>
                          </div>
                        )}
                        {order.shipping > 0 && (
                          <div className="flex justify-between text-xs font-cairo" style={{ color: '#6b7280' }}>
                            <span>شحن</span>
                            <span>{formatPrice(order.shipping)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-xs font-cairo" style={{ color: '#9ca3af' }}>الإجمالي</span>
                          <span className="text-base font-bold font-cairo" style={{ color: brand }}>{formatPrice(order.total)}</span>
                        </div>
                        {order.notes && (
                          <p className="text-[11px] font-cairo pt-1" style={{ color: '#4b5563' }}>
                            ملاحظة: {order.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center pt-2 pb-6">
              <p className="text-[11px] font-cairo" style={{ color: '#374151' }}>
                يتحدث كل دقيقتين تلقائياً · آخر تحديث {lastRefresh.toLocaleString('ar-EG')}
              </p>
            </div>
          </>
        ) : null}
      </main>
    </div>
  )
}
