import Link from 'next/link'
import { MapPin, Phone, Clock } from 'lucide-react'

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
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 mt-16" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/logo.jpg"
                alt="زهرة الخليج"
                className="w-10 h-10 rounded-full object-cover border border-brand-700"
              />
              <div>
                <p className="font-bold text-white font-cairo">زهرة الخليج</p>
                <p className="text-xs text-gray-400">للأزياء النسائية</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 font-cairo leading-relaxed">
              متجرك الأول للأزياء النسائية الراقية. نقدم أجمل العبايات والفساتين بأعلى جودة وأسعار مناسبة.
            </p>
            {/* Social buttons */}
            <div className="flex flex-col gap-2 mt-5">
              <a
                href="https://web.facebook.com/zahrtelkhlig"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-[#1877F2] rounded-xl hover:bg-[#166FE5] transition-colors text-white text-sm font-cairo font-semibold"
              >
                <FacebookIcon />
                تابعينا على فيسبوك
              </a>
              <a
                href="https://www.instagram.com/zahretelkhaleej.c/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-white text-sm font-cairo font-semibold"
                style={{ background: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #F77737 100%)' }}
              >
                <InstagramIcon />
                تابعينا على انستجرام
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-bold mb-4 font-cairo">روابط سريعة</h3>
            <ul className="space-y-2 text-sm font-cairo">
              {[
                { href: '/', label: 'الرئيسية' },
                { href: '/products', label: 'جميع المنتجات' },
                { href: '/products?featured=true', label: 'المنتجات المميزة' },
                { href: '/wishlist', label: 'قائمة الأمنيات' },
                { href: '/orders', label: 'متابعة الطلب' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-brand-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-bold mb-4 font-cairo">الأقسام</h3>
            <ul className="space-y-2 text-sm font-cairo">
              {[
                { href: '/products?category=winter', label: 'كولكشن الشتاء' },
                { href: '/products?category=summer', label: 'كولكشن الصيف' },
                { href: '/products?category=eid', label: 'كولكشن العيد' },
                { href: '/products?category=cardigan', label: 'كارديجان' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-brand-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / Social */}
          <div>
            <h3 className="text-white font-bold mb-4 font-cairo">تواصل معنا</h3>
            <ul className="space-y-3 text-sm font-cairo">
              <li>
                <a href="tel:01002001446" className="flex items-center gap-2 hover:text-brand-400 transition-colors">
                  <Phone size={14} className="text-brand-400 shrink-0" />
                  <span dir="ltr">01002001446</span>
                </a>
              </li>
              <li>
                <a
                  href="https://web.facebook.com/zahrtelkhlig"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-[#1877F2] transition-colors"
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
                  className="flex items-center gap-2 hover:text-[#E1306C] transition-colors"
                >
                  <InstagramIcon className="w-4 h-4 shrink-0" />
                  <span>zahretelkhaleej.c</span>
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-brand-400 shrink-0 mt-0.5" />
                <span className="leading-snug">دمياط - كورنيش النيل - ميدان الساعة - بجوار سليب هاي</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock size={14} className="text-brand-400 shrink-0" />
                <span>من ١١ صباحًا حتي ١٢ مساءً</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-gray-800 rounded-lg text-xs font-cairo">
              <p className="text-gray-400 mb-1">Proudly Egyptian Brand Since 2022 🇪🇬</p>
              <p className="text-brand-400">متوفر الشحن داخل وخارج دمياط</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 font-cairo">
          <p>© 2026 زهرة الخليج. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-4">
            <a href="https://web.facebook.com/zahrtelkhlig" target="_blank" rel="noopener noreferrer" className="hover:text-[#1877F2] transition-colors">
              <FacebookIcon className="w-4 h-4" />
            </a>
            <a href="https://www.instagram.com/zahretelkhaleej.c/" target="_blank" rel="noopener noreferrer" className="hover:text-[#E1306C] transition-colors">
              <InstagramIcon className="w-4 h-4" />
            </a>
            <span>الدفع الآمن</span>
            <span>•</span>
            <span>الشحن لجميع المحافظات</span>
            <span>•</span>
            <span>ضمان الجودة</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
