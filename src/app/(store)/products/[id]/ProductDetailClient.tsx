'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Heart, ShoppingCart, Minus, Plus } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const COLOR_SWATCHES: Record<string, string> = {
  'مينت': '#b5ead7',
  'موڤ': '#c5a3c7',
  'كحلي': '#1a2f4a',
  'كافية': '#c4a882',
  'أسود': '#222222',
  'لبني': '#fff0e0',
  'زيتي': '#4a5e3a',
  'كشمير': '#d4a86a',
  'هافان': '#9b7e5a',
  'تركواز': '#40c4c4',
  'نبتي': '#3d6b3a',
  'بيج': '#e8d5b5',
  'روز': '#f4a0b0',
  'أوف وايت': '#f8f5ef',
  'بني': '#7d4e2a',
  'أزرق': '#4a90d9',
  'أحمر': '#e74c3c',
  'أخضر': '#27ae60',
  'أصفر': '#f1c40f',
  'برتقالي': '#e67e22',
  'بنفسجي': '#9b59b6',
  'رمادي': '#95a5a6',
  'وايت': '#f5f5f5',
  'أبيض': '#f5f5f5',
}

interface Variant { size: string; color: string; qty: number }

interface Product {
  id: string
  nameAr: string
  nameEn: string
  descriptionAr: string
  price: number
  stock: number
  images: string[]
  featured: boolean
  variants?: unknown
  colorImages?: unknown
  category?: { nameAr: string; slug: string } | null
  season?: string
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const colorImages = (product.colorImages ?? {}) as Record<string, string[]>
  const variants = (product.variants ?? []) as Variant[]

  // ALL unique colors in variants (including 0-stock ones)
  const availableColors = [...new Set(variants.map(v => v.color))].filter(Boolean)

  // Total stock for a color across all its sizes
  function colorTotalStock(color: string) {
    return variants.filter(v => v.color === color).reduce((s, v) => s + v.qty, 0)
  }

  // Sizes for the selected color (all sizes defined for that color, 0-stock shown disabled)
  function sizesForColor(color: string) {
    if (!color) return [...new Set(variants.filter(v => v.qty > 0).map(v => v.size))]
    return [...new Set(variants.filter(v => v.color === color).map(v => v.size))]
  }

  function variantStock(color: string, size: string) {
    const v = variants.find(v => v.color === color && v.size === size)
    return v?.qty ?? 0
  }

  const hasVariants = variants.length > 0

  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const addToCart = useCartStore((s) => s.addItem)
  const { toggleItem, isInWishlist } = useWishlistStore()
  const inWishlist = isInWishlist(product.id)

  // Images to display based on selected color
  const displayImages: string[] = (() => {
    if (selectedColor && colorImages[selectedColor]?.length > 0) return colorImages[selectedColor]
    if (colorImages['']?.length > 0) return colorImages['']
    return product.images
  })()

  // Reset image + size when color changes
  useEffect(() => {
    setSelectedImage(0)
    setSelectedSize('')
    setQuantity(1)
  }, [selectedColor])

  // Reset quantity when size changes
  useEffect(() => {
    setQuantity(1)
  }, [selectedSize])

  const availableSizes = sizesForColor(selectedColor)
  const currentStock = hasVariants
    ? (selectedColor && selectedSize ? variantStock(selectedColor, selectedSize) : 0)
    : product.stock

  const canAddToCart = hasVariants
    ? selectedColor !== '' && selectedSize !== '' && currentStock > 0
    : product.stock > 0

