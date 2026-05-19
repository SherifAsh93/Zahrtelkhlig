'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ShoppingCart, Heart, User, Search, Menu, X, Package } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import CartDrawer from '@/components/store/CartDrawer'

interface NavbarProps {
  session: { name: string; email: string; role: string } | null
}

export default function Navbar({ session }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const itemCount = useCartStore((s) => s.itemCount())
  const wishlistCount = useWishlistStore((s) => s.items.length)
  const pathname = usePathname()

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/products', label: 'المنتجات' },
    { href: '/products?category=winter', label: 'كولكشن الشتاء' },
    { href: '/products?category=summer', label: 'كولكشن الصيف' },
    { href: '/products?category=eid', label: 'كولكشن العيد' },
    { href: '/products?featured=true', label: 'المميزة' },
  ]

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        {/* Top bar */}
        <div className="bg-gray-900 text-white text-xs py-1.5 px-4 overflow-hidden">
          {/* Mobile: scrolling marquee */}
          <div className="sm:hidden">
            <div className="marquee-track whitespace-nowrap">
              <span className="inline-block px-4">🚚 شحن داخل وخارج دمياط &nbsp;•&nbsp; للطلبات: 01002001446 &nbsp;•&nbsp; الدفع عند الاستلام متاح &nbsp;•&nbsp; 🌸 ماركة مصرية أصيلة منذ 2022</span>
              <span className="inline-block px-4">🚚 شحن داخل وخارج دمياط &nbsp;•&nbsp; للطلبات: 01002001446 &nbsp;•&nbsp; الدفع عند الاستلام متاح &nbsp;•&nbsp; 🌸 ماركة مصرية أصيلة منذ 2022</span>
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
            <span>شحن داخل وخارج دمياط 🚚 | للطلبات: <span dir="ltr">01002001446</span> | الدفع عند الاستلام متاح</span>
            <span className="opacity-0">placeholder</span>
          </div>
        </div>

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img
                src="https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/logo.jpg"
                alt="زهرة الخليج"
                className="w-10 h-10 rounded-full object-cover border border-brand-100"
              />
              <div>
                <p className="font-bold text-gray-900 font-cairo text-sm leading-tight">زهرة الخليج</p>
                <p className="text-xs text-gray-500">للأزياء النسائية</p>
              </div>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors font-cairo ${
                    pathname === link.href
                      ? 'text-brand-600 bg-brand-50'
                      : 'text-gray-700 hover:text-brand-600 hover:bg-brand-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center max-w-xs w-full">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحثي عن منتج..."
                  className="w-full pr-10 pl-4 py-1.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo"
                  dir="rtl"
                />
                <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-600">
                  <Search size={15} />
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors"
              >
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              <Link href="/wishlist" className="relative p-2 text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors">
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {session ? (
                <div className="flex items-center gap-1">
                  <Link href="/orders" className="p-2 text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors" title="طلباتي">
                    <Package size={20} />
                  </Link>
                  <Link href="/profile" className="p-2 text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-full transition-colors" title="حسابي">
                    <User size={20} />
                  </Link>
                  {session.role === 'ADMIN' && (
                    <Link href="/admin" className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-brand-600 text-white text-xs rounded-full font-cairo hover:bg-brand-700 transition-colors">
                      الإدارة
                    </Link>
                  )}
                </div>
              ) : (
                <Link href="/login" className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white text-sm rounded-full font-cairo hover:bg-brand-700 transition-colors">
                  <User size={15} />
                  تسجيل الدخول
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
            <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
              <form onSubmit={handleSearch} className="px-2 mb-3">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحثي عن منتج..."
                    className="w-full pr-10 pl-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo"
                    dir="rtl"
                  />
                  <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={15} />
                  </button>
                </div>
              </form>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-md font-cairo"
                >
                  {link.label}
                </Link>
              ))}
              {session?.role === 'ADMIN' && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-brand-600 bg-brand-50 rounded-md font-cairo">
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
