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

  /* ── Fallback hero (no banners) ── */
  if (banners.length === 0) {
    return (
      <div className="relative h-[72vh] sm:h-[80vh] lg:h-[88vh] flex items-center overflow-hidden" dir="rtl">
        {/* Warm gradient background */}
        <div className="absolute inset-0 bg-gradient-to-bl from-brand-50 via-brand-100/60 to-white" />
        {/* Decorative circle */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-100/30 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 w-full">
          <div className="max-w-lg animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-10 bg-brand-400" />
              <p className="text-xs text-brand-600 font-cairo font-semibold tracking-widest">علامة مصرية أصيلة منذ عام ٢٠٠٠</p>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-cormorant italic text-gray-900 leading-tight mb-5">
              زهرة الخليج
            </h1>
            <p className="text-gray-500 font-cairo text-sm sm:text-base mb-2 leading-relaxed">
              أزياء المحجبات الراقية — عبايات، فساتين، وأكثر
            </p>
            <p className="text-brand-600 font-cairo text-xs mb-10">
              شحن لجميع المحافظات المصرية · جودة مضمونة
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href="/products"
                className="inline-block bg-brand-700 text-white px-9 py-3.5 text-sm font-cairo font-semibold hover:bg-brand-800 transition-colors duration-300 rounded-sm shadow-md"
              >
                تسوقي الآن
              </Link>
              <Link
                href="/products?featured=true"
                className="inline-block border border-gray-400 text-gray-700 px-9 py-3.5 text-sm font-cairo hover:border-brand-500 hover:text-brand-700 transition-colors duration-300 rounded-sm"
              >
                المنتجات المميزة
              </Link>
            </div>
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
          {/* RTL gradient — dark on the right (content) side */}
          <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/20 to-transparent" />

          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 w-full">
              <div className={`max-w-md ${i === current ? 'animate-fade-in-up' : ''}`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-px w-8 bg-white/50" />
                  <p className="text-xs text-white/70 font-cairo tracking-widest">مجموعة حصرية</p>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-cormorant italic text-white leading-tight mb-5">
                  {banner.titleAr}
                </h1>
                {banner.subtitleAr && (
                  <p className="text-white/80 font-cairo text-sm mb-8 leading-relaxed max-w-sm">
                    {banner.subtitleAr}
                  </p>
                )}
                <Link
                  href={banner.link || '/products'}
                  className="inline-block bg-white text-gray-900 px-9 py-3.5 text-sm font-cairo font-semibold hover:bg-brand-50 transition-colors duration-300 rounded-sm shadow-lg"
                >
                  تسوقي الآن
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-white/15 backdrop-blur-sm text-white hover:bg-white/30 transition-colors rounded-full"
            aria-label="السابق"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={next}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-white/15 backdrop-blur-sm text-white hover:bg-white/30 transition-colors rounded-full"
            aria-label="التالي"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Progress dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 items-center">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-500 bg-white ${
                  i === current ? 'w-8 h-1.5 opacity-100' : 'w-1.5 h-1.5 opacity-40'
                }`}
                aria-label={`الشريحة ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
