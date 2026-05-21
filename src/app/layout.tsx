import type { Metadata } from 'next'
import { Cairo, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import StoreHydration from '@/components/StoreHydration'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const CDN = 'https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images'

export const metadata: Metadata = {
  title: 'زهرة الخليج | لملابس المحجبات',
  description: 'متجر زهرة الخليج لملابس المحجبات الراقية - عبايات، فساتين، وأكثر',
  keywords: 'عبايات، فساتين، ملابس نسائية، زهرة الخليج',
  icons: { icon: `${CDN}/logo.jpg`, apple: `${CDN}/logo.jpg` },
  openGraph: {
    title: 'زهرة الخليج | لملابس المحجبات',
    description: 'متجرك الأول لملابس المحجبات الراقية',
    locale: 'ar_EG',
    type: 'website',
    images: [`${CDN}/logo.jpg`],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${cormorant.variable} h-full`}>
      <body className="min-h-full flex flex-col font-cairo antialiased bg-white">
        <StoreHydration />
        {children}
      </body>
    </html>
  )
}
