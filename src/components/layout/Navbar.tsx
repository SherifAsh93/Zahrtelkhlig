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

const ANNOUNCEMENT = 'شحن لجميع محافظات مصر  ·  مجموعات جديدة كل أسبوع  ·  دفع آمن ومضمون  ·  خدمة العملاء: 01002001446  ·  جودة عالية بأسعار مناسبة  ·  '

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

  const navLink = (href: string, label: string, active: boolean) => (
    <Link
      href={href}
      className={`relative px-4 py-2 text-sm font-cairo transition-colors ${
        active
          ? 'text-brand-700 font-semibold after:absolute after:bottom-0 after:inset-x-4 after:h-[2px] after:bg-brand-500 after:rounded-full'
          : 'text-gray-600 hover:text-brand-600'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm" dir="rtl">
        {/* Announcement bar */}
        <div className="bg-brand-800 overflow-hidden py-2 marquee-container">
          <div className="marquee-track text-white/80 text-[11px] font-cairo tracking-wide whitespace-nowrap select-none">
            {ANNOUNCEMENT}{ANNOUNCEMENT}
          </div>
        </div>

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[64px] md:h-[88px] gap-2">

            {/* Logo */}
            <Link href="/" onClick={handleLogoClick} className="shrink-0 flex items-center">
              <img
                src="https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/logo.jpg"
                alt="زهرة الخليج"
                className="h-[40px] md:h-[58px] w-auto object-contain transition-transform duration-200 hover:scale-105"
              />
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
              {navLink('/', 'الرئيسية', pathname === '/')}
              {navLink('/products', 'جميع المنتجات', pathname === '/products' && !pathname.includes('season'))}
              {navLink('/products?season=SUMMER', 'ملابس الصيف', pathname.includes('SUMMER'))}
              {navLink('/products?season=WINTER', 'ملابس الشتاء', pathname.includes('WINTER'))}
            </div>

            {/* Right-side actions */}
            <div className="flex items-center gap-0.5 md:w-[25%] md:justify-end">

              {/* Wishlist */}
              <Link href="/wishlist" className="relative p-2.5 text-gray-600 hover:text-brand-600 transition-colors rounded-full hover:bg-brand-50">
                <Heart size={19} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 left-1 bg-amber-500 text-white text-[9px] rounded-full w-[18px] h-[18px] flex items-center justify-center font-bold">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button onClick={() => setCartOpen(true)} className="relative p-2.5 text-gray-600 hover:text-brand-600 transition-colors rounded-full hover:bg-brand-50">
                <ShoppingCart size={19} />
                {itemCount > 0 && (
                  <span className="absolute top-1 left-1 bg-brand-600 text-white text-[9px] rounded-full w-[18px] h-[18px] flex items-center justify-center font-bold">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {/* Desktop: auth area */}
              {session ? (
                <div className="hidden md:block relative mr-1" onMouseEnter={openUserMenu} onMouseLeave={closeUserMenu}>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center shrink-0 ring-2 ring-brand-200">
                      <span className="text-brand-700 font-bold text-sm font-cairo">{firstName[0]}</span>
                    </div>
                    <span className="text-sm font-cairo font-medium text-gray-800 max-w-[80px] truncate">{firstName}</span>
                    <ChevronDown size={13} className={`text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-2.5 border-b border-gray-100 mb-1">
                        <p className="text-xs font-cairo font-semibold text-gray-800 truncate">{session.name}</p>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{session.email}</p>
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
                  <Link href="/login" className="px-4 py-2 text-sm font-cairo font-medium text-gray-700 hover:text-brand-600 border border-gray-200 rounded-xl hover:border-brand-300 transition-colors">
                    دخول
                  </Link>
                  <Link href="/register" className="px-4 py-2 text-sm font-cairo font-semibold bg-brand-700 text-white rounded-xl hover:bg-brand-800 transition-colors shadow-sm">
                    تسجيل
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="القائمة"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden border-t border-gray-100 pb-3 animate-fade-in">
              {[
                { href: '/', label: 'الرئيسية', active: pathname === '/' },
                { href: '/products', label: 'جميع المنتجات', active: pathname === '/products' },
                { href: '/products?season=SUMMER', label: 'ملابس الصيف', active: pathname.includes('SUMMER') },
                { href: '/products?season=WINTER', label: 'ملابس الشتاء', active: pathname.includes('WINTER') },
              ].map(({ href, label, active }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className={`flex items-center px-4 py-3.5 text-sm font-cairo border-b border-gray-50 transition-colors ${
                    active ? 'text-brand-700 font-semibold bg-brand-50/50' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {active && <span className="w-1 h-4 bg-brand-500 rounded-full ml-3 shrink-0" />}
                  {label}
                </Link>
              ))}

              {session ? (
                <div>
                  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 bg-brand-50/40">
                    <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center shrink-0 ring-2 ring-brand-200">
                      <span className="text-brand-700 font-bold font-cairo">{firstName[0]}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold font-cairo text-gray-900 truncate">{session.name}</p>
                      <p className="text-xs text-gray-500 truncate">{session.email}</p>
                    </div>
                  </div>
                  <Link href="/profile" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3.5 text-sm font-cairo text-gray-700 border-b border-gray-100 hover:bg-gray-50">
                    <User size={17} className="text-brand-500 shrink-0" />
                    حسابي
                  </Link>
                  <Link href="/orders" onClick={closeMenu} className="flex items-center gap-3 px-4 py-3.5 text-sm font-cairo text-gray-700 border-b border-gray-100 hover:bg-gray-50">
                    <Package size={17} className="text-brand-500 shrink-0" />
                    طلباتي
                  </Link>
                  <form action={logout}>
                    <button type="submit" className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-cairo text-red-500 hover:bg-red-50">
                      <LogOut size={17} className="shrink-0" />
                      تسجيل الخروج
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-4 space-y-2.5">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-brand-600 text-brand-700 rounded-2xl font-cairo font-semibold text-sm hover:bg-brand-50 transition-colors"
                  >
                    <User size={16} />
                    تسجيل الدخول
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className="flex items-center justify-center gap-2 w-full py-3.5 bg-brand-700 text-white rounded-2xl font-cairo font-semibold text-sm hover:bg-brand-800 transition-colors shadow-sm"
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
