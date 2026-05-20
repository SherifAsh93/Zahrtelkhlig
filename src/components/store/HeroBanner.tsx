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

interface HeroBannerProps {
  banners: Banner[]
}

export default function HeroBanner({ banners }: HeroBannerProps) {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => setCurrent((c) => (c + 1) % banners.length), [banners.length])
  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length)

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, banners.length])

  if (banners.length === 0) {
    return (
      <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] flex items-center justify-center" dir="rtl" style={{ background: 'linear-gradient(135deg, #4f1d0d 0%, #c0481f 50%, #742b13 100%)' }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='%23ffffff'/%3E%3C/svg%3E\")", backgroundSize: '80px 80px' }} />
        <div className="relative text-center text-white px-4">
          <p className="font-cairo text-sm mb-4 tracking-widest" style={{ color: '#D4A832' }}>✦ ملابس محجبات راقية ✦</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-cairo mb-4">زهرة الخليج</h1>
          <p className="text-xl sm:text-2xl font-cairo text-brand-100 mb-8">لملابس المحجبات الراقية</p>
          <Link href="/products" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-brand-600 rounded-full font-bold font-cairo hover:bg-brand-50 transition-colors text-lg shadow-xl">
            تسوقي الآن
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden" dir="rtl">
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <Image
            src={banner.image}
            alt={banner.titleAr}
            fill
            className="object-cover"
            priority={i === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-lg">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-cairo leading-tight mb-4">
                  {banner.titleAr}
                </h1>
                {banner.subtitleAr && (
                  <p className="text-lg text-brand-100 font-cairo mb-8">{banner.subtitleAr}</p>
                )}
                <Link
                  href={banner.link || '/products'}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-brand-600 text-white rounded-full font-bold font-cairo hover:bg-brand-700 transition-colors text-lg shadow-lg"
                >
                  تسوقي الآن
                  <ChevronLeft size={20} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {banners.length > 1 && (
        <>
          <button onClick={prev} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/40 transition-colors">
            <ChevronRight size={20} />
          </button>
          <button onClick={next} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/40 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white w-6' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
