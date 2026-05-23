import { getSession } from '@/lib/session'
import POSLoginView from './POSLoginView'

export const metadata = { title: 'نقطة البيع — زهرة الخليج' }

export default async function POSLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
    return <POSLoginView />
  }
  return <>{children}</>
}
