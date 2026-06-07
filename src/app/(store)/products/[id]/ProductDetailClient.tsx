'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Heart, ShoppingCart, Minus, Plus, Share2 } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface Product {
  id: string
  nameAr: string
  nameEn: string
  descriptionAr: string
  price: number

  stock: number
  images: string[]
  featured: boolean
  category?: { nameAr: string; slug: string } | null
  season?: string
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const addToCart = useCartStore((s) => s.addItem)
  const { toggleItem, isInWishlist } = useWishlistStore()
  const inWishlist = isInWishlist(product.id)

  function handleAddToCart() {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: `cart-${product.id}`,
        productId: product.id,
        nameAr: product.nameAr,
        nameEn: product.nameEn,
        price: product.price,
        image: product.images[0] || '',
        stock: product.stock,
      })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Images */}
      <div className="space-y-3">
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50">
          <Image
            src={product.images[selectedImage] || '/placeholder.jpg'}
            alt={product.nameAr}
            fill
            className="object-cover object-top"
            priority
          />
        </div>
        {product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`relative w-20 h-24 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                  i === selectedImage ? 'border-brand-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <Image src={img} alt={`${product.nameAr} ${i + 1}`} fill className="object-cover object-top" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-5">
        <div>
          <p className="text-sm text-brand-600 font-cairo font-medium mb-2">{product.category?.nameAr ?? (product.season === 'WINTER' ? 'شتوي' : 'صيفي')}</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 font-cairo leading-tight">{product.nameAr}</h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-brand-600 font-cairo">{formatPrice(product.price)}</span>
        </div>

        <div className="flex items-center gap-2">
          {product.stock > 0 ? (
            <Badge variant="success">متوفر ({product.stock} قطعة)</Badge>
          ) : (
            <Badge variant="danger">نفذ من المخزون</Badge>
          )}
          {product.featured && <Badge variant="warning">مميز</Badge>}
        </div>

        {product.descriptionAr && (
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-600 font-cairo leading-relaxed">{product.descriptionAr}</p>
          </div>
        )}

        {/* Quantity */}
        {product.stock > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 font-cairo">الكمية:</span>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-3 hover:bg-gray-50 transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="p-3 hover:bg-gray-50 transition-colors"
                disabled={quantity >= product.stock}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            size="lg"
            className="flex-1"
            variant={added ? 'secondary' : 'primary'}
          >
            <ShoppingCart size={18} />
            {added ? 'تمت الإضافة ✓' : 'أضف للسلة'}
          </Button>
          <button
            onClick={() => toggleItem({
              id: `wish-${product.id}`,
              productId: product.id,
              nameAr: product.nameAr,
              nameEn: product.nameEn,
              price: product.price,
              image: product.images[0] || '',
            })}
            className={`p-3 rounded-xl border-2 transition-all ${
              inWishlist ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-600 hover:border-brand-400'
            }`}
          >
            <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Info */}
        <div className="border-t pt-4 space-y-2 text-sm text-gray-600 font-cairo">
          <p>🚚 شحن لجميع المحافظات</p>
          <p>💳 الدفع عند الاستلام متاح</p>
          <p>📦 التوصيل خلال 3-5 أيام عمل</p>
        </div>
      </div>
    </div>
  )
}
