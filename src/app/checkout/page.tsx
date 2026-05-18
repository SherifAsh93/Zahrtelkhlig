'use client'
import { useActionState, useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'
import { createOrder } from '@/app/actions/orders'
import { formatPrice, SHIPPING_COST, FREE_SHIPPING_THRESHOLD, CITIES } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'
import Link from 'next/link'

export default function CheckoutPage() {
  const { items, total } = useCartStore()
  const [state, action, pending] = useActionState(createOrder, undefined)
  const subtotal = total()
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : items.length > 0 ? SHIPPING_COST : 0
  const grandTotal = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center" dir="rtl">
        <h2 className="text-xl font-bold font-cairo mb-4">السلة فارغة</h2>
        <Link href="/products" className="px-6 py-2 bg-rose-600 text-white rounded-full font-cairo hover:bg-rose-700">
          تسوقي الآن
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10" dir="rtl">
      <h1 className="text-2xl font-bold text-gray-900 font-cairo mb-8">إتمام الشراء</h1>

      <form action={action}>
        <input type="hidden" name="cart" value={JSON.stringify(items)} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {state?.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-cairo">
                {state.error}
              </div>
            )}

            {/* Personal info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 font-cairo mb-5">بيانات الشخصية</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">الاسم الكامل *</label>
                  <input
                    name="customerName"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 font-cairo"
                    placeholder="اسمك الكامل"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">رقم الهاتف *</label>
                  <input
                    name="customerPhone"
                    required
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 font-cairo"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">البريد الإلكتروني</label>
                  <input
                    name="customerEmail"
                    type="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 font-cairo"
                    placeholder="example@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Shipping address */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 font-cairo mb-5">عنوان التوصيل</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">المحافظة *</label>
                  <select
                    name="city"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 font-cairo bg-white"
                  >
                    <option value="">اختاري المحافظة</option>
                    {CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">العنوان التفصيلي *</label>
                  <textarea
                    name="address"
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 font-cairo resize-none"
                    placeholder="الحي، الشارع، رقم المبنى..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">ملاحظات</label>
                  <input
                    name="notes"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 font-cairo"
                    placeholder="أي تعليمات خاصة..."
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 font-cairo mb-5">طريقة الدفع</h2>
              <div className="space-y-3">
                {[
                  { value: 'CASH_ON_DELIVERY', label: 'الدفع عند الاستلام', icon: '💵' },
                  { value: 'VODAFONE_CASH', label: 'فودافون كاش', icon: '📱' },
                  { value: 'INSTAPAY', label: 'إنستاباي', icon: '💳' },
                ].map((method) => (
                  <label key={method.value} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-rose-400 transition-colors has-[:checked]:border-rose-500 has-[:checked]:bg-rose-50">
                    <input type="radio" name="paymentMethod" value={method.value} defaultChecked={method.value === 'CASH_ON_DELIVERY'} className="accent-rose-600" />
                    <span className="text-xl">{method.icon}</span>
                    <span className="font-cairo text-sm font-medium text-gray-900">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20">
              <h2 className="font-bold text-gray-900 font-cairo mb-4">ملخص الطلب</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-2.5 items-center">
                    <div className="relative w-12 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      <Image src={item.image || '/placeholder.jpg'} alt={item.nameAr} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-cairo text-gray-900 line-clamp-2">{item.nameAr}</p>
                      <p className="text-xs text-gray-500 font-cairo">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 font-cairo shrink-0">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-2 text-sm font-cairo">
                <div className="flex justify-between text-gray-600">
                  <span>المجموع الفرعي</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>الشحن</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'مجاني' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t pt-2">
                  <span>الإجمالي</span>
                  <span className="text-rose-600">{formatPrice(grandTotal)}</span>
                </div>
              </div>
              <Button type="submit" loading={pending} className="w-full mt-4" size="lg">
                تأكيد الطلب
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
