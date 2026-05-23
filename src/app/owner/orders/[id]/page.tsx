'use client'
import { useState, useEffect, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Package, Phone, MapPin, AlertTriangle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

const LOGO_URL = 'https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/logo.jpg'

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:    { label: 'في الانتظار', bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
  CONFIRMED:  { label: 'مؤكد',        bg: 'rgba(99,102,241,0.15)', color: '#a5b4fc' },
  PROCESSING: { label: 'قيد التجهيز', bg: 'rgba(59,130,246,0.15)', color: '#93c5fd' },
  SHIPPED:    { label: 'تم الشحن',    bg: 'rgba(16,185,129,0.15)', color: '#6ee7b7' },
  DELIVERED:  { label: 'تم التوصيل', bg: 'rgba(16,185,129,0.2)',  color: '#34d399' },
  CANCELLED:  { label: 'ملغي',        bg: 'rgba(239,68,68,0.15)',  color: '#f87171' },
}

const PAYMENT_LABEL: Record<string, string> = {
  CASH_ON_DELIVERY: '💵 الدفع عند الاستلام',
  VODAFONE_CASH: '📱 فودافون كاش',
  INSTAPAY: '💳 إنستاباي',
  BANK_TRANSFER: '🏦 تحويل بنكي',
}

interface OrderItem {
  id: string
  nameAr: string
  size: string | null
  quantity: number
  price: number
  image: string | null
  productId: string
  product: {
    id: string
    stock: number
    sizeStock: Record<string, number> | null
    images: string[]
    active: boolean
  } | null
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  city: string
  address: string
  notes: string | null
  total: number
  subtotal: number
  shipping: number
  status: string
  paymentMethod: string
  source: string
  createdAt: string
  items: OrderItem[]
}

function OwnerOrderDetailContent() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const period = searchParams.get('period') ?? 'today'

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/owner/orders/${id}`)
      .then(r => r.json())
      .then(data => { setOrder(data); setLoading(false) })
  }, [id])

  const backHref = `/owner/orders?period=${period}`

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #0f0508 0%, #1a0a10 50%, #0f0508 100%)' }}
      dir="rtl"
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 px-4 sm:px-6 py-3 flex items-center gap-2.5"
        style={{ background: 'rgba(15,5,8,0.95)', borderBottom: '1px solid rgba(200,149,108,0.15)', backdropFilter: 'blur(20px)' }}
      >
        <Link
          href={backHref}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-cairo shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <ArrowLeft size={14} />
          <span>رجوع</span>
        </Link>
        <img src={LOGO_URL} alt="زهرة الخليج" className="w-7 h-7 rounded-lg object-cover shrink-0" style={{ border: '1px solid rgba(200,149,108,0.3)' }} />
        <span className="text-sm font-bold font-cairo text-white truncate">
          {order ? `طلب #${order.orderNumber}` : 'تفاصيل الطلب'}
        </span>
      </header>

      <main className="px-4 sm:px-6 py-4 max-w-2xl mx-auto space-y-4 pb-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div
              className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: 'rgba(200,149,108,0.3)', borderTopColor: '#c8956c' }}
            />
            <p className="text-gray-400 font-cairo text-sm">جاري التحميل...</p>
          </div>
        ) : !order || 'error' in (order as object) ? (
          <div className="text-center py-24">
            <Package size={48} className="mx-auto mb-3" style={{ color: 'rgba(200,149,108,0.3)' }} />
            <p className="text-gray-400 font-cairo">الطلب غير موجود</p>
          </div>
        ) : (
          <>
            {/* Order meta */}
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,149,108,0.15)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-cairo" style={{ color: '#6b7280' }}>
                    {new Date(order.createdAt).toLocaleString('ar-EG', {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                  {order.source === 'POS' && (
                    <span className="text-[10px] font-cairo px-1.5 py-0.5 rounded-lg inline-block mt-1" style={{ background: 'rgba(16,185,129,0.1)', color: '#6ee7b7' }}>مبيعة من المحل</span>
                  )}
                </div>
                {(() => {
                  const st = STATUS_STYLE[order.status] ?? STATUS_STYLE.PENDING
                  return (
                    <span className="text-sm font-cairo font-bold px-3 py-1 rounded-xl" style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  )
                })()}
              </div>

              <div className="border-t pt-3 space-y-2" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2">
                  <Package size={14} style={{ color: '#c8956c' }} className="shrink-0" />
                  <span className="text-sm font-cairo text-white font-bold">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} style={{ color: '#c8956c' }} className="shrink-0" />
                  <span className="text-sm font-cairo text-white" dir="ltr">{order.customerPhone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={14} style={{ color: '#c8956c' }} className="shrink-0 mt-0.5" />
                  <span className="text-sm font-cairo text-white">{order.city} — {order.address}</span>
                </div>
                {order.notes && (
                  <p className="text-xs font-cairo pr-5" style={{ color: '#9ca3af' }}>ملاحظة: {order.notes}</p>
                )}
              </div>

              <div className="border-t pt-3 flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <span className="text-xs font-cairo" style={{ color: '#9ca3af' }}>{PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}</span>
                <div className="text-left">
                  {order.shipping > 0 && (
                    <p className="text-xs font-cairo" style={{ color: '#6b7280' }}>شحن: {formatPrice(order.shipping)}</p>
                  )}
                  <p className="text-base font-bold font-cairo" style={{ color: '#c8956c' }}>{formatPrice(order.total)}</p>
                </div>
              </div>
            </div>

            {/* Products with stock */}
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,149,108,0.15)' }}
            >
              <h2 className="text-white font-bold font-cairo text-sm">المنتجات في الطلب</h2>

              {order.items.map(item => {
                const sizeStock = item.size && item.product?.sizeStock
                  ? (item.product.sizeStock as Record<string, number>)[item.size] ?? item.product.stock
                  : item.product?.stock ?? null

                const stockColor = sizeStock === null ? '#6b7280'
                  : sizeStock === 0 ? '#f87171'
                  : sizeStock < 5 ? '#fbbf24'
                  : '#34d399'

                const stockBg = sizeStock === null ? 'rgba(255,255,255,0.05)'
                  : sizeStock === 0 ? 'rgba(239,68,68,0.12)'
                  : sizeStock < 5 ? 'rgba(245,158,11,0.12)'
                  : 'rgba(16,185,129,0.12)'

                const productImage = item.image ?? item.product?.images?.[0] ?? null

                return (
                  <div
                    key={item.id}
                    className="rounded-xl p-3"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Image */}
                      <div
                        className="relative w-16 h-20 rounded-xl overflow-hidden shrink-0"
                        style={{ background: 'rgba(200,149,108,0.06)' }}
                      >
                        {productImage ? (
                          <Image src={productImage} alt={item.nameAr} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={20} style={{ color: 'rgba(200,149,108,0.3)' }} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/owner/products/${item.productId}`}>
                          <p className="text-sm font-bold font-cairo text-white leading-snug hover:underline">{item.nameAr}</p>
                        </Link>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {item.size && (
                            <span className="text-[11px] font-cairo px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.07)', color: '#9ca3af' }}>
                              مقاس {item.size}
                            </span>
                          )}
                          <span className="text-[11px] font-cairo px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(200,149,108,0.1)', color: '#c8956c' }}>
                            × {item.quantity} قطعة
                          </span>
                          <span className="text-[11px] font-cairo font-bold" style={{ color: '#c8956c' }}>
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stock remaining */}
                    <div
                      className="mt-3 flex items-center justify-between rounded-lg px-3 py-2"
                      style={{ background: stockBg, border: `1px solid ${stockColor}33` }}
                    >
                      <div className="flex items-center gap-1.5">
                        {(sizeStock !== null && sizeStock < 5) && <AlertTriangle size={12} style={{ color: stockColor }} />}
                        <span className="text-xs font-cairo" style={{ color: '#9ca3af' }}>
                          {item.size ? `المتبقي من مقاس ${item.size}` : 'المتبقي في المخزون'}
                        </span>
                      </div>
                      <span className="text-sm font-bold font-cairo" style={{ color: stockColor }}>
                        {sizeStock === null
                          ? 'غير محدد'
                          : sizeStock === 0
                          ? 'نفد المخزون'
                          : `${sizeStock} قطعة`}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default function OwnerOrderDetailPage() {
  return (
    <Suspense>
      <OwnerOrderDetailContent />
    </Suspense>
  )
}
