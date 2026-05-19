import Link from 'next/link'
import { ArrowLeft, Star, Truck, Shield, RefreshCw } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import HeroBanner from '@/components/store/HeroBanner'
import ProductCard from '@/components/store/ProductCard'

async function getBanners() {
  try { return await prisma.banner.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } }) }
  catch { return [] }
}

async function getFeaturedProducts() {
  try {
    return await prisma.product.findMany({
      where: { active: true, featured: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    })
  } catch { return [] }
}

async function getNewArrivals() {
  try {
    return await prisma.product.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    })
  } catch { return [] }
}

async function getCategories() {
  try {
    return await prisma.category.findMany({
      include: { _count: { select: { products: { where: { active: true } } } } },
      orderBy: { nameAr: 'asc' },
    })
  } catch { return [] }
}

export default async function HomePage() {
  const [banners, featured, newArrivals, categoriesAll] = await Promise.all([
    getBanners(),
    getFeaturedProducts(),
    getNewArrivals(),
    getCategories(),
  ])
  const categories = categoriesAll.filter((c) => c._count.products > 0)

  const features = [
    { icon: Truck, title: 'شحن لجميع المحافظات', desc: 'داخل وخارج دمياط' },
    { icon: Shield, title: 'الدفع عند الاستلام', desc: 'ادفعي لما يوصلك الطلب' },
    { icon: Star, title: 'ماركة مصرية أصيلة', desc: 'Proudly Egyptian Since 2022 🇪🇬' },
    { icon: RefreshCw, title: 'استلام يومي', desc: 'من ١١ صباحًا حتي ١٢ مساءً' },
  ]

  return (
    <div dir="rtl">
      <HeroBanner banners={banners} />

      {/* Features bar */}
      <div className="border-y border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-2.5">
                <Icon size={18} className="text-brand-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-gray-900 font-cairo leading-tight">{title}</p>
                  <p className="text-xs text-gray-500 font-cairo leading-tight">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories — magazine-style cover tiles */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <p className="text-xs text-gray-400 font-cairo tracking-widest uppercase mb-2">تسوقي حسب القسم</p>
            <h2 className="text-2xl font-light text-gray-900 font-cairo">اختاري مجموعتك</h2>
            <div className="w-12 h-px bg-brand-400 mx-auto mt-3" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-none aspect-[3/4] block"
              >
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.nameAr}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-brand-50 flex items-center justify-center">
                    <span className="text-4xl">👗</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-3 text-white">
                  <p className="font-bold font-cairo text-sm leading-tight">{cat.nameAr}</p>
                  <p className="text-xs text-gray-300 font-cairo mt-0.5">{cat._count.products} منتج</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <div className="relative overflow-hidden my-2 bg-[#111111]">
        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-16 text-center">
          <p className="text-gray-400 font-cairo text-xs sm:text-sm tracking-widest uppercase mb-2">New Collection</p>
          <h2 className="text-2xl sm:text-3xl font-bold font-cairo text-white mb-3">كولكشن العيد الجديد</h2>
          <p className="text-gray-400 font-cairo mb-6 text-sm sm:text-base">متوفر الآن — شحن لجميع المحافظات<br className="sm:hidden" /><span className="hidden sm:inline"> | </span>للطلبات: <span dir="ltr">01002001446</span></p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/products?category=eid" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 border border-white text-white hover:bg-white hover:text-gray-900 font-bold font-cairo transition-colors text-sm">
              تسوقي الآن
            </Link>
            <a href="https://web.facebook.com/zahrtelkhlig" target="_blank" rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#1877F2] text-white text-sm font-cairo hover:bg-[#166FE5] transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              تابعينا فيسبوك
            </a>
            <a href="https://www.instagram.com/zahretelkhaleej.c/" target="_blank" rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-white text-sm font-cairo"
              style={{ background: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              انستجرام
            </a>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <p className="text-xs text-gray-400 font-cairo tracking-widest uppercase mb-2">المنتجات المميزة</p>
              <h2 className="text-2xl font-light text-gray-900 font-cairo">مختارة بعناية لك</h2>
              <div className="w-12 h-px bg-brand-400 mx-auto mt-3" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/products?featured=true" className="inline-flex items-center gap-1 text-brand-600 text-sm font-cairo hover:gap-2 transition-all">
                عرض الكل <ArrowLeft size={14} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <p className="text-xs text-gray-400 font-cairo tracking-widest uppercase mb-2">وصل حديثاً</p>
            <h2 className="text-2xl font-light text-gray-900 font-cairo">أحدث المجموعة</h2>
            <div className="w-12 h-px bg-brand-400 mx-auto mt-3" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/products" className="inline-flex items-center gap-1 text-brand-600 text-sm font-cairo hover:gap-2 transition-all">
              عرض الكل <ArrowLeft size={14} />
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
