'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Eye } from 'lucide-react'
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
    category: { nameAr: string; slug: string }
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((s) => s.addItem)
  const { toggleItem, isInWishlist } = useWishlistStore()
  const inWishlist = isInWishlist(product.id)
  const mainImage = product.images[0] || '/placeholder.jpg'
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
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
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 hover:border-brand-200">
        {/* Image container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
          <Image
            src={mainImage}
            alt={product.nameAr}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {discount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                -{discount}%
              </span>
            )}
            {product.featured && (
              <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full font-cairo">
                مميز
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-gray-500 text-white text-xs font-bold px-2 py-0.5 rounded-full font-cairo">
                نفذ
              </span>
            )}
          </div>

          {/* Action buttons overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <button
              onClick={handleWishlist}
              className={`p-2.5 rounded-full shadow-md transition-colors ${inWishlist ? 'bg-brand-600 text-white' : 'bg-white text-gray-700 hover:bg-brand-600 hover:text-white'}`}
            >
              <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="p-2.5 bg-white text-gray-700 rounded-full shadow-md hover:bg-brand-600 hover:text-white transition-colors disabled:opacity-50"
            >
              <ShoppingCart size={16} />
            </button>
            <div className="p-2.5 bg-white text-gray-700 rounded-full shadow-md">
              <Eye size={16} />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-3" dir="rtl">
          <p className="text-xs text-brand-500 font-cairo mb-1">{product.category.nameAr}</p>
          <h3 className="text-sm font-semibold text-gray-900 font-cairo line-clamp-2 mb-2 leading-snug">
            {product.nameAr}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-brand-600 font-bold font-cairo">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <span className="text-gray-400 text-xs line-through font-cairo">{formatPrice(product.comparePrice)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
