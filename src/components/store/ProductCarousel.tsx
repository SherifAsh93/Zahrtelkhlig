import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface CarouselProduct {
  id: string
  nameAr: string
  price: number
  comparePrice?: number | null
  images: string[]
  stock: number
  category?: { nameAr: string; slug: string } | null
  season?: string
}

export default function ProductCarousel({ products }: { products: CarouselProduct[] }) {
  if (products.length === 0) return null

  return (
    <div
      className="flex gap-3 sm:gap-5 overflow-x-auto no-scrollbar pb-2"
      style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
    >
      {products.map((product) => {
        const discountPct = product.comparePrice && product.comparePrice > product.price
          ? Math.round((1 - product.price / product.comparePrice) * 100)
          : 0

        return (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="shrink-0 group block"
            style={{ scrollSnapAlign: 'start', width: 'clamp(145px, 42vw, 220px)' }}
            dir="rtl"
          >
            <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: '2/3' }}>
              <Image
                src={product.images[0] || '/placeholder.jpg'}
                alt={product.nameAr}
                fill
                className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 640px) 42vw, 220px"
              />

              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                  <span className="text-white text-[10px] tracking-widest font-cairo bg-black/50 px-3 py-1">
                    نفذ
                  </span>
                </div>
              )}

              {discountPct > 0 && (
                <div className="absolute top-2 end-2 bg-brand-700 text-white text-[10px] font-bold px-1.5 py-0.5 font-cairo rounded-sm">
                  -{discountPct}٪
                </div>
              )}
            </div>

            <div className="pt-3" dir="rtl">
              <p className="text-[10px] text-gray-400 font-cairo uppercase tracking-wider mb-0.5">
                {product.category?.nameAr ?? 'زهرة الخليج'}
              </p>
              <h3 className="text-sm text-gray-800 font-cairo leading-snug line-clamp-1">{product.nameAr}</h3>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm font-semibold text-gray-900 font-cairo">{formatPrice(product.price)}</p>
                {discountPct > 0 && product.comparePrice && (
                  <p className="text-xs text-gray-400 line-through font-cairo">{formatPrice(product.comparePrice)}</p>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
