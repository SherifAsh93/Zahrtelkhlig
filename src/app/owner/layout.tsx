import { getSession } from '@/lib/session'
import OwnerLoginView from './OwnerLoginView'

export const metadata = { title: 'لوحة المالك — زهرة الخليج' }

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || (session.role !== 'OWNER' && session.role !== 'ADMIN')) {
    return <OwnerLoginView />
  }
  return <>{children}</>
}
