import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProductForm from '@/components/admin/ProductForm'

export const metadata = { title: 'إضافة منتج — نقطة البيع' }

export default function POSNewProductPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white" dir="rtl">
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center gap-3 sticky top-0 z-40"
        style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}>
        <Link href="/pos" className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors">
          <ArrowRight size={20} />
        </Link>
        <p className="font-bold font-cairo text-sm">إضافة منتج جديد</p>
      </div>
      <div className="p-4 pb-10">
        <div className="bg-white rounded-2xl p-5 max-w-2xl mx-auto">
          <ProductForm redirectPath="/pos" cancelPath="/pos" />
        </div>
      </div>
    </div>
  )
}
