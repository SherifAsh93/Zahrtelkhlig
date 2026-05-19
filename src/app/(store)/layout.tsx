import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getSession } from '@/lib/session'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession().catch(() => null)

  return (
    <>
      <Navbar session={session ? { name: session.name, email: session.email, role: session.role } : null} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
