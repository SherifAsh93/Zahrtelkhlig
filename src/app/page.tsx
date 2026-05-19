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
    { icon: Truck, title: 'شحن داخل وخارج دمياط', desc: 'متوفر الشحن لجميع المحافظات' },
    { icon: Shield, title: 'الدفع عند الاستلام', desc: 'ادفعي لما يوصلك الطلب' },
    { icon: Star, title: 'Proudly Egyptian 🇪🇬', desc: 'ماركة مصرية أصيلة منذ 2022' },
    { icon: RefreshCw, title: 'استلام يومي', desc: 'من ١١ صباحًا حتي ١٢ مساءً' },
  ]

  return (
    <div dir="rtl">
      <HeroBanner banners={banners} />

      {/* Features bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 font-cairo">{title}</p>
                  <p className="text-xs text-gray-500 font-cairo">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 font-cairo">تسوقي حسب القسم</h2>
            <Link href="/products" className="flex items-center gap-1 text-brand-600 text-sm font-cairo hover:gap-2 transition-all">
              عرض الكل <ArrowLeft size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:border-brand-300 hover:shadow-md transition-all"
              >
                <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.nameAr} className="w-10 h-10 object-cover rounded-full" />
                  ) : (
                    <span className="text-2xl">👗</span>
                  )}
                </div>
                <p className="text-sm font-bold text-gray-800 font-cairo text-center">{cat.nameAr}</p>
                <p className="text-xs text-gray-400 font-cairo">{cat._count.products} منتج</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 font-cairo">المنتجات المميزة</h2>
                <p className="text-gray-500 text-sm font-cairo mt-1">أبرز منتجاتنا المختارة بعناية</p>
              </div>
              <Link href="/products?featured=true" className="flex items-center gap-1 text-brand-600 text-sm font-cairo hover:gap-2 transition-all">
                عرض الكل <ArrowLeft size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Banner CTA */}
      <div className="relative py-20 my-8 overflow-hidden" style={{ background: 'linear-gradient(135deg, #092e1e 0%, #1a7249 50%, #10452c 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #D4A832 0%, transparent 50%), radial-gradient(circle at 80% 50%, #D4A832 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 text-center text-white">
          <p className="text-gold-400 font-cairo text-sm mb-3 tracking-widest">✨ New Collection ✨</p>
          <h2 className="text-3xl font-bold font-cairo mb-4">كولكشن العيد الجديد 🤩</h2>
          <p className="text-brand-200 font-cairo mb-8 text-lg">متوفر الأن — شحن لجميع المحافظات | للطلبات: 01002001446</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/register" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-brand-600 rounded-full font-bold font-cairo hover:bg-brand-50 transition-colors shadow-lg">
              سجلي الآن
            </Link>
            <a href="https://web.facebook.com/zahrtelkhlig" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-5 py-3 bg-[#1877F2] rounded-full text-white text-sm font-cairo hover:bg-[#166FE5] transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              فيسبوك
            </a>
            <a href="https://www.instagram.com/zahretelkhaleej.c/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-5 py-3 rounded-full text-white text-sm font-cairo hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              انستجرام
            </a>
          </div>
        </div>
      </div>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 font-cairo">وصل حديثاً</h2>
              <p className="text-gray-500 text-sm font-cairo mt-1">أحدث المنتجات في مجموعتنا</p>
            </div>
            <Link href="/products" className="flex items-center gap-1 text-brand-600 text-sm font-cairo hover:gap-2 transition-all">
              عرض الكل <ArrowLeft size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
