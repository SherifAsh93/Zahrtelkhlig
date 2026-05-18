import ProductForm from '@/components/admin/ProductForm'

export default function NewProductPage() {
  return (
    <div dir="rtl">
      <h1 className="text-2xl font-bold text-gray-900 font-cairo mb-8">إضافة منتج جديد</h1>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <ProductForm />
      </div>
    </div>
  )
}
