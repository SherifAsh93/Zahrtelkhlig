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
        {/* Image container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
          <Image
            src={mainImage}
            alt={product.nameAr}
            fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {product.stock === 0 && (
              <span className="bg-gray-800 text-white text-[10px] px-2 py-0.5 tracking-wider font-cairo">
                نفذ
              </span>
            )}
          </div>

          {/* Action buttons overlay */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <button
              onClick={handleWishlist}
              className={`w-9 h-9 rounded-none shadow-md transition-colors flex items-center justify-center ${inWishlist ? 'bg-brand-600 text-white' : 'bg-white text-gray-700 hover:bg-brand-600 hover:text-white'}`}
            >
              <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-9 h-9 rounded-none bg-white text-gray-700 shadow-md hover:bg-brand-600 hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <ShoppingCart size={16} />
            </button>
            <div className="w-9 h-9 rounded-none bg-white text-gray-700 shadow-md flex items-center justify-center">
              <Eye size={16} />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="pt-3 px-0" dir="rtl">
          <p className="text-[10px] text-gray-400 font-cairo tracking-widest uppercase mb-1">{product.category.nameAr}</p>
          <h3 className="text-sm font-medium text-gray-900 font-cairo line-clamp-2 mb-1.5 leading-snug">
            {product.nameAr}
          </h3>
          <span className="text-sm font-semibold text-gray-900 font-cairo">{formatPrice(product.price)}</span>
        </div>
      </div>
    </Link>
  )
}
