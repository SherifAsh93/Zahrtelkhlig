'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import { ShoppingCart, Heart, Menu, X, ChevronDown, User, Package, LogOut } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import CartDrawer from '@/components/store/CartDrawer'
import { logout } from '@/app/actions/auth'

interface NavbarProps {
  session: { name: string; email: string; role: string } | null
}

export default function Navbar({ session }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const itemCount = useCartStore((s) => s.itemCount())
  const wishlistCount = useWishlistStore((s) => s.items.length)
  const pathname = usePathname()
  const router = useRouter()
  const logoTaps = useRef(0)
  const logoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const userMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  function openUserMenu() {
    if (userMenuTimer.current) clearTimeout(userMenuTimer.current)
    setUserMenuOpen(true)
  }
  function closeUserMenu() {
    userMenuTimer.current = setTimeout(() => setUserMenuOpen(false), 150)
  }

  function closeMenu() { setMenuOpen(false) }

  const firstName = session?.name?.split(' ')[0] ?? ''

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm" dir="rtl">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px] md:h-[100px] gap-2">

            {/* Logo — full square, no circular crop, dedicated 25% zone */}
            <Link href="/" onClick={handleLogoClick}
              className="shrink-0 w-[60px] md:w-[25%] flex justify-center md:justify-start items-center">
              <img
                src="https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/logo.jpg"
                alt="زهرة الخليج"
                className="w-[58px] h-[58px] md:w-[88px] md:h-[88px] rounded-2xl object-contain transition-transform duration-200 hover:scale-105"
              />
            </Link>

            {/* Desktop nav links — flat, no dropdown */}
            <div className="hidden md:flex items-center gap-1 md:flex-1 justify-center">
              <Link
                href="/"
                className={`px-4 py-2 text-sm font-medium font-cairo rounded-lg transition-colors ${pathname === '/' ? 'text-brand-600 bg-brand-50 font-semibold' : 'text-gray-600 hover:text-brand-600 hover:bg-gray-50'}`}
              >
                الرئيسية
              </Link>
              <Link
                href="/products"
                className={`px-4 py-2 text-sm font-medium font-cairo rounded-lg transition-colors ${pathname === '/products' && !pathname.includes('season') ? 'text-brand-600 bg-brand-50 font-semibold' : 'text-gray-600 hover:text-brand-600 hover:bg-gray-50'}`}
              >
                جميع المنتجات
              </Link>
              <Link
                href="/products?season=SUMMER"
                className={`px-4 py-2 text-sm font-medium font-cairo rounded-lg transition-colors ${pathname.includes('SUMMER') ? 'text-brand-600 bg-brand-50 font-semibold' : 'text-gray-600 hover:text-brand-600 hover:bg-gray-50'}`}
              >
                ملابس الصيف
              </Link>
              <Link
                href="/products?season=WINTER"
                className={`px-4 py-2 text-sm font-medium font-cairo rounded-lg transition-colors ${pathname.includes('WINTER') ? 'text-brand-600 bg-brand-50 font-semibold' : 'text-gray-600 hover:text-brand-600 hover:bg-gray-50'}`}
              >
                ملابس الشتاء
              </Link>
            </div>

            {/* Right-side actions */}
            <div className="flex items-center gap-1 md:w-[25%] md:justify-end">

              {/* Wishlist */}
              <Link href="/wishlist" className="relative p-2 text-gray-700 hover:text-brand-600 transition-colors">
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -left-1 bg-amber-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button onClick={() => setCartOpen(true)} className="relative p-2 text-gray-700 hover:text-brand-600 transition-colors">
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -left-1 bg-brand-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {/* Desktop: auth area */}
              {session ? (
                <div className="hidden md:block relative mr-1" onMouseEnter={openUserMenu} onMouseLeave={closeUserMenu}>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-brand-700 font-bold text-sm font-cairo">{firstName[0]}</span>
                    </div>
                    <span className="text-sm font-cairo font-medium text-gray-800 max-w-[80px] truncate">{firstName}</span>
                    <ChevronDown size={13} className={`text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 mb-1">
                        <p className="text-xs font-cairo font-semibold text-gray-800 truncate">{session.name}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{session.email}</p>
                      </div>
                      <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-cairo text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                        <User size={15} />
                        حسابي
                      </Link>
                      <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-cairo text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                        <Package size={15} />
                        طلباتي
                      </Link>
                      <div className="mx-4 my-1 border-t border-gray-100" />
                      <form action={logout}>
                        <button type="submit" className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-cairo text-red-500 hover:bg-red-50 transition-colors">
                          <LogOut size={15} />
                          تسجيل الخروج
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2 mr-1">
                  <Link href="/login" className="px-4 py-2 text-sm font-cairo font-medium text-gray-700 hover:text-brand-600 border border-gray-200 rounded-xl hover:border-brand-400 transition-colors">
                    دخول
                  </Link>
                  <Link href="/register" className="px-4 py-2 text-sm font-cairo font-semibold bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors">
                    تسجيل
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-full"
                aria-label="القائمة"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* ── Mobile menu ── */}
          {menuOpen && (
            <div className="md:hidden border-t border-gray-100 pb-2">

              <Link href="/" onClick={closeMenu} className="block px-4 py-3.5 text-sm font-medium text-gray-700 border-b border-gray-100 font-cairo hover:bg-gray-50">
                الرئيسية
              </Link>
              <Link href="/products" onClick={closeMenu} className="block px-4 py-3.5 text-sm font-medium text-gray-700 border-b border-gray-100 font-cairo hover:bg-gray-50">
                جميع المنتجات
              </Link>
              <Link href="/products?season=SUMMER" onClick={closeMenu} className="block px-4 py-3.5 text-sm font-medium text-gray-700 border-b border-gray-100 font-cairo hover:bg-gray-50">
                ملابس الصيف
              </Link>
              <Link href="/products?season=WINTER" onClick={closeMenu} className="block px-4 py-3.5 text-sm font-medium text-gray-700 border-b border-gray-100 font-cairo hover:bg-gray-50">
                ملابس الشتاء
              </Link>

              {/* Mobile auth */}
              {session ? (
                <div>
                  {/* User info */}
                  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 bg-brand-50/40">
                    <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-brand-700 font-bold font-cairo">{firstName[0]}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold font-cairo text-gray-900 truncate">{session.name}</p>
                      <p className="text-xs text-gray-500 truncate">{session.email}</p>
                    </div>
                  </div>
                  <Link href="/profile" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3.5 text-sm font-cairo text-gray-700 border-b border-gray-100 hover:bg-gray-50">
                    <User size={18} className="text-brand-500 shrink-0" />
                    حسابي
                  </Link>
                  <Link href="/orders" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3.5 text-sm font-cairo text-gray-700 border-b border-gray-100 hover:bg-gray-50">
                    <Package size={18} className="text-brand-500 shrink-0" />
                    طلباتي
                  </Link>
                  <form action={logout}>
                    <button type="submit" className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-cairo text-red-500 hover:bg-red-50">
                      <LogOut size={18} className="shrink-0" />
                      تسجيل الخروج
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-4 space-y-2.5">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-brand-600 text-brand-600 rounded-2xl font-cairo font-semibold text-sm hover:bg-brand-50 transition-colors"
                  >
                    <User size={16} />
                    تسجيل الدخول
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-brand-600 text-white rounded-2xl font-cairo font-semibold text-sm hover:bg-brand-700 transition-colors"
                  >
                    إنشاء حساب جديد
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
