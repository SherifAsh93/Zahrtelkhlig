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
    { href: '/products?category=abaya', label: 'عبايات' },
    { href: '/products?category=dress', label: 'فساتين' },
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
        <div className="bg-rose-600 text-white text-center text-xs py-1.5 px-4">
          شحن مجاني للطلبات فوق 500 جنيه | الدفع عند الاستلام متاح
        </div>

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 bg-rose-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg font-cairo">ز</span>
              </div>
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
                      ? 'text-rose-600 bg-rose-50'
                      : 'text-gray-700 hover:text-rose-600 hover:bg-rose-50'
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
                  className="w-full pr-10 pl-4 py-1.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-300 font-cairo"
                  dir="rtl"
                />
                <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-600">
                  <Search size={15} />
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-gray-700 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
              >
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              <Link href="/wishlist" className="relative p-2 text-gray-700 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors">
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {session ? (
                <div className="flex items-center gap-1">
                  <Link href="/orders" className="p-2 text-gray-700 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors" title="طلباتي">
                    <Package size={20} />
                  </Link>
                  <Link href="/profile" className="p-2 text-gray-700 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors" title="حسابي">
                    <User size={20} />
                  </Link>
                  {session.role === 'ADMIN' && (
                    <Link href="/admin" className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white text-xs rounded-full font-cairo hover:bg-rose-700 transition-colors">
                      لوحة التحكم
                    </Link>
                  )}
                </div>
              ) : (
                <Link href="/login" className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white text-sm rounded-full font-cairo hover:bg-rose-700 transition-colors">
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
                    className="w-full pr-10 pl-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-rose-300 font-cairo"
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
                  className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-rose-600 hover:bg-rose-50 rounded-md font-cairo"
                >
                  {link.label}
                </Link>
              ))}
              {session?.role === 'ADMIN' && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-rose-600 bg-rose-50 rounded-md font-cairo">
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
