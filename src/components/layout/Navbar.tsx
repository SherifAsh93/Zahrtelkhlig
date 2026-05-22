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

const seasonLinks = [
  { href: '/products?season=WINTER', label: 'ملابس الشتاء' },
  { href: '/products?season=SUMMER', label: 'ملابس الصيف' },
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
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50" dir="rtl">
                    <Link href="/products" onClick={() => setProductsOpen(false)} className="block px-4 py-2 text-sm font-cairo text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors font-semibold">
                      جميع المنتجات
                    </Link>
                    <div className="mx-4 my-1.5 border-t border-gray-100" />
                    {seasonLinks.map((c) => (
                      <Link key={c.href} href={c.href} onClick={() => setProductsOpen(false)} className="block px-4 py-2 text-sm font-cairo text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors">
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

                    {seasonLinks.map((c) => (
                      <Link key={c.href} href={c.href} onClick={closeMenu} className="block px-6 py-2 text-sm font-cairo text-gray-600 hover:text-brand-600 border-b border-gray-100 last:border-0">
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </nav>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
