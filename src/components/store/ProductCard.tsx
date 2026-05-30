'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: {
    id: string
    nameAr: string
    nameEn: string
    price: number
    comparePrice?: number | null
    images: string[]
    stock: number
    featured: boolean
    category?: { nameAr: string; slug: string } | null
    season?: string
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((s) => s.addItem)
  const { toggleItem, isInWishlist } = useWishlistStore()
  const inWishlist = isInWishlist(product.id)
  const mainImage = product.images[0] || '/placeholder.jpg'

  const discountPct = product.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (product.stock === 0) return
    addToCart({
      id: `cart-${product.id}`,
      productId: product.id,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      price: product.price,
      image: mainImage,
      stock: product.stock,
    })
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    toggleItem({
      id: `wish-${product.id}`,
      productId: product.id,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      price: product.price,
      image: mainImage,
    })
  }

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="overflow-hidden">
        {/* Image */}
        <div className="relative aspect-[2/3] overflow-hidden bg-gray-50" dir="rtl">
          <Image
            src={mainImage}
            alt={product.nameAr}
            fill
            className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <span className="bg-white/95 text-gray-700 text-xs px-4 py-1.5 tracking-widest font-cairo font-semibold border border-gray-200">
                نفذ المخزون
              </span>
            </div>
          )}

          {/* Discount badge */}
          {discountPct > 0 && (
            <div className="absolute top-2.5 end-2.5 bg-brand-700 text-white text-[10px] font-bold px-2 py-0.5 font-cairo rounded-sm">
              خصم {discountPct}٪
            </div>
          )}

          {/* Featured badge — only when no discount */}
          {product.featured && discountPct === 0 && product.stock > 0 && (
            <div className="absolute top-2.5 end-2.5 bg-gold-500 text-white text-[10px] font-bold px-2 py-0.5 font-cairo rounded-sm">
              مميز
            </div>
          )}

          {/* Hover action bar */}
          <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex">
            <button
              onClick={handleWishlist}
              className={`flex-none w-12 flex items-center justify-center py-3.5 transition-colors ${
                inWishlist
                  ? 'bg-brand-600 text-white'
                  : 'bg-white/98 text-gray-700 hover:bg-brand-600 hover:text-white'
              }`}
            >
              <Heart size={15} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white text-xs font-cairo tracking-wide hover:bg-brand-700 transition-colors disabled:opacity-40"
            >
              <ShoppingCart size={13} />
              أضيفي للسلة
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="pt-3 pb-1" dir="rtl">
          {product.category && (
            <p className="text-[10px] text-gray-400 font-cairo uppercase tracking-wider mb-0.5">
              {product.category.nameAr}
            </p>
          )}
          <h3 className="text-sm font-medium text-gray-900 font-cairo line-clamp-1 leading-snug">
            {product.nameAr}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <p className="text-sm font-bold text-gray-900 font-cairo">{formatPrice(product.price)}</p>
            {discountPct > 0 && product.comparePrice && (
              <p className="text-xs text-gray-400 line-through font-cairo">{formatPrice(product.comparePrice)}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
