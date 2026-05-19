'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore()
  const addToCart = useCartStore((s) => s.addItem)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10" dir="rtl">
      <h1 className="text-2xl font-bold text-gray-900 font-cairo mb-8 flex items-center gap-2">
        <Heart size={24} className="text-brand-600" />
        قائمة الأمنيات
        {items.length > 0 && <span className="text-base font-normal text-gray-500">({items.length} منتج)</span>}
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Heart size={64} className="text-gray-200 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 font-cairo mb-2">قائمة الأمنيات فارغة</h2>
          <p className="text-gray-500 font-cairo mb-6">أضيفي منتجاتك المفضلة هنا</p>
          <Link href="/products" className="px-6 py-2.5 bg-brand-600 text-white rounded-full font-cairo font-bold hover:bg-brand-700">
            تسوقي الآن
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.productId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group">
              <Link href={`/products/${item.productId}`} className="block relative aspect-[3/4] bg-gray-50">
                <Image src={item.image || '/placeholder.jpg'} alt={item.nameAr} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              </Link>
              <div className="p-3">
                <Link href={`/products/${item.productId}`}>
                  <h3 className="text-sm font-semibold font-cairo text-gray-900 line-clamp-2 mb-2">{item.nameAr}</h3>
                </Link>
                <p className="text-brand-600 font-bold font-cairo mb-3">{formatPrice(item.price)}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      addToCart({ id: `cart-${item.productId}`, productId: item.productId, nameAr: item.nameAr, nameEn: item.nameEn, price: item.price, image: item.image, stock: 99 })
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-brand-600 text-white rounded-xl text-xs font-cairo hover:bg-brand-700 transition-colors"
                  >
                    <ShoppingCart size={14} />
                    أضيفي للسلة
                  </button>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-2 border border-gray-200 text-gray-500 rounded-xl hover:border-red-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
