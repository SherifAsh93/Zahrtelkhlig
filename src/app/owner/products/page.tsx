'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import {
  ArrowLeft, Package, AlertTriangle, Snowflake, Sun,
  Search, X, Star,
} from 'lucide-react'

const LOGO_URL = 'https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/logo.jpg'

interface Product {
  id: string
  nameAr: string
  sku: string | null
  price: number

  season: 'WINTER' | 'SUMMER'
  stock: number
  images: string[]
  sizes: string[]
  featured: boolean
  category: { nameAr: string } | null
}

type SeasonFilter = 'ALL' | 'WINTER' | 'SUMMER'
type StockFilter = 'all' | 'low' | 'out'

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return (
    <span className="text-xs font-bold font-cairo px-2 py-0.5 rounded-lg shrink-0" style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
      نفد
    </span>
  )
  if (stock < 10) return (
    <span className="text-xs font-bold font-cairo px-2 py-0.5 rounded-lg shrink-0 flex items-center gap-1" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
      <AlertTriangle size={10} />
      {stock} قطعة
    </span>
  )
  return (
    <span className="text-xs font-cairo px-2 py-0.5 rounded-lg shrink-0" style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399' }}>
      {stock} قطعة
    </span>
  )
}

export default function OwnerProductsListPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [season, setSeason] = useState<SeasonFilter>('ALL')
  const [stockFilter, setStockFilter] = useState<StockFilter>('all')

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (season !== 'ALL') params.set('season', season)
    if (stockFilter !== 'all') params.set('stock', stockFilter)
    const res = await fetch(`/api/owner/products?${params}`)
    setProducts(await res.json())
    setLoading(false)
  }, [search, season, stockFilter])

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [load, search])

  const outOfStock = products.filter(p => p.stock === 0).length
  const lowStock = products.filter(p => p.stock > 0 && p.stock < 10).length

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
            <span className="text-sm font-bold font-cairo text-white">جميع المنتجات</span>
          </div>
        </div>
      </header>

      {/* Sticky filters */}
      <div
        className="sticky top-[52px] z-40 px-4 sm:px-6 py-3 space-y-2.5"
        style={{ background: 'rgba(15,5,8,0.92)', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}
      >
        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#6b7280' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو الكود..."
            className="w-full pr-9 pl-9 py-2.5 rounded-xl text-sm font-cairo text-white placeholder-gray-600 focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6b7280' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter pills row */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          {/* Season */}
          {(['ALL', 'WINTER', 'SUMMER'] as SeasonFilter[]).map(s => (
            <button
              key={s}
              onClick={() => setSeason(s)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-cairo font-medium shrink-0 transition-all"
              style={season === s
                ? s === 'WINTER' ? { background: 'rgba(99,102,241,0.3)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.4)' }
                  : s === 'SUMMER' ? { background: 'rgba(245,158,11,0.3)', color: '#fcd34d', border: '1px solid rgba(245,158,11,0.4)' }
                  : { background: 'rgba(200,149,108,0.2)', color: '#c8956c', border: '1px solid rgba(200,149,108,0.3)' }
                : { background: 'rgba(255,255,255,0.05)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {s === 'WINTER' && <Snowflake size={11} />}
              {s === 'SUMMER' && <Sun size={11} />}
              {s === 'ALL' ? 'الكل' : s === 'WINTER' ? 'شتوي' : 'صيفي'}
            </button>
          ))}

          <div className="w-px shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* Stock status */}
          {([
            { key: 'all', label: 'كل المخزون' },
            { key: 'low', label: 'مخزون منخفض' },
            { key: 'out', label: 'نفد' },
          ] as { key: StockFilter; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStockFilter(key)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-cairo font-medium shrink-0 transition-all"
              style={stockFilter === key
                ? key === 'out' ? { background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }
                  : key === 'low' ? { background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }
                  : { background: 'rgba(200,149,108,0.2)', color: '#c8956c', border: '1px solid rgba(200,149,108,0.3)' }
                : { background: 'rgba(255,255,255,0.05)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {key === 'out' || key === 'low' ? <AlertTriangle size={11} /> : null}
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 sm:px-6 py-4 max-w-2xl mx-auto pb-10">
        {/* Summary bar */}
        {!loading && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-cairo font-bold text-white">{products.length} منتج</p>
            <div className="flex items-center gap-3">
              {outOfStock > 0 && (
                <span className="text-xs font-cairo" style={{ color: '#f87171' }}>{outOfStock} نفد</span>
              )}
              {lowStock > 0 && (
                <span className="text-xs font-cairo" style={{ color: '#fbbf24' }}>{lowStock} منخفض</span>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div
              className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: 'rgba(200,149,108,0.3)', borderTopColor: '#c8956c' }}
            />
            <p className="text-gray-400 font-cairo text-sm">جاري تحميل المنتجات...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(200,149,108,0.08)' }}>
              <Package size={28} style={{ color: 'rgba(200,149,108,0.4)' }} />
            </div>
            <p className="text-gray-400 font-cairo text-sm">لا توجد منتجات</p>
            {(search || season !== 'ALL' || stockFilter !== 'all') && (
              <button
                onClick={() => { setSearch(''); setSeason('ALL'); setStockFilter('all') }}
                className="text-xs font-cairo px-3 py-1.5 rounded-lg mt-1"
                style={{ background: 'rgba(200,149,108,0.1)', color: '#c8956c' }}
              >
                مسح الفلاتر
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {products.map(p => (
              <Link
                key={p.id}
                href={`/owner/products/${p.id}`}
                className="flex items-center gap-3 rounded-2xl p-3 transition-all active:scale-[0.99]"
                style={{ background: 'rgba(255,255,255,0.04)', border: p.stock === 0 ? '1px solid rgba(239,68,68,0.2)' : p.stock < 10 ? '1px solid rgba(245,158,11,0.15)' : '1px solid rgba(200,149,108,0.1)' }}
              >
                {/* Image */}
                <div className="relative w-16 h-20 rounded-xl overflow-hidden shrink-0" style={{ background: 'rgba(200,149,108,0.06)' }}>
                  {p.images[0] ? (
                    <Image src={p.images[0]} alt={p.nameAr} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={20} style={{ color: 'rgba(200,149,108,0.3)' }} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold font-cairo text-white leading-snug">{p.nameAr}</p>
                    {p.featured && <Star size={13} className="shrink-0 mt-0.5 text-amber-400 fill-amber-400" />}
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-1">
                    {p.sku && (
                      <span className="text-[11px] font-mono" style={{ color: '#6b7280' }}>#{p.sku}</span>
                    )}
                    <span
                      className="text-[11px] font-cairo px-1.5 py-0.5 rounded-md flex items-center gap-0.5"
                      style={p.season === 'WINTER'
                        ? { background: 'rgba(99,102,241,0.12)', color: '#a5b4fc' }
                        : { background: 'rgba(245,158,11,0.12)', color: '#fcd34d' }}
                    >
                      {p.season === 'WINTER' ? <Snowflake size={9} /> : <Sun size={9} />}
                      {p.season === 'WINTER' ? 'شتوي' : 'صيفي'}
                    </span>
                    {p.category && (
                      <span className="text-[11px] font-cairo" style={{ color: '#6b7280' }}>{p.category.nameAr}</span>
                    )}
                  </div>

                  {/* Price + Stock */}
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm font-bold font-cairo" style={{ color: '#c8956c' }}>{formatPrice(p.price)}</p>
                    <StockBadge stock={p.stock} />
                  </div>

                  {/* Sizes strip */}
                  {p.sizes.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {p.sizes.map(s => (
                        <span key={s} className="text-[10px] font-cairo px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Chevron */}
                <ArrowLeft size={16} className="shrink-0" style={{ color: '#374151' }} />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
