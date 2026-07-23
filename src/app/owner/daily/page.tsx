'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import {
  RefreshCw, ChevronRight, Store, Globe, Tag,
  Clock, User, Package, ShoppingBag,
} from 'lucide-react'

const PAY_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: 'كاش',
  VODAFONE_CASH: 'فودافون كاش',
  INSTAPAY: 'إنستاباي',
  BANK_TRANSFER: 'تحويل بنكي',
}
const PAY_COLORS: Record<string, { bg: string; text: string }> = {
  CASH_ON_DELIVERY:  { bg: '#f0fdf4', text: '#166534' },
  VODAFONE_CASH:     { bg: '#fef3c7', text: '#92400e' },
  INSTAPAY:          { bg: '#eff6ff', text: '#1e40af' },
  BANK_TRANSFER:     { bg: '#f5f3ff', text: '#4c1d95' },
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
  return new Date(iso).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })
}

// Warm neutral palette — easy on the eyes
const bg       = '#f7f5f2'
const surface  = '#ffffff'
const border   = '#e8e3dc'
const textMain = '#1c1917'
const textSub  = '#78716c'
const textMute = '#a8a29e'
const brand    = '#b07060'
const brandBg  = '#fdf5f2'

export default function DailyReportPage() {
  const [data, setData] = useState<DailyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/owner/daily')
      setData(await res.json())
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

  const posOrders = data?.orders.filter(o => o.source === 'POS') ?? []
  const onlineOrders = data?.orders.filter(o => o.source === 'ONLINE') ?? []
  const totalItems = posOrders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.quantity, 0), 0)

  return (
    <div className="min-h-screen font-cairo" style={{ background: bg, color: textMain }} dir="rtl">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{ background: surface, borderBottom: `1px solid ${border}` }}>
        <div className="flex items-center gap-2.5">
          <Link href="/owner"
            className="w-8 h-8 flex items-center justify-center rounded-xl"
            style={{ background: brandBg, color: brand }}>
            <ChevronRight size={18} />
          </Link>
          <div>
            <p className="font-bold text-sm leading-none" style={{ color: textMain }}>تقرير المحل اليوم</p>
            {data && <p className="text-[11px] mt-0.5" style={{ color: textSub }}>{formatDateAr(data.date)}</p>}
          </div>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-opacity disabled:opacity-50"
          style={{ background: brandBg, color: brand, border: `1px solid #e8d5cc` }}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          تحديث
        </button>
      </header>

      {/* ── Loading ── */}
      {loading && !data && (
        <div className="flex flex-col items-center justify-center py-32 gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: `${brand}30`, borderTopColor: brand }} />
          <p className="text-sm" style={{ color: textSub }}>جاري تحميل مبيعات اليوم...</p>
        </div>
      )}

      {data && (
        <main className="px-4 pt-5 pb-10 max-w-lg mx-auto space-y-4">

          {/* ── POS Hero ── */}
          <div className="rounded-2xl p-5 text-center"
            style={{ background: surface, border: `1px solid ${border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <Store size={15} style={{ color: brand }} />
              <p className="text-sm font-semibold" style={{ color: brand }}>مبيعات المحل اليوم</p>
            </div>
            <p className="text-5xl font-bold mb-2" style={{ color: textMain }}>
              {formatPrice(data.summary.pos.revenue)}
            </p>
            <div className="flex items-center justify-center gap-3 text-sm" style={{ color: textSub }}>
              <span>{data.summary.pos.orders} فاتورة</span>
              {totalItems > 0 && <><span style={{ color: border }}>·</span><span>{totalItems} قطعة</span></>}
            </div>
            {data.summary.totalDiscount > 0 && (
              <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: '#fef9ee', color: '#92400e', border: '1px solid #fde68a' }}>
                <Tag size={11} />
                خصومات اليوم: {formatPrice(data.summary.totalDiscount)}
              </div>
            )}
          </div>

          {/* ── Online summary (condensed, secondary) ── */}
          {data.summary.online.orders > 0 && (
            <div className="rounded-xl px-4 py-3 flex items-center justify-between"
              style={{ background: '#f0f4ff', border: '1px solid #c7d2fe' }}>
              <div className="flex items-center gap-2">
                <Globe size={14} style={{ color: '#4f46e5' }} />
                <span className="text-sm font-medium" style={{ color: '#3730a3' }}>طلبات الموقع اليوم</span>
              </div>
              <div className="text-left">
                <span className="text-sm font-bold" style={{ color: '#3730a3' }}>{formatPrice(data.summary.online.revenue)}</span>
                <span className="text-xs mr-1.5" style={{ color: '#6366f1' }}>{data.summary.online.orders} طلب</span>
              </div>
            </div>
          )}

          {/* ── Staff breakdown ── */}
          {data.summary.staffBreakdown.length > 0 && (
            <div className="rounded-2xl overflow-hidden"
              style={{ background: surface, border: `1px solid ${border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div className="px-4 py-3 flex items-center gap-2"
                style={{ borderBottom: `1px solid ${border}` }}>
                <User size={14} style={{ color: brand }} />
                <p className="text-sm font-bold" style={{ color: textMain }}>الموظفون</p>
              </div>
              <div className="divide-y" style={{ borderColor: border }}>
                {data.summary.staffBreakdown.map(s => (
                  <div key={s.name} className="px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: brandBg, color: brand }}>
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: textMain }}>{s.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: textSub }}>{s.orders} فاتورة</p>
                    </div>
                    <p className="font-bold text-base shrink-0" style={{ color: brand }}>{formatPrice(s.revenue)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── POS Orders ── */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <ShoppingBag size={15} style={{ color: brand }} />
              <p className="text-sm font-bold" style={{ color: textMain }}>فواتير المحل</p>
              {posOrders.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: brandBg, color: brand }}>
                  {posOrders.length}
                </span>
              )}
            </div>

            {posOrders.length === 0 ? (
              <div className="rounded-2xl p-10 text-center"
                style={{ background: surface, border: `1px solid ${border}` }}>
                <Package size={32} className="mx-auto mb-3" style={{ color: textMute }} />
                <p className="text-sm" style={{ color: textSub }}>لم تتم أي مبيعات في المحل اليوم</p>
              </div>
            ) : (
              <div className="space-y-3">
                {posOrders.map(order => {
                  const pay = PAY_COLORS[order.paymentMethod] ?? { bg: '#f9fafb', text: '#374151' }
                  return (
                    <div key={order.id} className="rounded-2xl overflow-hidden"
                      style={{ background: surface, border: `1px solid ${border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>

                      {/* Card header */}
                      <div className="px-4 py-3 flex items-start justify-between gap-2"
                        style={{ borderBottom: `1px solid ${border}`, background: '#fafaf9' }}>
                        <div>
                          <p className="font-bold text-sm" style={{ color: textMain }}>{order.orderNumber}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="flex items-center gap-1 text-xs" style={{ color: textSub }}>
                              <Clock size={11} />{formatTime(order.createdAt)}
                            </span>
                            {order.staffName && (
                              <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#059669' }}>
                                <User size={11} />{order.staffName}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0"
                          style={{ background: pay.bg, color: pay.text }}>
                          {PAY_LABELS[order.paymentMethod] ?? order.paymentMethod}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="px-4 py-3 space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                              style={{ background: brandBg }}>
                              <Package size={14} style={{ color: brand }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold leading-snug" style={{ color: textMain }}>{item.nameAr}</p>
                              {(item.size || item.color) && (
                                <p className="text-xs mt-0.5" style={{ color: textMute }}>
                                  {[item.size ? `مقاس ${item.size}` : '', item.color ?? ''].filter(Boolean).join(' · ')}
                                </p>
                              )}
                            </div>
                            <div className="text-left shrink-0">
                              <p className="text-xs font-medium" style={{ color: textMute }}>{item.quantity}×</p>
                              <p className="text-sm font-bold" style={{ color: textMain }}>{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="px-4 pb-3 pt-2 space-y-1.5"
                        style={{ borderTop: `1px solid ${border}` }}>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-xs">
                            <span className="flex items-center gap-1" style={{ color: '#92400e' }}>
                              <Tag size={11} />خصم
                            </span>
                            <span style={{ color: '#92400e' }}>− {formatPrice(order.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm" style={{ color: textSub }}>الإجمالي</span>
                          <span className="text-lg font-bold" style={{ color: brand }}>{formatPrice(order.total)}</span>
                        </div>
                        {order.notes && (
                          <p className="text-xs pt-0.5" style={{ color: textMute }}>ملاحظة: {order.notes}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Online orders (secondary, collapsible feel) ── */}
          {onlineOrders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                <Globe size={14} style={{ color: '#6366f1' }} />
                <p className="text-sm font-bold" style={{ color: textMain }}>طلبات الموقع</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: '#eff6ff', color: '#3730a3' }}>
                  {onlineOrders.length}
                </span>
              </div>
              <div className="space-y-3">
                {onlineOrders.map(order => {
                  const pay = PAY_COLORS[order.paymentMethod] ?? { bg: '#f9fafb', text: '#374151' }
                  return (
                    <div key={order.id} className="rounded-2xl overflow-hidden"
                      style={{ background: surface, border: `1px solid #c7d2fe`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                      <div className="px-4 py-3 flex items-start justify-between gap-2"
                        style={{ borderBottom: `1px solid #e0e7ff`, background: '#f5f7ff' }}>
                        <div>
                          <p className="font-bold text-sm" style={{ color: textMain }}>{order.orderNumber}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1 text-xs" style={{ color: textSub }}>
                              <Clock size={11} />{formatTime(order.createdAt)}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#4f46e5' }}>
                              <User size={11} />{order.customerName}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg shrink-0"
                          style={{ background: pay.bg, color: pay.text }}>
                          {PAY_LABELS[order.paymentMethod] ?? order.paymentMethod}
                        </span>
                      </div>
                      <div className="px-4 py-3 space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold" style={{ color: textMain }}>{item.nameAr}</p>
                              {(item.size || item.color) && (
                                <p className="text-xs mt-0.5" style={{ color: textMute }}>
                                  {[item.size ? `مقاس ${item.size}` : '', item.color ?? ''].filter(Boolean).join(' · ')}
                                </p>
                              )}
                            </div>
                            <div className="text-left shrink-0">
                              <p className="text-xs" style={{ color: textMute }}>{item.quantity}×</p>
                              <p className="text-sm font-bold" style={{ color: textMain }}>{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 pb-3 pt-2 flex justify-between items-center"
                        style={{ borderTop: `1px solid #e0e7ff` }}>
                        <span className="text-sm" style={{ color: textSub }}>
                          الإجمالي {order.shipping > 0 && <span className="text-xs">(شحن: {formatPrice(order.shipping)})</span>}
                        </span>
                        <span className="text-lg font-bold" style={{ color: '#4f46e5' }}>{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-xs py-2" style={{ color: textMute }}>
            يتحدث كل دقيقتين · {lastRefresh.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </main>
      )}
    </div>
  )
}
