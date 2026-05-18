'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Users, Image,
  Menu, X, LogOut, Home, ChevronLeft,
} from 'lucide-react'
import { logout } from '@/app/actions/auth'

const navItems = [
  { href: '/admin', label: 'الرئيسية', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'المنتجات', icon: Package },
  { href: '/admin/categories', label: 'الأقسام', icon: Tag },
  { href: '/admin/orders', label: 'الطلبات', icon: ShoppingBag },
  { href: '/admin/users', label: 'المستخدمون', icon: Users },
  { href: '/admin/banners', label: 'البانرات', icon: Image },
]

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  const sidebar = (
    <div className={`flex flex-col h-full bg-gray-900 text-gray-100 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-600 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">ز</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm font-cairo">زهرة الخليج</p>
              <p className="text-gray-400 text-xs font-cairo">لوحة التحكم</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ChevronLeft size={18} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              isActive(href, exact)
                ? 'bg-rose-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="text-sm font-cairo">{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-gray-800 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          title={collapsed ? 'الموقع' : undefined}
        >
          <Home size={18} className="shrink-0" />
          {!collapsed && <span className="text-sm font-cairo">الموقع</span>}
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
            title={collapsed ? 'خروج' : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span className="text-sm font-cairo">تسجيل الخروج</span>}
          </button>
        </form>
        {!collapsed && (
          <div className="px-3 py-2 text-xs text-gray-500 font-cairo">{adminName}</div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex shrink-0">{sidebar}</div>

      {/* Mobile */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 right-4 z-50 p-2 bg-gray-900 text-white rounded-xl shadow-lg"
        >
          <Menu size={20} />
        </button>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 left-4 z-10 p-1.5 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
              {sidebar}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
