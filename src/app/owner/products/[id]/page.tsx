'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import {
  ArrowLeft, Package, AlertTriangle, Snowflake, Sun, BarChart3, Tag,
} from 'lucide-react'

const LOGO_URL = 'https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/logo.jpg'

interface Variant { size: string; color: string; qty: number }

interface ProductDetail {
  id: string
  nameAr: string
  sku: string | null
  price: number

  season: 'WINTER' | 'SUMMER'
  sizes: string[]
  sizeStock: Record<string, number> | null
  variants: Variant[] | null
  stock: number
  images: string[]
  category: { nameAr: string } | null
  soldTotal: number
  revenueTotal: number
  ordersCount: number
  sizeSales: { size: string; qty: number }[]
}

export default function OwnerProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    fetch(`/api/owner/products/${id}`)
      .then(r => r.json())
      .then(data => { setProduct(data); setLoading(false) })
  }, [id])

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
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-cairo transition-all shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <ArrowLeft size={14} />
            <span>رجوع</span>
          </Link>
          <div className="flex items-center gap-2">
            <img src={LOGO_URL} alt="زهرة الخليج" className="w-7 h-7 rounded-lg object-cover shrink-0" style={{ border: '1px solid rgba(200,149,108,0.3)' }} />
            <span className="text-sm font-bold font-cairo text-white">تفاصيل المنتج</span>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-5 max-w-2xl mx-auto space-y-4 pb-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div
              className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: 'rgba(200,149,108,0.3)', borderTopColor: '#c8956c' }}
            />
            <p className="text-gray-400 font-cairo text-sm">جاري التحميل...</p>
          </div>
        ) : !product || 'error' in (product as object) ? (
          <div className="text-center py-24">
            <Package size={48} className="mx-auto mb-3" style={{ color: 'rgba(200,149,108,0.3)' }} />
            <p className="text-gray-400 font-cairo">المنتج غير موجود</p>
          </div>
        ) : (
          <>
            {/* Product card: image + identity */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,149,108,0.15)' }}>
              {/* Image */}
              {product.images.length > 0 ? (
                <div className="relative w-full" style={{ paddingBottom: '100%' }}>
                  <Image
                    src={product.images[activeImg] ?? product.images[0]}
                    alt={product.nameAr}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div
                  className="w-full flex items-center justify-center"
                  style={{ height: '240px', background: 'rgba(200,149,108,0.06)' }}
                >
                  <Package size={72} style={{ color: 'rgba(200,149,108,0.25)' }} />
                </div>
              )}

              {/* Thumbnail strip */}
              {product.images.length > 1 && (
                <div className="flex gap-2 px-4 py-3 overflow-x-auto">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 transition-all"
                      style={{ border: i === activeImg ? '2px solid #c8956c' : '2px solid rgba(255,255,255,0.1)' }}
                    >
                      <Image src={img} alt={`صورة ${i + 1}`} fill className="object-cover" unoptimized />
                    </button>
                  ))}
                </div>
              )}

              {/* Identity */}
              <div className="p-4 pt-3">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-lg font-bold text-white font-cairo leading-snug flex-1">{product.nameAr}</h1>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-bold font-cairo" style={{ color: '#c8956c' }}>{formatPrice(product.price)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-2.5">
                  {product.sku && (
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.07)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      #{product.sku}
                    </span>
                  )}
                  <span
                    className="text-xs font-cairo px-2 py-0.5 rounded-lg flex items-center gap-1"
                    style={product.season === 'WINTER'
                      ? { background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }
                      : { background: 'rgba(245,158,11,0.15)', color: '#fcd34d' }}
                  >
                    {product.season === 'WINTER' ? <Snowflake size={11} /> : <Sun size={11} />}
                    {product.season === 'WINTER' ? 'شتوي' : 'صيفي'}
                  </span>
                  {product.category && (
                    <span
                      className="text-xs font-cairo px-2 py-0.5 rounded-lg flex items-center gap-1"
                      style={{ background: 'rgba(200,149,108,0.1)', color: '#c8956c' }}
                    >
                      <Tag size={11} />
                      {product.category.nameAr}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Current Stock */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,149,108,0.15)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold font-cairo">المخزون الحالي</h2>
                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold font-cairo"
                  style={
                    product.stock === 0
                      ? { background: 'rgba(239,68,68,0.15)', color: '#f87171' }
                      : product.stock < 5
                        ? { background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }
                        : { background: 'rgba(16,185,129,0.15)', color: '#34d399' }
                  }
                >
                  {product.stock === 0 && <AlertTriangle size={13} />}
                  {product.stock === 0 ? 'نفد المخزون' : `${product.stock} قطعة إجمالي`}
                </div>
              </div>

              {(() => {
                const variants: Variant[] = product.variants && product.variants.length > 0
                  ? product.variants
                  : product.sizes.map(s => ({ size: s, color: '', qty: product.sizeStock?.[s] ?? 0 }))

                if (variants.length === 0) {
                  return (
                    <p className="text-gray-500 font-cairo text-sm text-center py-3">
                      لا توجد مقاسات محددة
                    </p>
                  )
                }

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {variants.map((v, i) => (
                      <div
                        key={i}
                        className="rounded-xl p-3 text-center"
                        style={
                          v.qty === 0
                            ? { background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }
                            : v.qty < 3
                              ? { background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }
                              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
                        }
                      >
                        <p className="text-xs font-cairo mb-1.5" style={{ color: '#9ca3af' }}>
                          {v.color ? `${v.size} / ${v.color}` : `مقاس ${v.size}`}
                        </p>
                        <p
                          className="text-xl font-bold font-cairo"
                          style={{ color: v.qty === 0 ? '#f87171' : v.qty < 3 ? '#fbbf24' : '#e5e7eb' }}
                        >
                          {v.qty}
                        </p>
                        <p className="text-[10px] font-cairo mt-0.5" style={{ color: v.qty === 0 ? '#f87171' : v.qty < 3 ? '#fbbf24' : '#6b7280' }}>
                          {v.qty === 0 ? 'نفد' : v.qty < 3 ? 'منخفض' : 'قطعة'}
                        </p>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>

            {/* Sales Stats */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(200,149,108,0.15)' }}>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={18} style={{ color: '#c8956c' }} />
                <h2 className="text-white font-bold font-cairo">إحصائيات المبيعات</h2>
              </div>

              {product.soldTotal === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(200,149,108,0.08)' }}>
                    <Package size={18} style={{ color: 'rgba(200,149,108,0.5)' }} />
                  </div>
                  <p className="text-gray-500 font-cairo text-sm">لا توجد مبيعات بعد لهذا المنتج</p>
                </div>
              ) : (
                <>
                  {/* Summary grid */}
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    <div
                      className="text-center rounded-xl py-3 px-2"
                      style={{ background: 'rgba(200,149,108,0.08)', border: '1px solid rgba(200,149,108,0.15)' }}
                    >
                      <p className="text-2xl font-bold font-cairo leading-none" style={{ color: '#c8956c' }}>{product.soldTotal}</p>
                      <p className="text-[11px] font-cairo text-gray-400 mt-1.5">قطعة مباعة</p>
                    </div>
                    <div
                      className="text-center rounded-xl py-3 px-2"
                      style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}
                    >
                      <p className="text-xs font-bold font-cairo text-emerald-400 leading-tight">
                        {product.revenueTotal >= 1000
                          ? `${(product.revenueTotal / 1000).toFixed(1)}ألف`
                          : product.revenueTotal.toFixed(0)}
                      </p>
                      <p className="text-[10px] font-cairo text-gray-500 mt-0.5">جنيه</p>
                      <p className="text-[11px] font-cairo text-gray-400 mt-1">إجمالي الإيراد</p>
                    </div>
                    <div
                      className="text-center rounded-xl py-3 px-2"
                      style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}
                    >
                      <p className="text-2xl font-bold font-cairo leading-none text-indigo-400">{product.ordersCount}</p>
                      <p className="text-[11px] font-cairo text-gray-400 mt-1.5">طلب</p>
                    </div>
                  </div>

                  {/* Per-size breakdown */}
                  {product.sizeSales.length > 0 && (
                    <div>
                      <p className="text-xs font-cairo mb-3" style={{ color: '#6b7280' }}>المبيعات حسب المقاس</p>
                      <div className="space-y-2.5">
                        {product.sizeSales.map((s, i) => {
                          const maxQty = product.sizeSales[0].qty
                          const pct = maxQty > 0 ? (s.qty / maxQty) * 100 : 0
                          return (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-xs font-cairo w-16 shrink-0 text-right" style={{ color: '#9ca3af' }}>
                                {s.size === 'بدون مقاس' ? 'غير محدد' : `مقاس ${s.size}`}
                              </span>
                              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #c8956c, #8b5e52)' }}
                                />
                              </div>
                              <span className="text-xs font-bold font-cairo w-14 text-left shrink-0" style={{ color: '#c8956c' }}>
                                {s.qty} قطعة
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
