'use client'
import { useState, useEffect } from 'react'
import { X, TrendingUp, ShoppingBag, Monitor, Store, Package, AlertTriangle, Snowflake, Sun } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface SoldItem { productId: string; nameAr: string; qty: number; revenue: number; variants: { label: string; qty: number }[] }
interface InventoryItem { id: string; nameAr: string; sku?: string; season: 'WINTER' | 'SUMMER'; variants: { size: string; color: string; qty: number }[] | null; sizes: string[]; sizeStock: Record<string, number> | null; stock: number }
interface ReportData { totalRevenue: number; totalOrders: number; onlineOrders: number; posOrders: number; onlineRevenue: number; posRevenue: number; soldItems: SoldItem[]; inventory: InventoryItem[] }

function dateString(d: Date) { return d.toISOString().split('T')[0] }

export default function DashboardQuickAccess() {
  const [modal, setModal] = useState<'report' | 'inventory' | null>(null)
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!modal) return
    setLoading(true)
    fetch(`/api/admin/reports?date=${dateString(new Date())}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [modal])

  function close() { setModal(null) }

  return (
    <>
      {/* Quick access cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button onClick={() => setModal('report')}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-brand-200 transition-all text-right group">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp size={18} className="text-white" />
          </div>
          <p className="font-bold text-gray-900 font-cairo text-sm">تقرير اليوم</p>
          <p className="text-xs text-gray-500 font-cairo mt-0.5">مبيعات المحل والموقع</p>
        </button>
        <button onClick={() => setModal('inventory')}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-brand-200 transition-all text-right group">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center mb-3">
            <Package size={18} className="text-white" />
          </div>
          <p className="font-bold text-gray-900 font-cairo text-sm">المخزن الحالي</p>
          <p className="text-xs text-gray-500 font-cairo mt-0.5">كل منتج بالمقاس واللون</p>
        </button>
      </div>

      {/* Modal backdrop */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={close}>
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-lg max-h-[92vh] flex flex-col shadow-2xl rounded-t-2xl" onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white rounded-t-2xl z-10">
              <div className="flex items-center gap-2">
                {modal === 'report' ? <TrendingUp size={18} className="text-green-600" /> : <Package size={18} className="text-brand-600" />}
                <h2 className="font-bold text-gray-900 font-cairo">
                  {modal === 'report' ? `تقرير اليوم — ${new Date().toLocaleDateString('ar-EG')}` : 'المخزن الحالي'}
                </h2>
              </div>
              <button onClick={close} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg transition-colors"><X size={18} /></button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 p-4 space-y-4" dir="rtl">
              {loading ? (
                <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" /></div>
              ) : !data ? null : modal === 'report' ? (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'إجمالي الإيرادات', value: formatPrice(data.totalRevenue), color: 'text-green-600', bg: 'bg-green-50' },
                      { label: 'إجمالي الطلبات',    value: String(data.totalOrders),       color: 'text-brand-600', bg: 'bg-brand-50' },
                      { label: `موقع • ${formatPrice(data.onlineRevenue)}`, value: `${data.onlineOrders} طلب`, color: 'text-blue-600', bg: 'bg-blue-50' },
                      { label: `محل • ${formatPrice(data.posRevenue)}`,     value: `${data.posOrders} طلب`,   color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    ].map(({ label, value, color, bg }) => (
                      <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                        <p className={`text-xl font-bold font-cairo ${color}`}>{value}</p>
                        <p className="text-xs text-gray-600 font-cairo mt-0.5 leading-tight">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Sold items */}
                  {data.soldItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 font-cairo">
                      <ShoppingBag size={36} className="mx-auto mb-2 text-gray-200" />
                      لا توجد مبيعات اليوم
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-2xl overflow-hidden">
                      <p className="px-4 py-3 text-sm font-bold text-gray-700 font-cairo border-b border-gray-200 bg-white">
                        المنتجات المباعة ({data.soldItems.length})
                      </p>
                      <div className="divide-y divide-gray-100">
                        {data.soldItems.map(item => (
                          <div key={item.productId} className="px-4 py-3 bg-white">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-gray-900 font-cairo flex-1">{item.nameAr}</p>
                              <div className="text-left shrink-0">
                                <p className="text-sm font-bold text-gray-900 font-cairo">{item.qty} ق</p>
                                <p className="text-xs text-green-600 font-cairo">{formatPrice(item.revenue)}</p>
                              </div>
                            </div>
                            {item.variants.length > 0 && (
                              <div className="flex gap-1 mt-1.5 flex-wrap">
                                {item.variants.map(v => (
                                  <span key={v.label} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-cairo">{v.label}: {v.qty}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Inventory modal */
                <>
                  {data.inventory.filter(p => p.stock < 5).length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
                      <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                      <p className="text-sm text-amber-800 font-cairo">{data.inventory.filter(p => p.stock < 5).length} منتج بمخزون منخفض</p>
                    </div>
                  )}
                  <div className="space-y-3">
                    {data.inventory.map(p => {
                      const variants = p.variants && p.variants.length > 0
                        ? p.variants
                        : p.sizes.map(s => ({ size: s, color: '', qty: p.sizeStock?.[s] ?? 0 }))
                      const isLow = p.stock < 5
                      return (
                        <div key={p.id} className={`rounded-xl border p-3 ${isLow ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-white'}`}>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-sm font-bold text-gray-900 font-cairo">{p.nameAr}</p>
                                {p.sku && <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{p.sku}</span>}
                              </div>
                              <span className={`text-[10px] font-cairo px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 mt-0.5 ${p.season === 'WINTER' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                {p.season === 'WINTER' ? <><Snowflake size={9} />شتوي</> : <><Sun size={9} />صيفي</>}
                              </span>
                            </div>
                            <p className={`text-base font-bold font-cairo shrink-0 ${isLow ? 'text-amber-600' : 'text-gray-900'}`}>{p.stock} ق</p>
                          </div>
                          {variants.length > 0 && (
                            <div className="grid grid-cols-3 gap-1.5">
                              {variants.map((v, idx) => (
                                <div key={idx} className={`text-center p-1.5 rounded-lg ${v.qty === 0 ? 'bg-red-100' : v.qty < 3 ? 'bg-amber-100' : 'bg-gray-100'}`}>
                                  <p className="text-[10px] font-bold text-gray-700 font-cairo">{v.size}</p>
                                  {v.color && <p className="text-[9px] text-gray-500 font-cairo truncate">{v.color}</p>}
                                  <p className={`text-sm font-bold font-cairo ${v.qty === 0 ? 'text-red-600' : v.qty < 3 ? 'text-amber-700' : 'text-gray-900'}`}>{v.qty}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-5 py-4 border-t">
              {modal === 'report' ? (
                <a href="/admin/reports" className="block w-full text-center py-2.5 bg-brand-600 text-white rounded-xl font-cairo text-sm font-bold hover:bg-brand-700 transition-colors">
                  التقرير الكامل
                </a>
              ) : (
                <a href="/admin/inventory" className="block w-full text-center py-2.5 bg-brand-600 text-white rounded-xl font-cairo text-sm font-bold hover:bg-brand-700 transition-colors">
                  إدارة المخزن
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
