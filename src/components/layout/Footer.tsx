import Link from 'next/link'
import { Phone, Clock, MapPin, Shield, Truck, Award } from 'lucide-react'

function FacebookIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function InstagramIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300 mt-16" dir="rtl">

      {/* Trust bar */}
      <div className="border-b border-gray-800/60 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: Truck, title: 'شحن لجميع المحافظات', desc: 'التوصيل خلال ٢–٥ أيام عمل' },
              { icon: Shield, title: 'دفع آمن ومضمون ١٠٠٪', desc: 'حماية كاملة لبياناتك' },
              { icon: Award, title: 'ضمان الجودة', desc: 'منتجات مختارة بعناية فائقة' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-800/50 border border-brand-700/40 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-brand-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white font-cairo leading-tight">{title}</p>
                  <p className="text-[11px] text-gray-500 font-cairo mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">

          {/* Brand */}
          <div className="sm:col-span-1">
            <img
              src="https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/logo.jpg"
              alt="زهرة الخليج"
              className="h-10 w-auto object-contain mb-4 brightness-0 invert opacity-90"
            />
            <p className="text-sm text-gray-400 font-cairo leading-relaxed mb-1">
              علامة مصرية أصيلة في عالم الأزياء النسائية منذ عام ٢٠٠٠ — نقدم أجمل العبايات والأزياء بجودة فائقة وأسعار مناسبة.
            </p>
            <p className="text-xs text-brand-400 font-cairo mb-5">متوفر الشحن لجميع المحافظات المصرية 🇪🇬</p>

            <div className="flex flex-col gap-2.5">
              <a
                href="https://web.facebook.com/zahrtelkhlig"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-4 py-2.5 bg-[#1877F2] rounded-xl hover:bg-[#166FE5] transition-colors text-white text-sm font-cairo font-semibold"
              >
                <FacebookIcon className="w-4 h-4" />
                تابعينا على فيسبوك
              </a>
              <a
                href="https://www.instagram.com/zahretelkhaleej.c/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-white text-sm font-cairo font-semibold"
                style={{ background: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #F77737 100%)' }}
              >
                <InstagramIcon className="w-4 h-4" />
                تابعينا على إنستغرام
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-semibold text-gray-300 mb-4 font-cairo tracking-wider uppercase">تسوقي</h3>
            <ul className="space-y-2.5 text-sm font-cairo">
              {[
                { href: '/products', label: 'جميع المنتجات' },
                { href: '/products?season=SUMMER', label: 'ملابس الصيف' },
                { href: '/products?season=WINTER', label: 'ملابس الشتاء' },
                { href: '/products?featured=true', label: 'المنتجات المميزة' },
                { href: '/wishlist', label: 'قائمة الأمنيات' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold text-gray-300 mb-4 font-cairo tracking-wider uppercase">تواصلي معنا</h3>
            <ul className="space-y-3 text-sm font-cairo">
              <li>
                <a href="tel:01002001446" className="flex items-center gap-2.5 text-gray-400 hover:text-brand-400 transition-colors">
                  <Phone size={14} className="text-brand-500 shrink-0" />
                  <span dir="ltr" className="font-medium">01002001446</span>
                </a>
              </li>
              <li>
                <a
                  href="https://web.facebook.com/zahrtelkhlig"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-gray-400 hover:text-[#1877F2] transition-colors"
                >
                  <FacebookIcon className="w-4 h-4 shrink-0" />
                  <span>zahrtelkhlig</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/zahretelkhaleej.c/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-gray-400 hover:text-[#E1306C] transition-colors"
                >
                  <InstagramIcon className="w-4 h-4 shrink-0" />
                  <span>zahretelkhaleej.c</span>
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-gray-400">
                <Clock size={14} className="text-brand-500 shrink-0" />
                <span>من ١١ صباحاً حتى ١٢ منتصف الليل</span>
              </li>
              <li className="flex items-center gap-2.5 text-gray-400">
                <MapPin size={14} className="text-brand-500 shrink-0" />
                <span>التوصيل لجميع محافظات مصر</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600 font-cairo">
          <p>© {new Date().getFullYear()} زهرة الخليج — جميع الحقوق محفوظة</p>
          <div className="flex items-center gap-4">
            <a href="https://web.facebook.com/zahrtelkhlig" target="_blank" rel="noopener noreferrer" className="hover:text-[#1877F2] transition-colors">
              <FacebookIcon className="w-4 h-4" />
            </a>
            <a href="https://www.instagram.com/zahretelkhaleej.c/" target="_blank" rel="noopener noreferrer" className="hover:text-[#E1306C] transition-colors">
              <InstagramIcon className="w-4 h-4" />
            </a>
            <span className="text-gray-700">|</span>
            <span>دفع آمن</span>
            <span className="text-gray-700">·</span>
            <span>شحن موثوق</span>
            <span className="text-gray-700">·</span>
            <span>جودة مضمونة</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
