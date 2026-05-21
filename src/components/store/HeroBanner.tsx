'use client'
import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Banner {
  id: string
  titleAr: string
  subtitleAr?: string | null
  image: string
  link?: string | null
}

export default function HeroBanner({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => setCurrent((c) => (c + 1) % banners.length), [banners.length])
  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length)

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [next, banners.length])

  if (banners.length === 0) {
    return (
      <div className="relative h-[72vh] sm:h-[80vh] lg:h-[92vh] flex items-center overflow-hidden bg-brand-50" dir="rtl">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 w-full">
          <div className="max-w-md">
            <p className="text-xs text-brand-500 font-cairo mb-5">ماركة مصرية أصيلة</p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-cormorant italic text-gray-900 leading-normal mb-5">
              زهرة الخليج
            </h1>
            <p className="text-gray-500 font-cairo text-sm mb-8 leading-relaxed">لملابس المحجبات الراقية — شحن لجميع المحافظات</p>
            <Link
              href="/products"
              className="inline-block border border-gray-900 text-gray-900 px-8 py-3 text-sm font-cairo hover:bg-gray-900 hover:text-white transition-colors duration-300"
            >
              تسوقي الآن
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[72vh] sm:h-[80vh] lg:h-[92vh] overflow-hidden" dir="rtl">
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <Image
            src={banner.image}
            alt={banner.titleAr}
            fill
            className="object-cover"
            priority={i === 0}
          />
          {/* Gradient: dark on right side (RTL start) */}
          <div className="absolute inset-0 bg-gradient-to-l from-black/55 via-black/25 to-transparent" />

          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 w-full">
              <div className="max-w-sm">
                <p className="text-xs text-white/60 font-cairo mb-4">مجموعة حصرية</p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-cormorant italic text-white leading-normal mb-4">
                  {banner.titleAr}
                </h1>
                {banner.subtitleAr && (
                  <p className="text-white/75 font-cairo text-sm mb-8 leading-relaxed">{banner.subtitleAr}</p>
                )}
                <Link
                  href={banner.link || '/products'}
                  className="inline-block border border-white text-white px-8 py-3 text-sm font-cairo hover:bg-white hover:text-gray-900 transition-colors duration-300"
                >
                  تسوقي الآن
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Prev/Next */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/15 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={next}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/15 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          {/* Slim progress lines (FabricTales style) */}
          <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-px transition-all duration-500 bg-white ${i === current ? 'w-10 opacity-100' : 'w-3 opacity-40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
