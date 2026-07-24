import type { Viewport } from 'next'

export const metadata = { title: 'لوحة المالك — زهرة الخليج' }

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#ffffff',
}

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ overscrollBehavior: 'none', WebkitOverflowScrolling: 'touch' as never }}>
      {children}
    </div>
  )
}
