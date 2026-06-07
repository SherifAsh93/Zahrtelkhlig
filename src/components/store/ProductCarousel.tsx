import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface CarouselProduct {
  id: string
  nameAr: string
  price: number

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

            </div>

            <div className="pt-3" dir="rtl">
              <p className="text-[10px] text-gray-400 font-cairo uppercase tracking-wider mb-0.5">
                {product.category?.nameAr ?? 'زهرة الخليج'}
              </p>
              <h3 className="text-sm text-gray-800 font-cairo leading-snug line-clamp-1">{product.nameAr}</h3>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm font-semibold text-gray-900 font-cairo">{formatPrice(product.price)}</p>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
