import Link from 'next/link'
import { ArrowLeft, Star, Truck, Shield, RefreshCw } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import HeroBanner from '@/components/store/HeroBanner'
import ProductCard from '@/components/store/ProductCard'

async function getBanners() {
  return prisma.banner.findMany({ where: { active: true }, orderBy: { sortOrder: 'asc' } })
}

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { active: true, featured: true },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
    take: 8,
  })
}

async function getNewArrivals() {
  return prisma.product.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
    take: 8,
  })
}

async function getCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { products: { where: { active: true } } } } },
    orderBy: { nameAr: 'asc' },
  })
}

export default async function HomePage() {
  const [banners, featured, newArrivals, categories] = await Promise.all([
    getBanners(),
    getFeaturedProducts(),
    getNewArrivals(),
    getCategories(),
  ])

  const features = [
    { icon: Truck, title: 'شحن سريع', desc: 'توصيل لجميع المحافظات' },
    { icon: Shield, title: 'دفع آمن', desc: 'الدفع عند الاستلام متاح' },
    { icon: RefreshCw, title: 'إرجاع سهل', desc: 'ضمان استرداد الأموال' },
    { icon: Star, title: 'جودة عالية', desc: 'أجود الخامات والتصاميم' },
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
                <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-rose-600" />
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
            <Link href="/products" className="flex items-center gap-1 text-rose-600 text-sm font-cairo hover:gap-2 transition-all">
              عرض الكل <ArrowLeft size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:border-rose-300 hover:shadow-md transition-all"
              >
                <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center group-hover:bg-rose-100 transition-colors">
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
              <Link href="/products?featured=true" className="flex items-center gap-1 text-rose-600 text-sm font-cairo hover:gap-2 transition-all">
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
      <div className="bg-gradient-to-r from-rose-600 to-rose-800 py-16 my-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold font-cairo mb-4">عروض حصرية كل أسبوع</h2>
          <p className="text-rose-100 font-cairo mb-8 text-lg">سجلي الآن واحصلي على خصم 10% على أول طلب</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-rose-600 rounded-full font-bold font-cairo hover:bg-rose-50 transition-colors">
            سجلي الآن
          </Link>
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
            <Link href="/products" className="flex items-center gap-1 text-rose-600 text-sm font-cairo hover:gap-2 transition-all">
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