  function handleAddToCart() {
    const variantId = hasVariants
      ? `${product.id}-${selectedColor}-${selectedSize}`
      : `${product.id}`

    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: variantId,
        productId: product.id,
        nameAr: product.nameAr,
        nameEn: product.nameEn,
        price: product.price,
        image: displayImages[0] || product.images[0] || '',
        stock: currentStock,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
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
            src={displayImages[selectedImage] || displayImages[0] || '/placeholder.jpg'}
            alt={product.nameAr}
            fill
            className="object-cover object-top"
            priority
          />
        </div>
        {displayImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {displayImages.map((img, i) => (
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
          <p className="text-sm text-brand-600 font-cairo font-medium mb-2">
            {product.category?.nameAr ?? (product.season === 'WINTER' ? 'شتوي' : 'صيفي')}
          </p>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 font-cairo leading-tight">{product.nameAr}</h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-brand-600 font-cairo">{formatPrice(product.price)}</span>
        </div>

        {/* Stock badge */}
        <div className="flex items-center gap-2">
          {hasVariants ? (
            selectedColor && selectedSize ? (
              currentStock > 0
                ? <Badge variant="success">متوفر ({currentStock} قطعة)</Badge>
                : <Badge variant="danger">نفذ من المخزون</Badge>
            ) : (
              <Badge variant="info">اختاري اللون والمقاس</Badge>
            )
          ) : (
            product.stock > 0
              ? <Badge variant="success">متوفر ({product.stock} قطعة)</Badge>
              : <Badge variant="danger">نفذ من المخزون</Badge>
          )}
          {product.featured && <Badge variant="warning">مميز</Badge>}
        </div>

        {/* ── Color selection ── */}
        {availableColors.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-gray-800 font-cairo">اللون:</span>
              {selectedColor
                ? <span className="text-sm font-bold text-brand-700 font-cairo">{selectedColor}</span>
                : <span className="text-sm text-gray-400 font-cairo">اختاري لوناً</span>
              }
            </div>
            <div className="flex flex-wrap gap-2">
              {availableColors.map(color => {
                const swatch = COLOR_SWATCHES[color] ?? '#cccccc'
                const isSelected = selectedColor === color
                const totalQty = colorTotalStock(color)
                const outOfStock = totalQty === 0
                return (
                  <button
                    key={color}
                    disabled={outOfStock}
                    onClick={() => setSelectedColor(prev => prev === color ? '' : color)}
                    title={outOfStock ? `${color} - نفذ المخزون` : color}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full border-2 text-sm font-cairo font-semibold transition-all ${
                      outOfStock
                        ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed opacity-60'
                        : isSelected
                        ? 'border-brand-600 shadow-md scale-105 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-400 bg-white'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full shrink-0 border border-black/10"
                      style={{ backgroundColor: swatch, opacity: outOfStock ? 0.4 : 1 }}
                    />
                    <span className={isSelected ? 'text-brand-700' : outOfStock ? 'text-gray-300' : 'text-gray-700'}>
                      {color}
                    </span>
                    {outOfStock && <span className="text-[10px] text-gray-300 font-normal">نفذ</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Size selection ── */}
        {hasVariants && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-gray-800 font-cairo">المقاس:</span>
              {selectedSize
                ? <span className="text-sm font-bold text-brand-700 font-cairo">{selectedSize}</span>
                : <span className="text-sm text-gray-400 font-cairo">اختاري مقاساً</span>
              }
            </div>
            {availableSizes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableSizes.map(size => {
                  const qty = selectedColor ? variantStock(selectedColor, size) : 0
                  const isSelected = selectedSize === size
                  const outOfStock = selectedColor && qty === 0
                  return (
                    <button
                      key={size}
                      disabled={!!outOfStock}
                      onClick={() => setSelectedSize(prev => prev === size ? '' : size)}
                      className={`px-4 py-2 rounded-xl border-2 text-sm font-cairo font-semibold transition-all ${
                        isSelected
                          ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                          : outOfStock
                          ? 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed line-through'
                          : 'border-gray-200 text-gray-700 hover:border-brand-400 bg-white'
                      }`}
                    >
                      {size}
                      {selectedColor && qty > 0 && !isSelected && (
                        <span className="mr-1 text-xs text-gray-400">({qty})</span>
                      )}
                    </button>
                  )
                })}
              </div>
            ) : (
              !selectedColor && (
                <p className="text-xs text-gray-400 font-cairo">اختاري اللون أولاً لعرض المقاسات المتاحة</p>
              )
            )}
          </div>
        )}

        {product.descriptionAr && (
          <div>
            <p className="text-gray-600 font-cairo leading-relaxed text-sm">{product.descriptionAr}</p>
          </div>
        )}

        {/* Quantity */}
        {canAddToCart && (
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
                onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
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
            {added
              ? 'تمت الإضافة ✓'
              : hasVariants && (!selectedColor || !selectedSize)
              ? 'اختاري اللون والمقاس'
              : 'أضف للسلة'
            }
          </Button>
          <button
            onClick={() => toggleItem({
              id: `wish-${product.id}`,
              productId: product.id,
              nameAr: product.nameAr,
              nameEn: product.nameEn,
              price: product.price,
              image: displayImages[0] || product.images[0] || '',
            })}
            className={`p-3 rounded-xl border-2 transition-all ${
              inWishlist ? 'border-brand-500 bg-brand-50 text-brand-600' : 'border-gray-200 text-gray-600 hover:border-brand-400'
            }`}
          >
            <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Hint when no color selected yet */}
        {hasVariants && !selectedColor && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 font-cairo">
            ← اختاري اللون أولاً ثم المقاس لإضافة المنتج للسلة
          </p>
        )}
        {hasVariants && selectedColor && !selectedSize && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 font-cairo">
            ← اختاري المقاس لإضافة المنتج للسلة
          </p>
        )}

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
