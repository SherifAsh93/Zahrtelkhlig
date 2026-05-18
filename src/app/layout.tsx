import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getSession } from '@/lib/session'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'زهرة الخليج | للأزياء النسائية',
  description: 'متجر زهرة الخليج للأزياء النسائية الراقية - عبايات، فساتين، وأكثر',
  keywords: 'عبايات، فساتين، ملابس نسائية، زهرة الخليج',
  openGraph: {
    title: 'زهرة الخليج | للأزياء النسائية',
    description: 'متجرك الأول للأزياء النسائية الراقية',
    locale: 'ar_EG',
    type: 'website',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()

  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full`}>
      <body className="min-h-full flex flex-col font-cairo antialiased bg-gray-50">
        <Navbar session={session ? { name: session.name, email: session.email, role: session.role } : null} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
