import type { Viewport } from 'next'
import { getSession } from '@/lib/session'
import POSLoginView from './POSLoginView'

export const metadata = { title: 'نقطة البيع — زهرة الخليج' }

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#111827',
}

export default async function POSLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  const authorized = session && (session.role === 'ADMIN' || session.role === 'STAFF')
  return (
    <div style={{ overscrollBehavior: 'none', WebkitOverflowScrolling: 'touch' as never }}>
      {authorized ? children : <POSLoginView />}
    </div>
  )
}
