'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Heart, ShoppingCart, Minus, Plus } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const SIZE_ORDER = ['44', '46', '48', '50', 'مقاس موحد']

function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a)
    const ib = SIZE_ORDER.indexOf(b)
    if (ia !== -1 && ib !== -1) return ia - ib
    if (ia !== -1) return -1
    if (ib !== -1) return 1
    const na = parseInt(a), nb = parseInt(b)
    if (!isNaN(na) && !isNaN(nb)) return na - nb
    return a.localeCompare(b, 'ar')
  })
}

interface Product {
  id: string
  nameAr: string
  nameEn: string
  descriptionAr: string
  price: number
  stock: number
  images: string[]
  featured: boolean
  sizeStock?: unknown
  category?: { nameAr: string; slug: string } | null
  season?: string
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const sizeStockMap = (product.sizeStock ?? {}) as Record<string, number>
  const sortedSizes = sortSizes(Object.keys(sizeStockMap))
  const hasSizes = sortedSizes.length > 0

  const [selectedSize, setSelectedSize] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const addToCart = useCartStore((s) => s.addItem)
  const { toggleItem, isInWishlist } = useWishlistStore()
  const inWishlist = isInWishlist(product.id)

  const currentStock = hasSizes
    ? (selectedSize ? (sizeStockMap[selectedSize] ?? 0) : 0)
    : product.stock

  const canAddToCart = hasSizes
    ? selectedSize !== '' && currentStock > 0
    : product.stock > 0

  function handleSizeSelect(size: string) {
    setSelectedSize(prev => prev === size ? '' : size)
    setQuantity(1)
  }

  function handleAddToCart() {
    const itemId = hasSizes ? `${product.id}-${selectedSize}` : product.id
    addToCart({
      id: itemId,
      productId: product.id,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      price: product.price,
      image: product.images[0] || '',
      stock: hasSizes ? currentStock : product.stock,
      size: selectedSize || undefined,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* ── Images ── */}
      <div className="space-y-3">
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50">
          <Image
            src={product.images[selectedImage] || product.images[0] || '/placeholder.jpg'}
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
                  i === selectedImage
                    ? 'border-brand-500 opacity-100'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <Image src={img} alt={`${product.nameAr} ${i + 1}`} fill className="object-cover object-top" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Details ── */}
      <div className="space-y-5">
        <div>
          <p className="text-sm text-brand-600 font-cairo font-medium mb-2">
            {product.category?.nameAr ?? (product.season === 'WINTER' ? 'شتوي' : 'صيفي')}
          </p>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 font-cairo leading-tight">
            {product.nameAr}
          </h1>
        </div>

        <span className="text-3xl font-bold text-brand-600 font-cairo block">
          {formatPrice(product.price)}
        </span>

        {/* Stock badge */}
        <div className="flex items-center gap-2 flex-wrap">
          {hasSizes ? (
            selectedSize ? (
              currentStock > 0
                ? <Badge variant="success">متوفر ({currentStock} قطعة)</Badge>
                : <Badge variant="danger">نفذ من المخزون</Badge>
            ) : (
              <Badge variant="info">اختاري المقاس</Badge>
            )
          ) : (
            product.stock > 0
              ? <Badge variant="success">متوفر ({product.stock} قطعة)</Badge>
              : <Badge variant="danger">نفذ من المخزون</Badge>
          )}
          {product.featured && <Badge variant="warning">مميز</Badge>}
        </div>

        {/* ── Size selector ── */}
        {hasSizes && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-gray-800 font-cairo">المقاس:</span>
              {selectedSize
                ? <span className="text-sm font-bold text-brand-700 font-cairo">{selectedSize}</span>
                : <span className="text-sm text-gray-400 font-cairo">اختاري مقاساً</span>
              }
            </div>
            <div className="flex flex-wrap gap-2">
              {sortedSizes.map(size => {
                const qty = sizeStockMap[size] ?? 0
                const isSelected = selectedSize === size
                const outOfStock = qty === 0
                const isLow = qty > 0 && qty <= 3
                return (
                  <button
                    key={size}
                    disabled={outOfStock}
                    onClick={() => handleSizeSelect(size)}
                    className={`relative px-5 py-2.5 rounded-xl border-2 text-sm font-cairo font-semibold transition-all ${
                      isSelected
                        ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                        : outOfStock
                        ? 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed line-through'
                        : 'border-gray-200 text-gray-700 hover:border-brand-400 bg-white'
                    }`}
                  >
                    {size}
                    {isLow && !isSelected && (
                      <span className="absolute -top-2 -left-1 text-[9px] bg-amber-400 text-white px-1 rounded-full font-bold">
                        {qty}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {!selectedSize && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 font-cairo mt-3">
                اختاري المقاس لإضافة المنتج للسلة
              </p>
            )}
          </div>
        )}

        {product.descriptionAr && (
          <p className="text-gray-600 font-cairo leading-relaxed text-sm">{product.descriptionAr}</p>
        )}

        {/* Quantity */}
        {canAddToCart && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 font-cairo">الكمية:</span>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="p-3 hover:bg-gray-50 transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(currentStock, q + 1))}
                className="p-3 hover:bg-gray-50 transition-colors"
                disabled={quantity >= currentStock}
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
            disabled={!canAddToCart}
            size="lg"
            className="flex-1"
            variant={added ? 'secondary' : 'primary'}
          >
            <ShoppingCart size={18} />
            {added ? 'تمت الإضافة ✓' : hasSizes && !selectedSize ? 'اختاري المقاس أولاً' : 'أضف للسلة'}
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
              inWishlist
                ? 'border-brand-500 bg-brand-50 text-brand-600'
                : 'border-gray-200 text-gray-600 hover:border-brand-400'
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
