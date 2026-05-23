'use client'
import { useState, useEffect, useCallback } from 'react'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, TrendingUp, Monitor, Store, Package, Snowflake, Sun, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'

interface SoldItem {
  productId: string
  nameAr: string
  qty: number
  revenue: number
  variants: { label: string; qty: number }[]
}

interface InventoryItem {
  id: string
  nameAr: string
  sku?: string
  season: 'WINTER' | 'SUMMER'
  variants: { size: string; color: string; qty: number }[] | null
  sizes: string[]
  sizeStock: Record<string, number> | null
  stock: number
  price: number
}

interface ReportData {
  date: string
  totalRevenue: number
  totalOrders: number
  onlineOrders: number
  posOrders: number
  onlineRevenue: number
  posRevenue: number
  soldItems: SoldItem[]
  inventory: InventoryItem[]
}

function dateString(d: Date) { return d.toISOString().split('T')[0] }

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(dateString(new Date()))
  const [tab, setTab] = useState<'sales' | 'inventory'>('sales')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/reports?date=${date}`)
    setData(await res.json())
    setLoading(false)
  }, [date])

  useEffect(() => { load() }, [load])

  function prevDay() { const d = new Date(date); d.setDate(d.getDate() - 1); setDate(dateString(d)) }
  function nextDay() { const d = new Date(date); d.setDate(d.getDate() + 1); if (d <= new Date()) setDate(dateString(d)) }
  const isToday = date === dateString(new Date())
  const lowStock = data?.inventory.filter(p => p.stock < 5) || []

  return (
    <div dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 font-cairo">التقارير</h1>
        <p className="text-sm text-gray-500 font-cairo mt-0.5">مبيعات يومية وحالة المخزون</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[{ key: 'sales', label: 'تقرير المبيعات' }, { key: 'inventory', label: 'حالة المخزون' }].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key as 'sales' | 'inventory')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-cairo font-medium transition-colors ${tab === key ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-brand-400'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'sales' && (
        <>
          {/* Date navigator */}
          <div className="flex items-center gap-2 mb-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
            <button onClick={prevDay} className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors shrink-0">
              <ChevronRight size={20} />
            </button>
            <input type="date" value={date} max={dateString(new Date())} onChange={(e) => setDate(e.target.value)}
              className="flex-1 text-center font-cairo font-bold text-gray-900 border-0 focus:outline-none bg-transparent text-sm" />
            <button onClick={nextDay} disabled={isToday} className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors disabled:opacity-30 shrink-0">
              <ChevronLeft size={20} />
            </button>
            {isToday && <span className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded-full font-cairo shrink-0">اليوم</span>}
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" /></div>
          ) : data && (
            <>
              {/* Stats grid — 2 cols on mobile, 4 on desktop */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'إجمالي الإيرادات', value: formatPrice(data.totalRevenue), icon: TrendingUp, color: 'bg-green-500' },
                  { label: 'إجمالي الطلبات',    value: String(data.totalOrders),        icon: ShoppingBag, color: 'bg-brand-500' },
                  { label: `موقع (${formatPrice(data.onlineRevenue)})`, value: String(data.onlineOrders) + ' طلب', icon: Monitor, color: 'bg-blue-500' },
                  { label: `محل (${formatPrice(data.posRevenue)})`,     value: String(data.posOrders) + ' طلب',   icon: Store,   color: 'bg-emerald-500' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center mb-3`}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 font-cairo leading-tight">{value}</p>
                    <p className="text-xs text-gray-500 font-cairo mt-0.5 leading-tight">{label}</p>
                  </div>
                ))}
              </div>

              {/* Sold items */}
              {data.soldItems.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
                  <ShoppingBag size={40} className="mx-auto mb-3 text-gray-200" />
                  <p className="text-gray-500 font-cairo">لا توجد مبيعات في هذا اليوم</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 border-b">
                    <h2 className="font-bold text-gray-900 font-cairo">المنتجات المباعة ({data.soldItems.length})</h2>
                  </div>
                  <div className="divide-y">
                    {data.soldItems.map(item => (
                      <div key={item.productId} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-semibold text-sm text-gray-900 font-cairo flex-1 min-w-0">{item.nameAr}</p>
                          <div className="text-left shrink-0">
                            <p className="font-bold text-gray-900 font-cairo">{item.qty} قطعة</p>
                            <p className="text-sm text-brand-600 font-cairo">{formatPrice(item.revenue)}</p>
                          </div>
                        </div>
                        {item.variants.length > 0 && (
                          <div className="flex gap-1.5 mt-2 flex-wrap">
                            {item.variants.map(v => (
                              <span key={v.label} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-cairo">
                                {v.label}: {v.qty}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {tab === 'inventory' && (
        <>
          {lowStock.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-amber-800 font-cairo text-sm">{lowStock.length} منتج بمخزون منخفض</p>
                <p className="text-amber-700 font-cairo text-xs mt-0.5">توجه لصفحة المخزون لتحديث الكميات</p>
              </div>
            </div>
          )}
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" /></div>
          ) : (
            <div className="space-y-3">
              {data?.inventory.map(p => {
                const variants = p.variants && p.variants.length > 0
                  ? p.variants
                  : p.sizes.map(s => ({ size: s, color: '', qty: p.sizeStock?.[s] ?? 0 }))
                const isLow = p.stock < 5
                return (
                  <div key={p.id} className={`bg-white rounded-2xl border shadow-sm p-4 ${isLow ? 'border-amber-200' : 'border-gray-100'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm text-gray-900 font-cairo">{p.nameAr}</p>
                          {p.sku && <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{p.sku}</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-cairo px-2 py-0.5 rounded-full ${p.season === 'WINTER' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                            {p.season === 'WINTER' ? <span className="flex items-center gap-1"><Snowflake size={10} />شتوي</span> : <span className="flex items-center gap-1"><Sun size={10} />صيفي</span>}
                          </span>
                          {isLow && <span className="text-xs text-amber-600 font-cairo flex items-center gap-1"><AlertTriangle size={10} />منخفض</span>}
                        </div>
                      </div>
                      <p className={`text-lg font-bold font-cairo shrink-0 ${isLow ? 'text-amber-600' : 'text-gray-900'}`}>{p.stock}</p>
                    </div>
                    {variants.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {variants.map((v, idx) => {
                          const qty = v.qty
                          return (
                            <div key={idx} className={`p-2 rounded-xl border text-center ${qty === 0 ? 'border-red-100 bg-red-50' : qty < 3 ? 'border-amber-100 bg-amber-50' : 'border-gray-100 bg-gray-50'}`}>
                              <p className="text-xs font-bold font-cairo text-gray-700">مقاس {v.size}</p>
                              {v.color && <p className="text-[10px] text-gray-500 font-cairo">{v.color}</p>}
                              <p className={`text-lg font-bold font-cairo mt-0.5 ${qty === 0 ? 'text-red-500' : qty < 3 ? 'text-amber-600' : 'text-gray-900'}`}>{qty}</p>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 font-cairo">لا توجد متغيرات مُعرَّفة</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
