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
  const availableColors = [...new Set(variants.map(v => v.color))].filter(Boolean)

  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const addToCart = useCartStore((s) => s.addItem)
  const { toggleItem, isInWishlist } = useWishlistStore()
  const inWishlist = isInWishlist(product.id)

  // Compute display images based on selected color
  const displayImages: string[] = (() => {
    if (selectedColor && colorImages[selectedColor]?.length > 0) {
      return colorImages[selectedColor]
    }
    if (colorImages['']?.length > 0) {
      return colorImages['']
    }
    return product.images
  })()

  // Reset selected image when color changes
  useEffect(() => {
    setSelectedImage(0)
  }, [selectedColor])

  // Auto-select color when clicking a color swatch image
  function handleColorSelect(color: string) {
    setSelectedColor(prev => prev === color ? '' : color)
  }

  function handleAddToCart() {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: `cart-${product.id}${selectedColor ? `-${selectedColor}` : ''}`,
        productId: product.id,
        nameAr: product.nameAr,
        nameEn: product.nameEn,
        price: product.price,
        image: displayImages[0] || product.images[0] || '',
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

        <div className="flex items-center gap-2">
          {product.stock > 0 ? (
            <Badge variant="success">متوفر ({product.stock} قطعة)</Badge>
          ) : (
            <Badge variant="danger">نفذ من المخزون</Badge>
          )}
          {product.featured && <Badge variant="warning">مميز</Badge>}
        </div>

        {/* Color swatches */}
        {availableColors.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-700 font-cairo">اللون:</span>
              {selectedColor && (
                <span className="text-sm font-semibold text-brand-700 font-cairo">{selectedColor}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableColors.map(color => {
                const swatch = COLOR_SWATCHES[color] ?? '#cccccc'
                const isSelected = selectedColor === color
                return (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    title={color}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full border-2 text-sm font-cairo font-semibold transition-all ${
                      isSelected
                        ? 'border-brand-600 shadow-md scale-105'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full shrink-0 border border-black/10"
                      style={{ backgroundColor: swatch }}
                    />
                    <span className={isSelected ? 'text-brand-700' : 'text-gray-700'}>{color}</span>
                    {isSelected && <span className="text-brand-600 text-xs">✓</span>}
                  </button>
                )
              })}
            </div>
            {selectedColor && (
              <button
                onClick={() => setSelectedColor('')}
                className="mt-2 text-xs text-gray-400 hover:text-gray-600 font-cairo underline"
              >
                إلغاء تحديد اللون
              </button>
            )}
          </div>
        )}

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
              image: displayImages[0] || product.images[0] || '',
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
