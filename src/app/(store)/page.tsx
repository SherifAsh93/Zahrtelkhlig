export const revalidate = 60

import Link from 'next/link'
import { Truck, Shield, Star, Clock, Heart, Phone, Gift, Zap } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { parseConfig, type FeatureIcon } from '@/lib/homepage'
import HeroBanner from '@/components/store/HeroBanner'
import ProductCarousel from '@/components/store/ProductCarousel'

const ICON_MAP: Record<FeatureIcon, React.ElementType> = {
  Truck, Shield, Star, Clock, Heart, Phone, Gift, Zap,
}

async function getConfig() {
  try {
    const row = await prisma.siteSettings.findUnique({ where: { key: 'homepage_config' } })
    return parseConfig(row?.value)
  } catch { return parseConfig(null) }
}

async function getBanners() {
  try {
    return await prisma.banner.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } })
  } catch { return [] }
}

async function getNewArrivals(count: number) {
  try {
    return await prisma.product.findMany({
      where: { active: true },
      include: { category: { select: { nameAr: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      take: count,
    })
  } catch { return [] }
}

async function getFeaturedProducts(count: number) {
  try {
    return await prisma.product.findMany({
      where: { active: true, featured: true },
      include: { category: { select: { nameAr: true, slug: true } } },
      orderBy: { createdAt: 'asc' },
      take: count,
    })
  } catch { return [] }
}

async function getProductsByIds(ids: string[]) {
  if (!ids.length) return []
  try {
    const products = await prisma.product.findMany({
      where: { id: { in: ids }, active: true },
      include: { category: { select: { nameAr: true, slug: true } } },
    })
    // Restore admin-defined order (Prisma `in` does not preserve order)
    return ids.map((id) => products.find((p) => p.id === id)).filter(Boolean) as typeof products
  } catch { return [] }
}

async function getAllActiveProducts() {
  try {
    return await prisma.product.findMany({
      where: { active: true },
      include: { category: { select: { nameAr: true, slug: true } } },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    })
  } catch { return [] }
}

async function getGlanceCats(slugs: string[]) {
  if (!slugs.length) return []
  try {
    return await prisma.category.findMany({
      where: { slug: { in: slugs } },
      include: {
        products: {
          where: { active: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { images: true },
        },
      },
    })
  } catch { return [] }
}

export default async function HomePage() {
  const config = await getConfig()
  const sec = config.sections

  const needsAllProducts = sec.instagram.enabled && sec.instagram.mode === 'auto'

  const [banners, newArrivals, featured, allProducts, glanceCats, instagramManual] =
    await Promise.all([
      getBanners(),

      // New arrivals: manual or auto
      sec.new_arrivals.enabled
        ? (sec.new_arrivals.mode === 'manual' && sec.new_arrivals.productIds.length
            ? getProductsByIds(sec.new_arrivals.productIds)
            : getNewArrivals(sec.new_arrivals.count))
        : Promise.resolve([]),

      // Featured: manual or auto
      sec.featured.enabled
        ? (sec.featured.mode === 'manual' && sec.featured.productIds.length
            ? getProductsByIds(sec.featured.productIds)
            : getFeaturedProducts(sec.featured.count))
        : Promise.resolve([]),

      needsAllProducts ? getAllActiveProducts() : Promise.resolve([]),

      sec.at_glance.enabled
        ? getGlanceCats(sec.at_glance.tiles.map((t) => t.slug))
        : Promise.resolve([]),

      // Instagram manual: fetch specific products
      sec.instagram.enabled && sec.instagram.mode === 'manual' && sec.instagram.productIds.length
        ? getProductsByIds(sec.instagram.productIds)
        : Promise.resolve([]),
    ])

  const glanceTiles = sec.at_glance.tiles
    .map((tile) => {
      const cat = glanceCats.find((c) => c.slug === tile.slug)
      if (!cat) return null
      const image = tile.customImage || cat.image || cat.products[0]?.images[0] || '/placeholder.jpg'
      return { ...tile, image }
    })
    .filter(Boolean) as { slug: string; label: string; title: string; image: string }[]

  // Instagram: manual list OR slice of all products with real photos (skip products with no images)
  const instagramPhotos =
    sec.instagram.mode === 'manual' && instagramManual.length
      ? instagramManual
      : allProducts.filter((p) => p.images.length > 0).slice(0, sec.instagram.count)

  function renderSection(key: string) {
    switch (key) {

      case 'features_bar': {
        if (!sec.features_bar.enabled) return null
        return (
          <div key="features_bar" className="border-b border-brand-100/60 py-6 bg-brand-50/25">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {sec.features_bar.items.map(({ icon, title, desc }) => {
                  const Icon = ICON_MAP[icon] ?? Truck
                  return (
                    <div key={title} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-brand-100 flex items-center justify-center shrink-0 shadow-sm">
                        <Icon size={18} className="text-brand-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 font-cairo leading-tight">{title}</p>
                        <p className="text-xs text-gray-500 font-cairo leading-normal mt-0.5">{desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      }

      case 'new_arrivals': {
        if (!sec.new_arrivals.enabled || !newArrivals.length) return null
        return (
          <section key="new_arrivals" className="py-14 max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs text-brand-500 font-cairo mb-1.5 font-medium tracking-wide">{sec.new_arrivals.headingAr}</p>
                <h2 className="text-3xl sm:text-4xl font-cormorant italic text-gray-900 leading-tight">{sec.new_arrivals.headingEn}</h2>
              </div>
              <Link href="/products"
                className="text-xs text-gray-500 border-b border-gray-300 pb-0.5 hover:text-brand-700 hover:border-brand-400 transition-colors font-cairo shrink-0">
                عرض الكل
              </Link>
            </div>
            <ProductCarousel products={newArrivals} />
          </section>
        )
      }

      case 'at_glance': {
        if (!sec.at_glance.enabled || !glanceTiles.length) return null
        return (
          <section key="at_glance" className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px flex-1 max-w-[60px] bg-brand-200" />
              <p className="text-xs text-brand-600 font-cairo font-semibold tracking-widest">تسوقي بالفئة</p>
              <div className="h-px flex-1 max-w-[60px] bg-brand-200" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {glanceTiles.map((tile) => (
                <Link key={tile.slug} href={`/products?category=${tile.slug}`}
                  className="relative group overflow-hidden block">
                  <div className="relative aspect-square sm:aspect-[3/4]">
                    <img src={tile.image} alt={tile.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 inset-x-0 p-6 text-white" dir="rtl">
                      <p className="text-[10px] text-white/60 font-cairo mb-1.5">{tile.label}</p>
                      <h3 className="text-2xl sm:text-3xl font-cairo font-bold mb-5 leading-normal">{tile.title}</h3>
                      <span className="inline-flex items-center gap-1.5 text-xs font-cairo border-b border-white/60 pb-0.5 group-hover:border-white transition-colors">
                        تسوقي الآن
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )
      }

      case 'featured': {
        if (!sec.featured.enabled || !featured.length) return null
        return (
          <section key="featured" className="py-14 bg-brand-50/25 border-y border-brand-100/50">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-xs text-brand-500 font-cairo mb-1.5 font-medium tracking-wide">{sec.featured.headingAr}</p>
                  <h2 className="text-3xl sm:text-4xl font-cormorant italic text-gray-900 leading-tight">{sec.featured.headingEn}</h2>
                </div>
                <Link href="/products?featured=true"
                  className="text-xs text-gray-500 border-b border-gray-300 pb-0.5 hover:text-brand-700 hover:border-brand-400 transition-colors font-cairo shrink-0">
                  عرض الكل
                </Link>
              </div>
              <ProductCarousel products={featured} />
            </div>
          </section>
        )
      }

      case 'category_tabs': return null

      case 'brand_story': {
        if (!sec.brand_story.enabled) return null
        return (
          <section key="brand_story" className="py-20 bg-brand-50/30 text-center px-4">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-4 mb-7">
                <div className="h-px w-14 bg-brand-300" />
                <p className="text-xs text-brand-600 font-cairo font-semibold tracking-widest">قصتنا</p>
                <div className="h-px w-14 bg-brand-300" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-cormorant italic text-gray-900 leading-snug mb-6 whitespace-pre-line">
                {sec.brand_story.title}
              </h2>
              <p className="text-gray-500 font-cairo text-sm leading-loose mb-10 max-w-lg mx-auto">
                {sec.brand_story.text}
              </p>
              <Link href="/products"
                className="inline-block bg-brand-700 text-white px-10 py-3.5 text-sm font-cairo font-semibold hover:bg-brand-800 transition-colors duration-200 rounded-sm shadow-sm">
                {sec.brand_story.buttonText}
              </Link>
            </div>
          </section>
        )
      }

      case 'instagram': {
        if (!sec.instagram.enabled || !instagramPhotos.length) return null
        return (
          <section key="instagram" className="py-14 max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="h-px w-10 bg-brand-200" />
                <p className="text-xs text-brand-600 font-cairo font-semibold tracking-widest">تابعينا على إنستغرام</p>
                <div className="h-px w-10 bg-brand-200" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-cairo font-bold text-gray-900 leading-snug mb-2">إلهامنا اليومي</h2>
              <a href={sec.instagram.url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-gray-400 font-cairo hover:text-brand-600 transition-colors">
                @{sec.instagram.handle.replace(/^@/, '')}
              </a>
            </div>
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {instagramPhotos.map((product) => (
                <a key={product.id} href={sec.instagram.url} target="_blank" rel="noopener noreferrer"
                  className="group relative overflow-hidden block">
                  <div className="relative aspect-square">
                    <img src={product.images[0] || '/placeholder.jpg'} alt={product.nameAr}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-brand-900/30 transition-colors duration-300 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                  </div>
                </a>
              ))}
            </div>
            <div className="text-center mt-6">
              <a href={sec.instagram.url} target="_blank" rel="noopener noreferrer"
                className="inline-block border border-gray-300 text-gray-600 px-8 py-2.5 text-sm font-cairo hover:border-brand-400 hover:text-brand-700 transition-colors">
                عرض المزيد على إنستغرام
              </a>
            </div>
          </section>
        )
      }

      default: return null
    }
  }

  return (
    <div dir="rtl">
      <HeroBanner banners={banners} />
      {config.sectionsOrder.map((key) => renderSection(key))}
    </div>
  )
}
