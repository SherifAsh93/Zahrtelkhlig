'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import { ShoppingCart, Heart, Menu, X, ChevronDown } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import CartDrawer from '@/components/store/CartDrawer'

interface NavbarProps {
  session: { name: string; email: string; role: string } | null
}

const permanentCategories = [
  { href: '/products?category=abaya',         label: 'عباية' },
  { href: '/products?category=cardigan',      label: 'كارديجان' },
  { href: '/products?category=vest',          label: 'فيست' },
  { href: '/products?category=suit',          label: 'سويت' },
  { href: '/products?category=long-chemise',  label: 'قميص طويل' },
  { href: '/products?category=short-chemise', label: 'قميص قصير' },
]

const seasonalCategories = [
  { href: '/products?category=eid',    label: 'كولكشن العيد' },
  { href: '/products?category=summer', label: 'كولكشن الصيف' },
  { href: '/products?category=winter', label: 'كولكشن الشتاء' },
]

export default function Navbar({ session }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false)
  const itemCount = useCartStore((s) => s.itemCount())
  const wishlistCount = useWishlistStore((s) => s.items.length)
  const pathname = usePathname()
  const router = useRouter()
  const logoTaps = useRef(0)
  const logoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleLogoClick(e: React.MouseEvent) {
    logoTaps.current += 1
    if (logoTimer.current) clearTimeout(logoTimer.current)
    if (logoTaps.current >= 3) {
      e.preventDefault()
      logoTaps.current = 0
      router.push('/admin')
      return
    }
    logoTimer.current = setTimeout(() => { logoTaps.current = 0 }, 600)
  }

  function openDropdown() {
    if (dropdownTimer.current) clearTimeout(dropdownTimer.current)
    setProductsOpen(true)
  }

  function closeDropdown() {
    dropdownTimer.current = setTimeout(() => setProductsOpen(false), 120)
  }

  function closeMenu() {
    setMenuOpen(false)
    setMobileProductsOpen(false)
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        {/* Top bar */}
        <div className="bg-gray-900 text-white text-xs py-1.5 px-4 overflow-hidden">
          {/* Mobile: scrolling marquee */}
          <div className="sm:hidden">
            <div className="marquee-track whitespace-nowrap uppercase tracking-widest">
              <span className="inline-block px-4">شحن لجميع محافظات مصر &nbsp;•&nbsp; للطلبات: 01002001446 &nbsp;•&nbsp; الدفع عند الاستلام أو تحويل بنكي</span>
              <span className="inline-block px-4">شحن لجميع محافظات مصر &nbsp;•&nbsp; للطلبات: 01002001446 &nbsp;•&nbsp; الدفع عند الاستلام أو تحويل بنكي</span>
            </div>
          </div>
          {/* Desktop: static centered */}
          <div className="hidden sm:flex max-w-7xl mx-auto items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="https://web.facebook.com/zahrtelkhlig" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors" aria-label="فيسبوك">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://www.instagram.com/zahretelkhaleej.c/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors" aria-label="انستجرام">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
            <span className="uppercase tracking-widest">شحن لجميع محافظات مصر &nbsp;•&nbsp; للطلبات: <span dir="ltr">01002001446</span> &nbsp;•&nbsp; الدفع عند الاستلام</span>
            <span className="opacity-0">placeholder</span>
          </div>
        </div>

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" onClick={handleLogoClick} className="flex items-center gap-2 shrink-0">
              <img
                src="https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/logo.jpg"
                alt="زهرة الخليج"
                className="w-10 h-10 rounded-full object-cover border border-brand-100"
              />
              <div>
                <p className="font-bold text-gray-900 font-cairo text-sm leading-normal">زهرة الخليج</p>
                <p className="text-xs text-gray-500">لملابس المحجبات</p>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className={`px-3 py-2 text-sm font-medium transition-colors font-cairo ${pathname === '/' ? 'text-brand-600 font-semibold' : 'text-gray-700 hover:text-brand-600'}`}
              >
                الرئيسية
              </Link>

              {/* Products dropdown */}
              <div className="relative" onMouseEnter={openDropdown} onMouseLeave={closeDropdown}>
                <button
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors font-cairo ${pathname.startsWith('/products') ? 'text-brand-600 font-semibold' : 'text-gray-700 hover:text-brand-600'}`}
                >
                  المنتجات
                  <ChevronDown size={14} className={`transition-transform duration-200 ${productsOpen ? 'rotate-180' : ''}`} />
                </button>

                {productsOpen && (
                  <div className="absolute top-full right-0 mt-1 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50" dir="rtl">
                    <Link href="/products" onClick={() => setProductsOpen(false)} className="block px-4 py-2 text-sm font-cairo text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors font-semibold">
                      جميع المنتجات
                    </Link>
                    <Link href="/products?featured=true" onClick={() => setProductsOpen(false)} className="block px-4 py-2 text-sm font-cairo text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                      المميزة ✨
                    </Link>

                    <div className="mx-4 my-1.5 border-t border-gray-100" />
                    <p className="px-4 py-1 text-xs text-gray-400 uppercase tracking-widest font-cairo">أقسام دائمة</p>
                    {permanentCategories.map((c) => (
                      <Link key={c.href} href={c.href} onClick={() => setProductsOpen(false)} className="block px-4 py-1.5 text-sm font-cairo text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                        {c.label}
                      </Link>
                    ))}

                    <div className="mx-4 my-1.5 border-t border-gray-100" />
                    <p className="px-4 py-1 text-xs text-gray-400 uppercase tracking-widest font-cairo">موسمي</p>
                    {seasonalCategories.map((c) => (
                      <Link key={c.href} href={c.href} onClick={() => setProductsOpen(false)} className="block px-4 py-1.5 text-sm font-cairo text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-gray-700 hover:text-brand-600 transition-colors"
              >
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              <Link href="/wishlist" className="relative p-2 text-gray-700 hover:text-brand-600 transition-colors">
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {session?.role === 'ADMIN' && (
                <Link href="/admin" className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-brand-600 text-white text-xs rounded-full font-cairo hover:bg-brand-700 transition-colors">
                  الإدارة
                </Link>
              )}

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-full"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden border-t border-gray-100 py-2">
              <Link
                href="/"
                onClick={closeMenu}
                className="block px-4 py-3 text-sm font-medium text-gray-700 border-b border-gray-100 font-cairo"
              >
                الرئيسية
              </Link>

              {/* Products accordion */}
              <div className="border-b border-gray-100">
                <button
                  onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 font-cairo"
                >
                  <span>المنتجات</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${mobileProductsOpen ? 'rotate-180' : ''}`} />
                </button>

                {mobileProductsOpen && (
                  <div className="bg-gray-50 pb-1">
                    <Link href="/products" onClick={closeMenu} className="block px-6 py-2.5 text-sm font-cairo text-gray-700 hover:text-brand-600 font-semibold border-b border-gray-100">
                      جميع المنتجات
                    </Link>
                    <Link href="/products?featured=true" onClick={closeMenu} className="block px-6 py-2.5 text-sm font-cairo text-gray-600 hover:text-brand-600 border-b border-gray-100">
                      المميزة ✨
                    </Link>

                    <p className="px-6 pt-2 pb-1 text-xs text-gray-400 uppercase tracking-widest font-cairo">أقسام دائمة</p>
                    {permanentCategories.map((c) => (
                      <Link key={c.href} href={c.href} onClick={closeMenu} className="block px-6 py-2 text-sm font-cairo text-gray-600 hover:text-brand-600 border-b border-gray-100 last:border-0">
                        {c.label}
                      </Link>
                    ))}

                    <p className="px-6 pt-2 pb-1 text-xs text-gray-400 uppercase tracking-widest font-cairo">موسمي</p>
                    {seasonalCategories.map((c) => (
                      <Link key={c.href} href={c.href} onClick={closeMenu} className="block px-6 py-2 text-sm font-cairo text-gray-600 hover:text-brand-600 border-b border-gray-100 last:border-0">
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {session?.role === 'ADMIN' && (
                <Link href="/admin" onClick={closeMenu} className="block px-4 py-3 text-sm font-medium text-brand-600 border-b border-gray-100 font-cairo">
                  لوحة التحكم
                </Link>
              )}
            </div>
          )}
        </nav>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
