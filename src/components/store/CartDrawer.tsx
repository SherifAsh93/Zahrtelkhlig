'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice, SHIPPING_COST, FREE_SHIPPING_THRESHOLD } from '@/lib/utils'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, total } = useCartStore()
  const subtotal = total()
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : items.length > 0 ? SHIPPING_COST : 0
  const grandTotal = subtotal + shipping

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex" dir="rtl">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative mr-auto w-full max-w-sm bg-white h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-brand-600" />
            <h2 className="font-bold text-gray-900 font-cairo">سلة التسوق</h2>
            {items.length > 0 && (
              <span className="bg-brand-100 text-brand-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <ShoppingCart size={48} className="text-gray-200" />
              <div>
                <p className="text-gray-500 font-cairo font-medium">السلة فارغة</p>
                <p className="text-gray-400 text-sm font-cairo mt-1">أضيفي منتجات لتبدأ التسوق</p>
              </div>
              <Link
                href="/products"
                onClick={onClose}
                className="px-5 py-2 bg-brand-600 text-white rounded-full text-sm font-cairo hover:bg-brand-700 transition-colors"
              >
                تسوقي الآن
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="relative w-16 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                  <Image src={item.image || '/placeholder.jpg'} alt={item.nameAr} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 font-cairo line-clamp-2">{item.nameAr}</p>
                  <p className="text-brand-600 font-bold text-sm font-cairo mt-1">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => {
                        if (item.quantity <= 1) removeItem(item.productId)
                        else updateQuantity(item.productId, item.quantity - 1)
                      }}
                      className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:border-brand-400"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => {
                        if (item.quantity < item.stock) updateQuantity(item.productId, item.quantity + 1)
                      }}
                      disabled={item.quantity >= item.stock}
                      className="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:border-brand-400 disabled:opacity-40"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="mr-auto p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-3 bg-gray-50">
            <div className="space-y-1.5 text-sm font-cairo">
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
                <p className="text-xs text-amber-600">
                  أضيفي {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} للشحن المجاني
                </p>
              )}
              <div className="flex justify-between font-bold text-gray-900 border-t pt-2 mt-1">
                <span>الإجمالي</span>
                <span className="text-brand-600">{formatPrice(grandTotal)}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full text-center py-3 bg-brand-600 text-white rounded-xl font-bold font-cairo hover:bg-brand-700 transition-colors"
            >
              إتمام الشراء
            </Link>
            <button
              onClick={onClose}
              className="block w-full text-center py-2 text-gray-600 text-sm font-cairo hover:text-brand-600"
            >
              متابعة التسوق
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
