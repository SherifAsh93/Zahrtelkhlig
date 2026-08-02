'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Search, Undo2, Plus, Minus, CheckCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface OrderItem {
  id: string
  productId: string
  nameAr: string
  price: number
  quantity: number
  size?: string | null
  color?: string | null
  image?: string | null
  alreadyReturned: number
  returnable: number
}

interface OrderLookup {
  id: string
  orderNumber: string
  createdAt: string
  customerName: string
  staffName: string | null
  source: string
  paymentMethod: string
  subtotal: number
  discount: number
  total: number
  items: OrderItem[]
}

const PAYMENT_OPTIONS = [
  { val: 'CASH_ON_DELIVERY', label: '💵 كاش' },
  { val: 'VODAFONE_CASH', label: '📱 فودافون' },
  { val: 'INSTAPAY', label: '💳 إنستاباي' },
  { val: 'BANK_TRANSFER', label: '🏦 تحويل' },
]

export default function POSReturnsPage() {
  const [orderNumberInput, setOrderNumberInput] = useState('')
  const [order, setOrder] = useState<OrderLookup | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [qtys, setQtys] = useState<Record<string, number>>({})
  const [reason, setReason] = useState('')
  const [refundMethod, setRefundMethod] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ returnNumber: string; refundAmount: number } | null>(null)

  async function lookupOrder(e?: React.FormEvent) {
    e?.preventDefault()
    if (!orderNumberInput.trim()) return
    setLoading(true)
    setError('')
    setOrder(null)
    setQtys({})
    const res = await fetch(`/api/pos/orders/lookup?orderNumber=${encodeURIComponent(orderNumberInput.trim())}`)
    const data = await res.json()
    if (res.ok) {
      setOrder(data)
      setRefundMethod(data.paymentMethod)
    } else {
      setError(data.error || 'حدث خطأ')
    }
    setLoading(false)
  }

  function setQty(itemId: string, qty: number, max: number) {
    setQtys(prev => ({ ...prev, [itemId]: Math.max(0, Math.min(max, qty)) }))
  }

  const selectedItems = order ? order.items.filter(i => (qtys[i.id] || 0) > 0) : []
  const refundTotal = selectedItems.reduce((s, i) => s + i.price * (qtys[i.id] || 0), 0)

  async function submitReturn() {
    if (!order || selectedItems.length === 0) return
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/pos/returns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order.id,
        items: selectedItems.map(i => ({ orderItemId: i.id, quantity: qtys[i.id] })),
        reason: reason || undefined,
        refundMethod,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setSuccess({ returnNumber: data.returnNumber, refundAmount: data.refundAmount })
      setOrder(null)
      setQtys({})
      setReason('')
      setOrderNumberInput('')
    } else {
      setError(data.error || 'حدث خطأ')
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white" dir="rtl">
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center gap-3 sticky top-0 z-40"
        style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}>
        <Link href="/pos" className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors">
          <ArrowRight size={20} />
        </Link>
        <p className="font-bold font-cairo text-sm flex items-center gap-1.5"><Undo2 size={16} className="text-amber-400" />مرتجعات</p>
      </div>

      <div className="p-4 max-w-2xl mx-auto space-y-4 pb-10">
        {success ? (
          <div className="bg-gray-800 rounded-2xl border border-emerald-600 p-8 text-center">
            <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold font-cairo mb-1">تم تسجيل المرتجع بنجاح</h2>
            <p className="text-gray-400 font-cairo text-sm mb-1">رقم المرتجع:</p>
            <p className="text-xl font-mono font-bold text-emerald-400 mb-3">{success.returnNumber}</p>
            <p className="text-lg font-bold font-cairo mb-6">{formatPrice(success.refundAmount)} تم استرجاعها</p>
            <button onClick={() => setSuccess(null)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-cairo font-bold text-sm transition-colors">
              مرتجع جديد
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={lookupOrder} className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={orderNumberInput} onChange={e => setOrderNumberInput(e.target.value)}
                  placeholder="ابحث برقم الفاتورة..." autoFocus
                  className="w-full pr-9 pl-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-base font-cairo text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
              </div>
              <button type="submit" disabled={loading || !orderNumberInput.trim()}
                className="px-5 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-xl font-cairo font-bold text-sm transition-colors">
                {loading ? '...' : 'بحث'}
              </button>
            </form>

            {error && (
              <div className="p-3 bg-red-900/30 border border-red-700 rounded-xl text-red-400 text-sm font-cairo text-center">
                {error}
              </div>
            )}

            {order && (
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 space-y-1">
                  <div className="flex justify-between text-sm font-cairo">
                    <span className="text-gray-400">رقم الفاتورة</span>
                    <span className="font-bold">{order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm font-cairo">
                    <span className="text-gray-400">التاريخ</span>
                    <span>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                  {order.staffName && (
                    <div className="flex justify-between text-sm font-cairo">
                      <span className="text-gray-400">البائع</span>
                      <span>{order.staffName}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-cairo">
                    <span className="text-gray-400">الإجمالي الحالي</span>
                    <span className="font-bold text-emerald-400">{formatPrice(order.total)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.map(item => (
                    <div key={item.id} className="bg-gray-800 rounded-xl border border-gray-700 p-3">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <div className="relative w-10 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-700">
                            <Image src={item.image} alt={item.nameAr} fill className="object-cover" unoptimized />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-cairo font-semibold text-white leading-tight">{item.nameAr}</p>
                          {(item.size || item.color) && (
                            <div className="flex gap-1 mt-0.5 flex-wrap">
                              {item.size && <span className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded font-cairo">مقاس {item.size}</span>}
                              {item.color && <span className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded font-cairo">{item.color}</span>}
                            </div>
                          )}
                          <p className="text-[11px] text-gray-500 font-cairo mt-0.5">
                            بيع: {item.quantity} · مرتجع سابقاً: {item.alreadyReturned} · متاح: {item.returnable}
                          </p>
                        </div>
                      </div>
                      {item.returnable > 0 ? (
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                          <span className="text-xs text-gray-400 font-cairo">كمية الاسترجاع</span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setQty(item.id, (qtys[item.id] || 0) - 1, item.returnable)}
                              className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center font-bold"><Minus size={14} /></button>
                            <span className="w-6 text-center text-sm font-bold font-cairo">{qtys[item.id] || 0}</span>
                            <button onClick={() => setQty(item.id, (qtys[item.id] || 0) + 1, item.returnable)}
                              className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center font-bold"><Plus size={14} /></button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-amber-500 font-cairo mt-2 pt-2 border-t border-gray-700">تم استرجاع كامل الكمية بالفعل</p>
                      )}
                    </div>
                  ))}
                </div>

                {selectedItems.length > 0 && (
                  <div className="bg-gray-800 rounded-xl border border-amber-600 p-4 space-y-3">
                    <div>
                      <label className="block text-xs text-gray-400 font-cairo mb-1.5">طريقة رد المبلغ</label>
                      <div className="grid grid-cols-2 gap-2">
                        {PAYMENT_OPTIONS.map(({ val, label }) => (
                          <button key={val} type="button" onClick={() => setRefundMethod(val)}
                            className={`py-2 rounded-xl text-xs font-cairo transition-colors ${refundMethod === val ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 font-cairo mb-1.5">سبب الاسترجاع (اختياري)</label>
                      <input value={reason} onChange={e => setReason(e.target.value)} placeholder="مقاس غير مناسب، عيب صناعة..."
                        className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-base font-cairo text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-sm font-cairo text-gray-300">إجمالي المبلغ المسترجع</span>
                      <span className="text-xl font-bold text-amber-400 font-cairo">{formatPrice(refundTotal)}</span>
                    </div>
                    <button onClick={submitReturn} disabled={submitting}
                      className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold font-cairo rounded-xl transition-colors text-sm">
                      {submitting ? 'جاري التسجيل...' : `تأكيد الاسترجاع — ${formatPrice(refundTotal)}`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
