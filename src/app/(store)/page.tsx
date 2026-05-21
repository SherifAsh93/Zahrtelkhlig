import Link from 'next/link'
import { Truck, Shield, Star, Clock } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import HeroBanner from '@/components/store/HeroBanner'
import ProductCarousel from '@/components/store/ProductCarousel'
import CategoryTabsSection from '@/components/store/CategoryTabsSection'

async function getBanners() {
  try {
    return await prisma.banner.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } })
  } catch { return [] }
}

async function getNewArrivals() {
  try {
    return await prisma.product.findMany({
      where: { active: true },
      include: { category: { select: { nameAr: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
  } catch { return [] }
}

async function getFeaturedProducts() {
  try {
    return await prisma.product.findMany({
      where: { active: true, featured: true },
      include: { category: { select: { nameAr: true, slug: true } } },
      orderBy: { createdAt: 'asc' },
      take: 10,
    })
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

async function getCategories() {
  try {
    return await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: [{ sortOrder: 'asc' }, { nameAr: 'asc' }],
    })
  } catch { return [] }
}

async function getGlanceTiles() {
  try {
    return await prisma.category.findMany({
      where: { slug: { in: ['eid', 'abaya', 'summer'] } },
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

const features = [
  { icon: Truck, title: 'شحن لجميع المحافظات', desc: 'لجميع أنحاء مصر' },
  { icon: Shield, title: 'الدفع عند الاستلام', desc: 'ادفعي لما يوصلك الطلب' },
  { icon: Star, title: 'ماركة مصرية أصيلة', desc: 'Proudly Egyptian Since 2000 🇪🇬' },
  { icon: Clock, title: 'استلام يومي', desc: 'من ١١ صباحًا حتي ١٢ مساءً' },
]

const glanceMeta: Record<string, { label: string; title: string }> = {
  eid:   { label: 'كولكشن جديد', title: 'كولكشن العيد' },
  abaya: { label: 'استكشفي', title: 'عبايات راقية' },
  summer: { label: 'الإصدار الصيفي', title: 'كولكشن الصيف' },
}

export default async function HomePage() {
  const [banners, newArrivals, featured, allProducts, categoriesAll, glanceData] =
    await Promise.all([
      getBanners(),
      getNewArrivals(),
      getFeaturedProducts(),
      getAllActiveProducts(),
      getCategories(),
      getGlanceTiles(),
    ])

  const categories = categoriesAll.filter((c) => c._count.products > 0)

  // Build At A Glance tiles (Eid, Abaya, Summer) in that order
  const slugOrder = ['eid', 'abaya', 'summer']
  const glanceTiles = slugOrder
    .map((slug) => {
      const cat = glanceData.find((c) => c.slug === slug)
      if (!cat) return null
      const image = cat.image || cat.products[0]?.images[0] || '/placeholder.jpg'
      return { slug, image, ...glanceMeta[slug] }
    })
    .filter(Boolean) as { slug: string; image: string; label: string; title: string }[]

  // Instagram grid: 6 product photos (newest first)
  const instagramPhotos = allProducts.slice(0, 6)

  return (
    <div dir="rtl">
      {/* ── Hero ── */}
      <HeroBanner banners={banners} />

      {/* ── Features bar ── */}
      <div className="border-b border-gray-100 py-5 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-2.5">
                <Icon size={16} className="text-brand-500 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-800 font-cairo leading-tight">{title}</p>
                  <p className="text-xs text-gray-400 font-cairo leading-tight mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── New Arrivals carousel ── */}
      {newArrivals.length > 0 && (
        <section className="py-14 max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-cairo mb-1.5">وصل حديثًا</p>
              <h2 className="text-3xl sm:text-4xl font-cormorant italic text-gray-900 leading-none">New Arrivals</h2>
            </div>
            <Link
              href="/products"
              className="text-xs uppercase tracking-widest text-gray-400 border-b border-gray-300 pb-0.5 hover:text-gray-900 hover:border-gray-900 transition-colors font-cairo shrink-0"
            >
              عرض الكل
            </Link>
          </div>
          <ProductCarousel products={newArrivals} />
        </section>
      )}

      {/* ── At A Glance ── */}
      {glanceTiles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400 font-cairo text-center mb-8">AT A GLANCE</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {glanceTiles.map((tile) => (
              <Link
                key={tile.slug}
                href={`/products?category=${tile.slug}`}
                className="relative group overflow-hidden block"
              >
                <div className="relative aspect-square sm:aspect-[3/4]">
                  <img
                    src={tile.image}
                    alt={tile.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-6 text-white" dir="rtl">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/60 font-cairo mb-1.5">{tile.label}</p>
                    <h3 className="text-2xl sm:text-3xl font-cormorant italic mb-5 leading-tight">{tile.title}</h3>
                    <span className="text-[10px] uppercase tracking-widest font-cairo border-b border-white/50 pb-0.5 hover:border-white transition-colors">
                      تسوقي الآن
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Featured Collection carousel ── */}
      {featured.length > 0 && (
        <section className="py-14 bg-brand-50/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-cairo mb-1.5">مختارة بعناية</p>
                <h2 className="text-3xl sm:text-4xl font-cormorant italic text-gray-900 leading-none">Featured Pieces</h2>
              </div>
              <Link
                href="/products?featured=true"
                className="text-xs uppercase tracking-widest text-gray-400 border-b border-gray-300 pb-0.5 hover:text-gray-900 hover:border-gray-900 transition-colors font-cairo shrink-0"
              >
                عرض الكل
              </Link>
            </div>
            <ProductCarousel products={featured} />
          </div>
        </section>
      )}

      {/* ── Category Tabs + Carousel (star feature) ── */}
      <CategoryTabsSection products={allProducts} categories={categories} />

      {/* ── Brand Story ── */}
      <section className="py-20 bg-brand-50/40 text-center px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-7">
            <div className="h-px w-14 bg-brand-200" />
            <p className="text-[10px] uppercase tracking-[0.35em] text-brand-500 font-cairo">قصتنا</p>
            <div className="h-px w-14 bg-brand-200" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-cormorant italic text-gray-900 leading-snug mb-6">
            Every Piece Begins With a<br />Fabric, a Feeling, and a Story
          </h2>
          <p className="text-gray-500 font-cairo text-sm leading-loose mb-10 max-w-lg mx-auto">
            زهرة الخليج — ماركة مصرية أصيلة منذ عام ٢٠٠٠. نؤمن بأن الأناقة الحقيقية تبدأ من الداخل،
            ونصنع لكِ ملابس تعبر عن شخصيتك الفريدة وتناسب كل مناسبة.
          </p>
          <Link
            href="/products"
            className="inline-block border border-gray-900 text-gray-900 px-10 py-3 text-xs uppercase tracking-widest font-cairo hover:bg-gray-900 hover:text-white transition-colors duration-200"
          >
            اكتشفي المجموعة
          </Link>
        </div>
      </section>

      {/* ── Instagram Grid ── */}
      {instagramPhotos.length > 0 && (
        <section className="py-14 max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-400 font-cairo mb-2">تابعينا</p>
            <h2 className="text-3xl sm:text-4xl font-cormorant italic text-gray-900 leading-none mb-2">Our Instagram</h2>
            <a
              href="https://www.instagram.com/zahretelkhaleej.c/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-400 font-cairo hover:text-brand-600 transition-colors"
            >
              @zahretelkhaleej.c
            </a>
          </div>
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {instagramPhotos.map((product) => (
              <a
                key={product.id}
                href="https://www.instagram.com/zahretelkhaleej.c/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden block"
              >
                <div className="relative aspect-square">
                  <img
                    src={product.images[0] || '/placeholder.jpg'}
                    alt={product.nameAr}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
