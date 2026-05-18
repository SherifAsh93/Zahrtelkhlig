import Link from 'next/link'
import { ExternalLink, Heart, Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6 mt-16" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-rose-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg font-cairo">ز</span>
              </div>
              <div>
                <p className="font-bold text-white font-cairo">زهرة الخليج</p>
                <p className="text-xs text-gray-400">للأزياء النسائية</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 font-cairo leading-relaxed">
              متجرك الأول للأزياء النسائية الراقية. نقدم أجمل العبايات والفساتين بأعلى جودة وأسعار مناسبة.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="https://www.facebook.com/zahrtelkhlig" target="_blank" rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-full hover:bg-rose-600 transition-colors text-xs font-bold text-white">
                f
              </a>
              <a href="https://www.instagram.com/zahrat_qal" target="_blank" rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-full hover:bg-rose-600 transition-colors">
                <Heart size={16} />
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
                  <Link href={link.href} className="hover:text-rose-400 transition-colors">
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
                { href: '/products?category=abaya', label: 'عبايات' },
                { href: '/products?category=dress', label: 'فساتين' },
                { href: '/products?category=kaftan', label: 'قفاطين' },
                { href: '/products?category=jilbab', label: 'جلابيب' },
                { href: '/products?category=accessories', label: 'إكسسوارات' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-rose-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4 font-cairo">تواصل معنا</h3>
            <ul className="space-y-3 text-sm font-cairo">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-rose-400 shrink-0" />
                <span>01000000000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-rose-400 shrink-0" />
                <span>info@zahrtelkhlig.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-rose-400 shrink-0" />
                <span>مصر</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-400 font-cairo">أوقات العمل</p>
              <p className="text-sm text-white font-cairo">السبت - الخميس: 10ص - 10م</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 font-cairo">
          <p>© 2024 زهرة الخليج. جميع الحقوق محفوظة.</p>
          <div className="flex gap-4">
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
