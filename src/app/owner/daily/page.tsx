'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { RefreshCw, ChevronRight, Tag, Clock, User, Package, Store } from 'lucide-react'

const PAY_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: 'كاش',
  VODAFONE_CASH: 'فودافون كاش',
  INSTAPAY: 'إنستاباي',
  BANK_TRANSFER: 'تحويل بنكي',
}
const PAY_STYLE: Record<string, { bg: string; color: string }> = {
  CASH_ON_DELIVERY: { bg: '#dcfce7', color: '#15803d' },
  VODAFONE_CASH:    { bg: '#fef9c3', color: '#854d0e' },
  INSTAPAY:         { bg: '#dbeafe', color: '#1d4ed8' },
  BANK_TRANSFER:    { bg: '#ede9fe', color: '#6d28d9' },
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

export default function DailyReportPage() {
  const [data, setData] = useState<DailyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await fetch('/api/owner/daily')
      setData(await res.json())
      setLastRefresh(new Date())
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const id = setInterval(() => load(true), 2 * 60 * 1000)
    return () => clearInterval(id)
  }, [load])

  const posOrders = data?.orders.filter(o => o.source === 'POS') ?? []
  const onlineOrders = data?.orders.filter(o => o.source === 'ONLINE') ?? []
  const totalItems = posOrders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.quantity, 0), 0)
  const dateLabel = data ? new Date(data.date).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }) : ''

  return (
    <div className="min-h-[100dvh] font-cairo" style={{ background: '#f1f5f9' }} dir="rtl">

      {/* ── Colored hero header ── */}
      <div style={{ background: 'linear-gradient(160deg, #16a34a 0%, #059669 100%)', paddingTop: 'env(safe-area-inset-top, 0px)' }}>

        {/* top bar */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <Link href="/owner"
            className="w-9 h-9 flex items-center justify-center rounded-xl"
            style={{ background: 'rgba(255,255,255,0.2)' }}>
            <ChevronRight size={20} className="text-white" />
          </Link>
          <div className="text-center">
            <p className="text-white font-bold text-sm leading-none">تقرير المحل</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>{dateLabel}</p>
          </div>
          <button onClick={() => load(true)} disabled={refreshing}
            className="w-9 h-9 flex items-center justify-center rounded-xl transition-opacity disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.2)' }}>
            <RefreshCw size={16} className={`text-white ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* revenue block */}
        <div className="px-4 pt-4 pb-8 text-center">
          {loading ? (
            <div className="py-6 flex justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Store size={14} className="text-green-200" />
                <p className="text-sm font-medium text-green-100">مبيعات المحل اليوم</p>
              </div>
              <p className="text-5xl font-bold text-white mb-2 tracking-tight">
                {formatPrice(data?.summary.pos.revenue ?? 0)}
              </p>
              <div className="flex items-center justify-center gap-3 text-sm text-green-100">
                <span>{data?.summary.pos.orders ?? 0} فاتورة</span>
                {totalItems > 0 && (
                  <><span className="opacity-40">·</span><span>{totalItems} قطعة</span></>
                )}
              </div>
              {(data?.summary.totalDiscount ?? 0) > 0 && (
                <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
                  <Tag size={11} />
                  خصومات: {formatPrice(data!.summary.totalDiscount)}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Content (pulls up over the green) ── */}
      <div className="relative -mt-4 rounded-t-3xl px-4 pt-5 pb-10 space-y-4"
        style={{ background: '#f1f5f9', minHeight: 'calc(100dvh - 180px)' }}>

        {data && (
          <>
            {/* Online pill (secondary, only if exists) */}
            {data.summary.online.orders > 0 && (
              <div className="flex items-center justify-between rounded-2xl px-4 py-3"
                style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
                <span className="text-sm font-semibold" style={{ color: '#3730a3' }}>
                  طلبات الموقع اليوم
                </span>
                <span className="text-sm font-bold" style={{ color: '#4f46e5' }}>
                  {formatPrice(data.summary.online.revenue)} · {data.summary.online.orders} طلب
                </span>
              </div>
            )}

            {/* Staff */}
            {data.summary.staffBreakdown.length > 0 && (
              <div className="rounded-2xl overflow-hidden"
                style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: '#f1f5f9' }}>
                  <User size={14} style={{ color: '#16a34a' }} />
                  <p className="text-sm font-bold" style={{ color: '#0f172a' }}>الموظفون</p>
                </div>
                <div className="divide-y" style={{ borderColor: '#f8fafc' }}>
                  {data.summary.staffBreakdown.map(s => (
                    <div key={s.name} className="flex items-center gap-3 px-4 py-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ background: '#dcfce7', color: '#15803d' }}>
                        {s.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm" style={{ color: '#0f172a' }}>{s.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{s.orders} فاتورة</p>
                      </div>
                      <p className="font-bold" style={{ color: '#16a34a' }}>{formatPrice(s.revenue)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* POS Orders */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide px-1 mb-3" style={{ color: '#94a3b8' }}>
                فواتير المحل ({posOrders.length})
              </p>

              {posOrders.length === 0 ? (
                <div className="rounded-2xl p-10 text-center"
                  style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
                  <Package size={32} className="mx-auto mb-2" style={{ color: '#cbd5e1' }} />
                  <p className="text-sm" style={{ color: '#94a3b8' }}>لم تتم أي مبيعات في المحل اليوم</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {posOrders.map(order => {
                    const pay = PAY_STYLE[order.paymentMethod] ?? { bg: '#f8fafc', color: '#475569' }
                    return (
                      <div key={order.id} className="rounded-2xl overflow-hidden"
                        style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', borderRight: '4px solid #16a34a' }}>

                        {/* header row */}
                        <div className="px-4 py-3 flex items-center justify-between gap-2"
                          style={{ borderBottom: '1px solid #f1f5f9', background: '#fafffe' }}>
                          <div>
                            <p className="font-bold text-sm" style={{ color: '#0f172a' }}>{order.orderNumber}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="flex items-center gap-1 text-xs" style={{ color: '#94a3b8' }}>
                                <Clock size={10} />{formatTime(order.createdAt)}
                              </span>
                              {order.staffName && (
                                <span className="flex items-center gap-1 text-xs font-bold" style={{ color: '#16a34a' }}>
                                  <User size={10} />{order.staffName}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg shrink-0"
                            style={{ background: pay.bg, color: pay.color }}>
                            {PAY_LABELS[order.paymentMethod] ?? order.paymentMethod}
                          </span>
                        </div>

                        {/* items */}
                        <div className="px-4 py-3 space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                                style={{ background: '#f0fdf4' }}>
                                <Package size={14} style={{ color: '#16a34a' }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold leading-snug" style={{ color: '#0f172a' }}>
                                  {item.nameAr}
                                </p>
                                {(item.size || item.color) && (
                                  <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                                    {[item.size ? `مقاس ${item.size}` : '', item.color ?? ''].filter(Boolean).join(' · ')}
                                  </p>
                                )}
                              </div>
                              <div className="text-left shrink-0">
                                <p className="text-[11px]" style={{ color: '#94a3b8' }}>{item.quantity}×</p>
                                <p className="text-sm font-bold" style={{ color: '#0f172a' }}>
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* footer */}
                        <div className="px-4 py-3 space-y-1"
                          style={{ borderTop: '1px solid #f1f5f9', background: '#fafffe' }}>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-xs">
                              <span className="flex items-center gap-1" style={{ color: '#d97706' }}>
                                <Tag size={10} />خصم
                              </span>
                              <span style={{ color: '#d97706' }}>− {formatPrice(order.discount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-sm" style={{ color: '#64748b' }}>الإجمالي</span>
                            <span className="text-xl font-bold" style={{ color: '#16a34a' }}>{formatPrice(order.total)}</span>
                          </div>
                          {order.notes && (
                            <p className="text-xs pt-0.5" style={{ color: '#94a3b8' }}>ملاحظة: {order.notes}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Online orders */}
            {onlineOrders.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide px-1 mb-3" style={{ color: '#94a3b8' }}>
                  طلبات الموقع ({onlineOrders.length})
                </p>
                <div className="space-y-3">
                  {onlineOrders.map(order => {
                    const pay = PAY_STYLE[order.paymentMethod] ?? { bg: '#f8fafc', color: '#475569' }
                    return (
                      <div key={order.id} className="rounded-2xl overflow-hidden"
                        style={{ background: '#fff', border: '1px solid #c7d2fe', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', borderRight: '4px solid #6366f1' }}>
                        <div className="px-4 py-3 flex items-center justify-between gap-2"
                          style={{ borderBottom: '1px solid #eef2ff', background: '#fafbff' }}>
                          <div>
                            <p className="font-bold text-sm" style={{ color: '#0f172a' }}>{order.orderNumber}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="flex items-center gap-1 text-xs" style={{ color: '#94a3b8' }}>
                                <Clock size={10} />{formatTime(order.createdAt)}
                              </span>
                              <span className="flex items-center gap-1 text-xs font-bold" style={{ color: '#6366f1' }}>
                                <User size={10} />{order.customerName}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg shrink-0"
                            style={{ background: pay.bg, color: pay.color }}>
                            {PAY_LABELS[order.paymentMethod] ?? order.paymentMethod}
                          </span>
                        </div>
                        <div className="px-4 py-3 space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold" style={{ color: '#0f172a' }}>{item.nameAr}</p>
                                {(item.size || item.color) && (
                                  <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                                    {[item.size ? `مقاس ${item.size}` : '', item.color ?? ''].filter(Boolean).join(' · ')}
                                  </p>
                                )}
                              </div>
                              <div className="text-left shrink-0">
                                <p className="text-[11px]" style={{ color: '#94a3b8' }}>{item.quantity}×</p>
                                <p className="text-sm font-bold" style={{ color: '#0f172a' }}>{formatPrice(item.price * item.quantity)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="px-4 py-3 flex justify-between items-center"
                          style={{ borderTop: '1px solid #eef2ff', background: '#fafbff' }}>
                          <span className="text-sm" style={{ color: '#64748b' }}>
                            الإجمالي {order.shipping > 0 && <span className="text-xs">(+ {formatPrice(order.shipping)} شحن)</span>}
                          </span>
                          <span className="text-xl font-bold" style={{ color: '#6366f1' }}>{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* footer */}
            <p className="text-center text-xs pb-2" style={{ color: '#94a3b8' }}>
              يتحدث كل دقيقتين · آخر تحديث {lastRefresh.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
