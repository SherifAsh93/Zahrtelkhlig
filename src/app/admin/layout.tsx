import { getAdminSession } from '@/lib/session'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminLoginView from '@/components/admin/AdminLoginView'

export const metadata = { title: 'لوحة التحكم - زهرة الخليج' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession()

  if (!session) {
    return <AdminLoginView />
  }

  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-4 lg:p-6 pb-20 lg:pb-6">{children}</main>
    </div>
  )
}
