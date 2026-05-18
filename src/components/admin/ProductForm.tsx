'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Plus, X } from 'lucide-react'

interface Category {
  id: string
  nameAr: string
}

interface ProductData {
  id?: string
  nameAr?: string
  nameEn?: string
  descriptionAr?: string
  descriptionEn?: string
  price?: number
  comparePrice?: number | null
  stock?: number
  images?: string[]
  featured?: boolean
  active?: boolean
  categoryId?: string
}

export default function ProductForm({ product }: { product?: ProductData }) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [newImage, setNewImage] = useState('')
  const isEdit = !!product?.id

  useEffect(() => {
    fetch('/api/admin/categories').then((r) => r.json()).then(setCategories)
  }, [])

  function addImage() {
    if (newImage.trim() && !images.includes(newImage.trim())) {
      setImages([...images, newImage.trim()])
      setNewImage('')
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const data = {
      nameAr: form.get('nameAr') as string,
      nameEn: form.get('nameEn') as string,
      descriptionAr: form.get('descriptionAr') as string,
      descriptionEn: form.get('descriptionEn') as string,
      price: parseFloat(form.get('price') as string),
      comparePrice: form.get('comparePrice') ? parseFloat(form.get('comparePrice') as string) : null,
      stock: parseInt(form.get('stock') as string),
      categoryId: form.get('categoryId') as string,
      featured: form.get('featured') === 'on',
      active: form.get('active') === 'on',
      images,
    }

    const url = isEdit ? `/api/admin/products/${product.id}` : '/api/admin/products'
    const method = isEdit ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    router.push('/admin/products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">اسم المنتج (عربي) *</label>
          <input name="nameAr" defaultValue={product?.nameAr} required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 font-cairo" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">Product Name (English)</label>
          <input name="nameEn" defaultValue={product?.nameEn}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">الوصف (عربي)</label>
        <textarea name="descriptionAr" defaultValue={product?.descriptionAr} rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 font-cairo resize-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">Description (English)</label>
        <textarea name="descriptionEn" defaultValue={product?.descriptionEn} rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">السعر (جنيه) *</label>
          <input name="price" type="number" step="0.01" defaultValue={product?.price} required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 font-cairo" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">السعر قبل الخصم</label>
          <input name="comparePrice" type="number" step="0.01" defaultValue={product?.comparePrice || ''}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 font-cairo" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">المخزون *</label>
          <input name="stock" type="number" defaultValue={product?.stock || 0} required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 font-cairo" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">القسم *</label>
          <select name="categoryId" defaultValue={product?.categoryId} required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 font-cairo bg-white">
            <option value="">اختاري القسم</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.nameAr}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 font-cairo mb-2">صور المنتج (روابط URL)</label>
        <div className="flex gap-2 mb-3">
          <input
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage() } }}
            placeholder="https://cdn.jsdelivr.net/gh/SherifAsh93/Zahrtelkhlig@main/public/images/..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
          <Button type="button" onClick={addImage} size="sm">
            <Plus size={16} />
            إضافة
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {images.map((img, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs">
              <span className="max-w-xs truncate">{img}</span>
              <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="featured" defaultChecked={product?.featured} className="accent-rose-600 w-4 h-4" />
          <span className="text-sm font-cairo text-gray-700">منتج مميز</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="active" defaultChecked={product?.active !== false} className="accent-rose-600 w-4 h-4" />
          <span className="text-sm font-cairo text-gray-700">نشط ومرئي</span>
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={loading} size="lg">
          {isEdit ? 'حفظ التغييرات' : 'إضافة المنتج'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>
          إلغاء
        </Button>
      </div>
    </form>
  )
}
