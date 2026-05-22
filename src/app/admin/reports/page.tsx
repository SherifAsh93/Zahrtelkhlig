'use client'
import { useState, useEffect, useCallback } from 'react'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag, TrendingUp, Monitor, Store, Package, Snowflake, Sun, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react'

interface SoldItem {
  productId: string
  nameAr: string
  qty: number
  revenue: number
  sizes: Record<string, number>
}

interface InventoryItem {
  id: string
  nameAr: string
  sku?: string
  season: 'WINTER' | 'SUMMER'
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
  soldItems: SoldItem[]
  inventory: InventoryItem[]
}

function dateString(d: Date) {
  return d.toISOString().split('T')[0]
}

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

  function prevDay() {
    const d = new Date(date)
    d.setDate(d.getDate() - 1)
    setDate(dateString(d))
  }
  function nextDay() {
    const d = new Date(date)
    d.setDate(d.getDate() + 1)
    const today = new Date()
    if (d <= today) setDate(dateString(d))
  }

  const isToday = date === dateString(new Date())

  const lowStock = data?.inventory.filter((p) => p.stock < 5) || []

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-cairo">التقارير</h1>
          <p className="text-sm text-gray-500 font-cairo mt-0.5">مبيعات يومية وحالة المخزون</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'sales', label: 'تقرير المبيعات' },
          { key: 'inventory', label: 'حالة المخزون' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as 'sales' | 'inventory')}
            className={`px-4 py-2 rounded-full text-sm font-cairo font-medium transition-colors ${
              tab === key ? 'bg-brand-600 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-brand-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'sales' && (
        <>
          {/* Date navigator */}
          <div className="flex items-center gap-3 mb-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <button onClick={prevDay} className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
              <ChevronRight size={18} />
            </button>
            <input
              type="date"
              value={date}
              max={dateString(new Date())}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 text-center font-cairo font-bold text-gray-900 border-0 focus:outline-none bg-transparent text-sm"
            />
            <button onClick={nextDay} disabled={isToday} className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors disabled:opacity-30">
              <ChevronLeft size={18} />
            </button>
            {isToday && <span className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded-full font-cairo">اليوم</span>}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
            </div>
          ) : data && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'إجمالي الإيرادات', value: formatPrice(data.totalRevenue), icon: TrendingUp, color: 'bg-green-500' },
                  { label: 'إجمالي الطلبات',    value: data.totalOrders,             icon: ShoppingBag, color: 'bg-brand-500' },
                  { label: 'طلبات الموقع',      value: data.onlineOrders,            icon: Monitor,     color: 'bg-blue-500' },
                  { label: 'مبيعات المحل',      value: data.posOrders,               icon: Store,       color: 'bg-emerald-500' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center mb-3`}>
                      <Icon size={16} className="text-white" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 font-cairo">{value}</p>
                    <p className="text-xs text-gray-500 font-cairo mt-0.5">{label}</p>
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
                    {data.soldItems.map((item) => (
                      <div key={item.productId} className="flex items-center gap-4 p-4">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-900 font-cairo">{item.nameAr}</p>
                          {Object.keys(item.sizes).length > 0 && (
                            <div className="flex gap-1.5 mt-1 flex-wrap">
                              {Object.entries(item.sizes).map(([size, qty]) => (
                                <span key={size} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-cairo">
                                  {size}: {qty}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-left shrink-0">
                          <p className="font-bold text-gray-900 font-cairo">{item.qty} قطعة</p>
                          <p className="text-sm text-brand-600 font-cairo">{formatPrice(item.revenue)}</p>
                        </div>
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
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-bold text-gray-900 font-cairo">المخزون الحالي ({data?.inventory.length} منتج)</h2>
              </div>
              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {['الكود', 'المنتج', 'الموسم', 'مقاس 44', 'مقاس 46', 'مقاس 48', 'مقاس 50', 'الإجمالي'].map((h) => (
                        <th key={h} className="px-4 py-3 text-right text-xs font-bold text-gray-600 font-cairo">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data?.inventory.map((p) => {
                      const ss = p.sizeStock as Record<string, number> | null
                      return (
                        <tr key={p.id} className={p.stock < 5 ? 'bg-amber-50' : 'hover:bg-gray-50'}>
                          <td className="px-4 py-3 text-xs font-mono text-gray-600">{p.sku || '—'}</td>
                          <td className="px-4 py-3 text-sm font-semibold font-cairo text-gray-900">{p.nameAr}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-cairo px-2 py-0.5 rounded-full ${p.season === 'WINTER' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                              {p.season === 'WINTER' ? <span className="flex items-center gap-1"><Snowflake size={10} /> شتوي</span> : <span className="flex items-center gap-1"><Sun size={10} /> صيفي</span>}
                            </span>
                          </td>
                          {['44', '46', '48', '50'].map((size) => (
                            <td key={size} className="px-4 py-3 text-center">
                              {p.sizes.includes(size) || (ss && size in ss) ? (
                                <span className={`text-sm font-bold font-cairo ${(ss?.[size] ?? 0) === 0 ? 'text-red-500' : (ss?.[size] ?? 0) < 3 ? 'text-amber-600' : 'text-gray-900'}`}>
                                  {ss?.[size] ?? 0}
                                </span>
                              ) : (
                                <span className="text-gray-300 text-xs">—</span>
                              )}
                            </td>
                          ))}
                          <td className="px-4 py-3 text-center font-bold font-cairo text-sm">
                            <span className={p.stock < 5 ? 'text-amber-600' : 'text-gray-900'}>{p.stock}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {/* Mobile cards */}
              <div className="lg:hidden divide-y">
                {data?.inventory.map((p) => {
                  const ss = p.sizeStock as Record<string, number> | null
                  return (
                    <div key={p.id} className={`p-4 ${p.stock < 5 ? 'bg-amber-50' : ''}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-sm text-gray-900 font-cairo">{p.nameAr}</p>
                          {p.sku && <p className="text-xs font-mono text-gray-500">{p.sku}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-cairo px-2 py-0.5 rounded-full ${p.season === 'WINTER' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                            {p.season === 'WINTER' ? '❄️ شتوي' : '☀️ صيفي'}
                          </span>
                          {p.stock < 5 && <AlertTriangle size={14} className="text-amber-500" />}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {['44', '46', '48', '50'].map((size) => {
                          const qty = ss?.[size] ?? 0
                          const hasSize = p.sizes.includes(size) || (ss && size in ss)
                          return (
                            <div key={size} className={`text-center p-1.5 rounded-lg ${hasSize ? (qty === 0 ? 'bg-red-50' : qty < 3 ? 'bg-amber-50' : 'bg-gray-50') : 'bg-gray-50 opacity-30'}`}>
                              <p className="text-[10px] text-gray-500 font-cairo">{size}</p>
                              <p className={`font-bold text-sm font-cairo ${qty === 0 && hasSize ? 'text-red-500' : qty < 3 && hasSize ? 'text-amber-600' : 'text-gray-800'}`}>
                                {hasSize ? qty : '—'}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                      <p className="text-xs text-gray-500 font-cairo mt-2">الإجمالي: <span className={`font-bold ${p.stock < 5 ? 'text-amber-600' : 'text-gray-900'}`}>{p.stock} قطعة</span></p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
