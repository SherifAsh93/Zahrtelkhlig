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
        {/* Image */}
        <div className="relative aspect-[2/3] overflow-hidden bg-gray-100">
          <Image
            src={mainImage}
            alt={product.nameAr}
            fill
            className="object-cover object-left-top transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-gray-900 text-[10px] px-3 py-1 tracking-widest font-cairo uppercase">
                نفذ
              </span>
            </div>
          )}

          {/* Hover action bar */}
          <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex">
            <button
              onClick={handleWishlist}
              className={`flex-none w-11 flex items-center justify-center py-3 transition-colors ${
                inWishlist ? 'bg-brand-600 text-white' : 'bg-white/95 text-gray-800 hover:bg-brand-600 hover:text-white'
              }`}
            >
              <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 text-white text-xs font-cairo tracking-wider hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              <ShoppingCart size={14} />
              أضف للسلة
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="pt-3" dir="rtl">
          <h3 className="text-sm font-medium text-gray-900 font-cairo line-clamp-1 leading-snug">
            {product.nameAr}
          </h3>
          <p className="text-sm font-bold text-gray-900 font-cairo mt-1">{formatPrice(product.price)}</p>
        </div>
      </div>
    </Link>
  )
}
