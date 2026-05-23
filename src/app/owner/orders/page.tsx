'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Package, ShoppingBag, ChevronLeft, RefreshCw } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

const LOGO_URL = 'https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/logo.jpg'

type Period = 'today' | 'week' | 'month' | 'all'

const PERIODS: { key: Period; label: string }[] = [
  { key: 'today', label: 'اليوم' },
  { key: 'week', label: 'الأسبوع' },
  { key: 'month', label: 'الشهر' },
  { key: 'all', label: 'كل الطلبات' },
]

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:    { label: 'في الانتظار', bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
  CONFIRMED:  { label: 'مؤكد',        bg: 'rgba(99,102,241,0.15)', color: '#a5b4fc' },
  PROCESSING: { label: 'قيد التجهيز', bg: 'rgba(59,130,246,0.15)', color: '#93c5fd' },
  SHIPPED:    { label: 'تم الشحن',    bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7' },
  DELIVERED:  { label: 'تم التوصيل', bg: 'rgba(16,185,129,0.2)',  color: '#34d399' },
  CANCELLED:  { label: 'ملغي',        bg: 'rgba(239,68,68,0.15)',  color: '#f87171' },
}

const PAYMENT_LABEL: Record<string, string> = {
  CASH_ON_DELIVERY: 'الدفع عند الاستلام',
  VODAFONE_CASH: 'فودافون كاش',
  INSTAPAY: 'إنستاباي',
  BANK_TRANSFER: 'تحويل بنكي',
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  city: string
  total: number
  status: string
  paymentMethod: string
  source: string
  createdAt: string
  itemsCount: number
  firstImage: string | null
}

function OwnerOrdersContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const period = (searchParams.get('period') ?? 'today') as Period

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/owner/orders?period=${period}`)
      setOrders(await res.json())
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { load() }, [load])

  const totalRevenue = orders.filter(o => o.status !== 'CANCELLED').reduce((acc, o) => acc + o.total, 0)
  const activeOrders = orders.filter(o => o.status !== 'CANCELLED')

  const periodLabel = PERIODS.find(p => p.key === period)?.label ?? 'اليوم'

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #0f0508 0%, #1a0a10 50%, #0f0508 100%)' }}
      dir="rtl"
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 px-4 sm:px-6 py-3 flex items-center justify-between gap-3"
        style={{ background: 'rgba(15,5,8,0.95)', borderBottom: '1px solid rgba(200,149,108,0.15)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-2.5">
          <Link
            href="/owner"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-cairo shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <ArrowLeft size={14} />
            <span>رجوع</span>
          </Link>
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="زهرة الخليج" className="w-7 h-7 rounded-lg object-cover shrink-0" style={{ border: '1px solid rgba(200,149,108,0.3)' }} />
            <span className="text-sm font-bold font-cairo text-white">طلبات {periodLabel}</span>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-1.5 rounded-xl disabled:opacity-50"
          style={{ background: 'rgba(200,149,108,0.1)', color: '#c8956c' }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      {/* Period tabs */}
      <div
        className="sticky top-[52px] z-40 px-4 sm:px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar"
        style={{ background: 'rgba(15,5,8,0.92)', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}
      >
        {PERIODS.map(p => (
          <button
            key={p.key}
            onClick={() => router.replace(`/owner/orders?period=${p.key}`)}
            className="px-4 py-1.5 rounded-full text-sm font-cairo font-medium shrink-0 transition-all"
            style={period === p.key
              ? { background: 'linear-gradient(135deg, #c8956c, #8b5e52)', color: '#fff' }
              : { background: 'rgba(255,255,255,0.06)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <main className="px-4 sm:px-6 py-4 max-w-2xl mx-auto pb-10">
        {/* Summary */}
        {!loading && (
          <div
            className="flex items-center justify-between mb-4 rounded-2xl px-4 py-3"
            style={{ background: 'rgba(200,149,108,0.07)', border: '1px solid rgba(200,149,108,0.15)' }}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag size={16} style={{ color: '#c8956c' }} />
              <span className="text-sm font-cairo font-bold text-white">{activeOrders.length} طلب</span>
              {orders.length !== activeOrders.length && (
                <span className="text-xs font-cairo" style={{ color: '#6b7280' }}>({orders.length - activeOrders.length} ملغي)</span>
              )}
            </div>
            <span className="text-sm font-bold font-cairo" style={{ color: '#c8956c' }}>{formatPrice(totalRevenue)}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div
              className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: 'rgba(200,149,108,0.3)', borderTopColor: '#c8956c' }}
            />
            <p className="text-gray-400 font-cairo text-sm">جاري التحميل...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(200,149,108,0.08)' }}>
              <Package size={28} style={{ color: 'rgba(200,149,108,0.4)' }} />
            </div>
            <p className="text-gray-400 font-cairo text-sm">لا توجد طلبات في هذه الفترة</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map(o => {
              const st = STATUS_STYLE[o.status] ?? STATUS_STYLE.PENDING
              return (
                <Link
                  key={o.id}
                  href={`/owner/orders/${o.id}`}
                  className="flex items-center gap-3 rounded-2xl p-3 transition-all active:scale-[0.99]"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: o.status === 'CANCELLED'
                      ? '1px solid rgba(239,68,68,0.15)'
                      : '1px solid rgba(200,149,108,0.1)',
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    className="relative w-14 h-16 rounded-xl overflow-hidden shrink-0"
                    style={{ background: 'rgba(200,149,108,0.06)' }}
                  >
                    {o.firstImage ? (
                      <Image src={o.firstImage} alt={o.customerName} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={20} style={{ color: 'rgba(200,149,108,0.3)' }} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold" style={{ color: '#c8956c' }}>#{o.orderNumber}</span>
                      <span
                        className="text-[10px] font-cairo px-1.5 py-0.5 rounded-lg"
                        style={{ background: st.bg, color: st.color }}
                      >
                        {st.label}
                      </span>
                      {o.source === 'POS' && (
                        <span className="text-[10px] font-cairo px-1.5 py-0.5 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', color: '#6ee7b7' }}>محل</span>
                      )}
                    </div>
                    <p className="text-sm font-bold font-cairo text-white truncate">{o.customerName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-cairo" style={{ color: '#6b7280' }}>{o.city}</span>
                      <span className="text-xs font-cairo" style={{ color: '#4b5563' }}>·</span>
                      <span className="text-xs font-cairo" style={{ color: '#6b7280' }}>{o.itemsCount} قطعة</span>
                      <span className="text-xs font-cairo" style={{ color: '#4b5563' }}>·</span>
                      <span className="text-xs font-cairo" style={{ color: '#6b7280' }}>
                        {new Date(o.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Total + chevron */}
                  <div className="shrink-0 text-left flex flex-col items-end gap-1">
                    <span className="text-sm font-bold font-cairo" style={{ color: '#c8956c' }}>{formatPrice(o.total)}</span>
                    <ChevronLeft size={15} style={{ color: '#374151' }} />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default function OwnerOrdersPage() {
  return (
    <Suspense>
      <OwnerOrdersContent />
    </Suspense>
  )
}
