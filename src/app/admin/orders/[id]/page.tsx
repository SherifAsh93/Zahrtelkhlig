'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ArrowRight, Phone, MapPin, Trash2, Edit, X, Printer } from 'lucide-react'
import { usePrinterStation } from '@/hooks/usePrinterStation'

const STATUS_MAP = {
  PENDING:    { label: 'في الانتظار', variant: 'warning' as const },
  CONFIRMED:  { label: 'مؤكد',        variant: 'info'    as const },
  PROCESSING: { label: 'قيد التجهيز', variant: 'info'    as const },
  SHIPPED:    { label: 'تم الشحن',    variant: 'info'    as const },
  DELIVERED:  { label: 'تم التوصيل', variant: 'success' as const },
  CANCELLED:  { label: 'ملغي',        variant: 'danger'  as const },
}

type OrderStatus = keyof typeof STATUS_MAP

interface OrderDetail {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  address: string
  city: string
  notes?: string
  status: OrderStatus
  source: string
  paymentMethod: string
  subtotal: number
  discount: number
  shipping: number
  total: number
  createdAt: string
  items: Array<{
    id: string
    nameAr: string
    price: number
    quantity: number
    size?: string
    color?: string
    image?: string
  }>
  user?: { name: string; email: string }
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState({ customerName: '', customerPhone: '', customerEmail: '', address: '', city: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [printing, setPrinting] = useState(false)
  const { status: printerStatus, printOrder } = usePrinterStation()

  useEffect(() => {
    fetch(`/api/admin/orders/${id}`).then((r) => r.json()).then((data) => {
      setOrder(data)
      setEditForm({
        customerName: data.customerName || '',
        customerPhone: data.customerPhone || '',
        customerEmail: data.customerEmail || '',
        address: data.address || '',
        city: data.city || '',
        notes: data.notes || '',
      })
    })
  }, [id])

  async function updateStatus(status: OrderStatus) {
    setUpdating(true)
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setOrder((o) => o ? { ...o, status } : o)
    setUpdating(false)
  }

  async function deleteOrder() {
    if (!confirm(`حذف الطلب ${order?.orderNumber}؟ لا يمكن التراجع.`)) return
    setDeleting(true)
    await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' })
    router.push('/admin/orders')
  }

  async function handleReprint() {
    if (!order) return
    setPrinting(true)
    try {
      await printOrder({
        orderNumber: order.orderNumber,
        paymentMethod: order.paymentMethod,
        subtotal: order.subtotal,
        discount: order.discount,
        total: order.total,
        createdAt: order.createdAt,
        items: order.items.map(i => ({ nameAr: i.nameAr, price: i.price, quantity: i.quantity, size: i.size ?? null, color: i.color ?? null })),
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'تعذرت الطباعة')
    } finally {
      setPrinting(false)
    }
  }

  async function saveEdit() {
    setSaving(true)
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    if (res.ok) {
      setOrder((o) => o ? { ...o, ...editForm } : o)
      setEditOpen(false)
    }
    setSaving(false)
  }

  if (!order) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
    </div>
  )

  const status = STATUS_MAP[order.status]

  return (
    <div dir="rtl">
      {/* Edit modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 font-cairo">تعديل بيانات الطلب</h2>
              <button onClick={() => setEditOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { key: 'customerName', label: 'اسم العميل', type: 'text' },
                { key: 'customerPhone', label: 'رقم الهاتف', type: 'tel' },
                { key: 'customerEmail', label: 'البريد الإلكتروني', type: 'email' },
                { key: 'city', label: 'المحافظة', type: 'text' },
                { key: 'address', label: 'العنوان', type: 'text' },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 font-cairo mb-1">{label}</label>
                  <input
                    type={type}
                    value={editForm[key as keyof typeof editForm]}
                    onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 font-cairo mb-1">ملاحظات</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button onClick={saveEdit} loading={saving} className="flex-1">حفظ التعديلات</Button>
              <Button variant="outline" onClick={() => setEditOpen(false)}>إلغاء</Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Link href="/admin/orders" className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
          <ArrowRight size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900 font-cairo">{order.orderNumber}</h1>
            {order.source === 'POS' && (
              <span className="bg-emerald-100 text-emerald-700 text-xs font-cairo font-bold px-2 py-0.5 rounded-full">نقطة البيع</span>
            )}
          </div>
          <p className="text-gray-500 text-sm font-cairo">{new Date(order.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
        <button
          onClick={() => setEditOpen(true)}
          className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
          title="تعديل"
        >
          <Edit size={18} />
        </button>
        <button
          onClick={deleteOrder}
          disabled={deleting}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          title="حذف الطلب"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 font-cairo mb-4">المنتجات</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="relative w-14 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                    <Image src={item.image || '/placeholder.jpg'} alt={item.nameAr} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold font-cairo">{item.nameAr}</p>
                    <p className="text-xs text-gray-500 font-cairo">
                      x{item.quantity} × {formatPrice(item.price)}
                      {item.size && <span className="mr-2 bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">مقاس {item.size}</span>}
                    </p>
                  </div>
                  <p className="font-bold font-cairo">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 space-y-2 text-sm font-cairo">
              <div className="flex justify-between text-gray-600"><span>المجموع الفرعي</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between text-gray-600"><span>الشحن</span><span>{order.shipping === 0 ? 'مجاني' : formatPrice(order.shipping)}</span></div>
              <div className="flex justify-between font-bold text-base"><span>الإجمالي</span><span className="text-brand-600">{formatPrice(order.total)}</span></div>
            </div>
          </div>

          {/* Update status */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 font-cairo mb-4">تحديث الحالة</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_MAP).map(([s, { label, variant }]) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s as OrderStatus)}
                  disabled={updating || order.status === s}
                  className={`px-3 py-2 rounded-xl text-sm font-cairo transition-colors disabled:opacity-50 ${
                    order.status === s ? 'bg-brand-600 text-white' : 'border border-gray-200 text-gray-700 hover:border-brand-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Customer info */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 font-cairo">بيانات العميل</h2>
              <button onClick={() => setEditOpen(true)} className="p-1.5 text-gray-400 hover:text-brand-600 rounded-lg transition-colors">
                <Edit size={15} />
              </button>
            </div>
            <div className="space-y-3 text-sm font-cairo">
              <p className="font-semibold text-gray-900">{order.customerName}</p>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={14} className="text-brand-400" />
                {order.customerPhone}
              </div>
              {order.customerEmail && <p className="text-gray-500">{order.customerEmail}</p>}
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin size={14} className="text-brand-400 mt-0.5 shrink-0" />
                {order.city} - {order.address}
              </div>
              {order.notes && (
                <div className="p-3 bg-amber-50 rounded-lg text-amber-700">
                  ملاحظة: {order.notes}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 font-cairo mb-3">الدفع</h2>
            <p className="text-sm font-cairo text-gray-700">
              {order.paymentMethod === 'CASH_ON_DELIVERY' ? '💵 الدفع عند الاستلام'
                : order.paymentMethod === 'VODAFONE_CASH' ? '📱 فودافون كاش'
                : order.paymentMethod === 'BANK_TRANSFER' ? '🏦 تحويل بنكي'
                : '💳 إنستاباي'}
            </p>
          </div>

          {order.source === 'POS' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 font-cairo mb-3">الطباعة</h2>
              <button
                onClick={handleReprint}
                disabled={printing || printerStatus.state !== 'connected'}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-cairo font-semibold border-2 border-brand-200 text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-50"
              >
                <Printer size={16} />
                {printing ? 'جاري الطباعة...' : 'إعادة طباعة الفاتورة'}
              </button>
              {printerStatus.state !== 'connected' && (
                <p className="text-xs text-gray-400 font-cairo text-center mt-2">
                  لا توجد طابعة مقترنة على هذا الجهاز — قم بإقران الطابعة من صفحة نقطة البيع أولاً
                </p>
              )}
            </div>
          )}

          <button
            onClick={deleteOrder}
            disabled={deleting}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-red-200 text-red-600 rounded-xl text-sm font-cairo font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Trash2 size={16} />
            {deleting ? 'جاري الحذف...' : 'حذف هذا الطلب'}
          </button>
        </div>
      </div>
    </div>
  )
}
