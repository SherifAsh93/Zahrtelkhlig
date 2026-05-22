'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Users, Image, FileEdit,
  X, LogOut, Home, ChevronLeft, Menu, Warehouse, BarChart3, ShoppingCart,
} from 'lucide-react'
import { adminLogout } from '@/app/actions/auth'

const navItems = [
  { href: '/admin',            label: 'الرئيسية',        icon: LayoutDashboard, exact: true },
  { href: '/admin/products',   label: 'المنتجات',        icon: Package },
  { href: '/admin/orders',     label: 'الطلبات',         icon: ShoppingBag },
  { href: '/admin/inventory',  label: 'المخزون',         icon: Warehouse },
  { href: '/admin/reports',    label: 'التقارير',        icon: BarChart3 },
  { href: '/admin/categories', label: 'الأقسام',         icon: Tag },
  { href: '/admin/homepage',   label: 'الصفحة الرئيسية', icon: FileEdit },
  { href: '/admin/banners',    label: 'البانرات',        icon: Image },
  { href: '/admin/users',      label: 'المستخدمون',     icon: Users },
]

// Mobile bottom bar: 5 most-used
const bottomTabs = navItems.slice(0, 5)

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  const sidebarContent = (
    <div className={`flex flex-col h-full bg-gray-900 text-gray-100 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center shrink-0">
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

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileDrawerOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
              isActive(href, exact) ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span className="text-sm font-cairo">{label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-2 border-t border-gray-800 space-y-1">
        <Link
          href="/pos"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-emerald-400 hover:text-white hover:bg-emerald-800/40 transition-colors"
          title={collapsed ? 'نقطة البيع' : undefined}
        >
          <ShoppingCart size={18} className="shrink-0" />
          {!collapsed && <span className="text-sm font-cairo font-semibold">نقطة البيع</span>}
        </Link>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          title={collapsed ? 'الموقع' : undefined}
        >
          <Home size={18} className="shrink-0" />
          {!collapsed && <span className="text-sm font-cairo">الموقع</span>}
        </Link>
        <form action={adminLogout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-colors"
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span className="text-sm font-cairo">تسجيل الخروج</span>}
          </button>
        </form>
        {!collapsed && (
          <div className="px-3 py-2 text-xs text-gray-500 font-cairo truncate">{adminName}</div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">{sidebarContent}</div>

      {/* Mobile: full drawer (for 'more' access) */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex" dir="rtl">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileDrawerOpen(false)} />
          <div className="relative flex-shrink-0 flex flex-col h-full bg-gray-900 w-64 shadow-2xl">
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="absolute top-4 left-4 p-1.5 text-gray-400 hover:text-white z-10"
            >
              <X size={20} />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Mobile: bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-gray-900 border-t border-gray-800 flex items-stretch" dir="rtl">
        {bottomTabs.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              isActive(href, exact) ? 'text-brand-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px] font-cairo leading-normal">{label}</span>
          </Link>
        ))}
        {/* More button opens the full drawer */}
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-gray-500 hover:text-gray-300"
        >
          <Menu size={20} />
          <span className="text-[10px] font-cairo leading-normal">المزيد</span>
        </button>
      </nav>
    </>
  )
}
