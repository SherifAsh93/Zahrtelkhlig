'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice, SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore()
  const subtotal = total()
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : items.length > 0 ? SHIPPING_COST : 0
  const grandTotal = subtotal + shipping

  return (
    <div className="max-w-6xl mx-auto px-4 py-10" dir="rtl">
      <h1 className="text-2xl font-bold text-gray-900 font-cairo mb-8 flex items-center gap-2">
        <ShoppingCart size={24} className="text-brand-600" />
        سلة التسوق
        {items.length > 0 && (
          <span className="text-base font-normal text-gray-500">({items.length} منتج)</span>
        )}
      </h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingCart size={64} className="text-gray-200 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 font-cairo mb-2">السلة فارغة</h2>
          <p className="text-gray-500 font-cairo mb-8">لم تقومي بإضافة أي منتجات بعد</p>
          <Link href="/products" className="px-8 py-3 bg-brand-600 text-white rounded-full font-bold font-cairo hover:bg-brand-700 transition-colors">
            تسوقي الآن
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-medium text-gray-700 font-cairo">المنتجات</h2>
              <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 font-cairo flex items-center gap-1">
                <Trash2 size={14} />
                مسح السلة
              </button>
            </div>
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative w-20 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  <Image src={item.image || '/placeholder.jpg'} alt={item.nameAr} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 font-cairo text-sm leading-snug mb-1">{item.nameAr}</h3>
                  {(item.color || item.size) && (
                    <div className="flex gap-1.5 mb-1 flex-wrap">
                      {item.color && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-cairo">{item.color}</span>}
                      {item.size && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-cairo">مقاس {item.size}</span>}
                    </div>
                  )}
                  <p className="text-brand-600 font-bold font-cairo">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => {
                          if (item.quantity <= 1) removeItem(item.id)
                          else updateQuantity(item.id, item.quantity - 1)
                        }}
                        className="p-2 hover:bg-gray-50"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => {
                          if (item.quantity < item.stock) updateQuantity(item.id, item.quantity + 1)
                        }}
                        disabled={item.quantity >= item.stock}
                        className="p-2 hover:bg-gray-50 disabled:opacity-40"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-gray-900 font-cairo">{formatPrice(item.price * item.quantity)}</span>
                    <button onClick={() => removeItem(item.id)} className="mr-auto text-gray-400 hover:text-red-500 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20">
              <h2 className="font-bold text-gray-900 font-cairo mb-4">ملخص الطلب</h2>
              <div className="space-y-3 text-sm font-cairo">
                <div className="flex justify-between text-gray-600">
                  <span>المجموع الفرعي</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>الشحن</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {shipping === 0 ? 'مجاني' : formatPrice(shipping)}
                  </span>
                </div>
                {subtotal < FREE_SHIPPING_THRESHOLD && (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                    أضيفي {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} للشحن المجاني
                  </p>
                )}
                <div className="border-t pt-3 flex justify-between font-bold text-base">
                  <span className="text-gray-900">الإجمالي</span>
                  <span className="text-brand-600">{formatPrice(grandTotal)}</span>
                </div>
              </div>
              <Link href="/checkout" className="block mt-4">
                <Button className="w-full" size="lg">
                  إتمام الشراء
                </Button>
              </Link>
              <Link href="/products" className="flex items-center justify-center gap-1 mt-3 text-sm text-gray-500 font-cairo hover:text-brand-600">
                <ArrowLeft size={14} />
                متابعة التسوق
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
