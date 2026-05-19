import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = { title: 'لوحة التحكم - زهرة الخليج' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/admin-login')

  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">
      <AdminSidebar adminName={session.name} />
      <main className="flex-1 min-w-0 p-4 lg:p-6 pb-20 lg:pb-6">{children}</main>
    </div>
  )
}
