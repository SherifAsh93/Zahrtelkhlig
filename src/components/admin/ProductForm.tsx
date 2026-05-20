'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Plus, X, Upload, Link as LinkIcon, Camera, Loader2 } from 'lucide-react'

interface Category {
  id: string
  nameAr: string
  seasonal: boolean
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [urlInput, setUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const isEdit = !!product?.id

  useEffect(() => {
    fetch('/api/admin/categories').then((r) => r.json()).then(setCategories)
  }, [])

  async function uploadFile(file: File) {
    setUploading(true)
    setUploadError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setImages((prev) => [...prev, data.url])
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : 'فشل الرفع')
    } finally {
      setUploading(false)
    }
  }

  async function uploadFromUrl() {
    const url = urlInput.trim()
    if (!url) return
    if (images.includes(url)) { setUrlInput(''); return }

    // If it's already a jsDelivr URL just add it directly
    if (url.includes('cdn.jsdelivr.net')) {
      setImages((prev) => [...prev, url])
      setUrlInput('')
      return
    }

    // Otherwise download & re-host via GitHub
    setUploading(true)
    setUploadError('')
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Download failed')
      setImages((prev) => [...prev, data.url])
      setUrlInput('')
    } catch (e: unknown) {
      // Fallback: just store the URL as-is
      setImages((prev) => [...prev, url])
      setUrlInput('')
    } finally {
      setUploading(false)
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
    <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">

      {/* Names */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">اسم المنتج (عربي) *</label>
          <input name="nameAr" defaultValue={product?.nameAr} required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name (English)</label>
          <input name="nameEn" defaultValue={product?.nameEn}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300" />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">الوصف (عربي)</label>
        <textarea name="descriptionAr" defaultValue={product?.descriptionAr} rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo resize-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (English)</label>
        <textarea name="descriptionEn" defaultValue={product?.descriptionEn} rows={2}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none" />
      </div>

      {/* Price / Stock / Category */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">السعر (جنيه) *</label>
          <input name="price" type="number" step="0.01" defaultValue={product?.price} required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">قبل الخصم</label>
          <input name="comparePrice" type="number" step="0.01" defaultValue={product?.comparePrice || ''}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">المخزون *</label>
          <input name="stock" type="number" defaultValue={product?.stock ?? 0} required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">القسم *</label>
          <select name="categoryId" defaultValue={product?.categoryId} required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo bg-white">
            <option value="">اختاري القسم</option>
            {categories.filter((c) => !c.seasonal).length > 0 && (
              <optgroup label="— أقسام دائمة —">
                {categories.filter((c) => !c.seasonal).map((c) => (
                  <option key={c.id} value={c.id}>{c.nameAr}</option>
                ))}
              </optgroup>
            )}
            {categories.filter((c) => c.seasonal).length > 0 && (
              <optgroup label="— أقسام موسمية —">
                {categories.filter((c) => c.seasonal).map((c) => (
                  <option key={c.id} value={c.id}>{c.nameAr}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      {/* ── Images section ─────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 font-cairo mb-3">
          صور المنتج
          <span className="text-xs text-gray-400 font-normal mr-2">(يمكن إضافة أكثر من صورة)</span>
        </label>

        {/* Thumbnail previews */}
        {images.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {images.map((img, i) => (
              <div key={i} className="relative group w-20 h-24 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                <Image src={img} alt={`صورة ${i + 1}`} fill className="object-cover" unoptimized />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, j) => j !== i))}
                  className="absolute top-1 left-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
                {i === 0 && (
                  <div className="absolute bottom-0 inset-x-0 bg-brand-600/80 text-white text-[9px] text-center py-0.5 font-cairo">
                    رئيسية
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload from device — works from phone camera or gallery */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) uploadFile(file)
            e.target.value = ''
          }}
        />

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Camera / gallery upload */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-brand-300 rounded-xl text-sm font-cairo text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Camera size={16} />
            )}
            {uploading ? 'جاري الرفع...' : 'رفع من الجهاز أو الكاميرا'}
          </button>

          {/* URL paste */}
          <div className="flex gap-2 flex-1">
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); uploadFromUrl() } }}
              placeholder="الصق رابط صورة (فيسبوك، انستجرام، أي رابط...)"
              className="flex-1 min-w-0 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo"
              dir="rtl"
            />
            <button
              type="button"
              onClick={uploadFromUrl}
              disabled={uploading || !urlInput.trim()}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-cairo hover:bg-brand-700 disabled:opacity-40 transition-colors"
            >
              <Plus size={16} />
              إضافة
            </button>
          </div>
        </div>

        {uploadError && (
          <p className="mt-2 text-xs text-red-500 font-cairo">{uploadError}</p>
        )}
        <p className="mt-2 text-xs text-gray-400 font-cairo">
          يمكنك رفع الصور مباشرة من هاتفك، أو لصق رابط من فيسبوك أو أي موقع. أول صورة تُضاف هي الصورة الرئيسية.
        </p>
      </div>

      {/* Toggles */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="featured" defaultChecked={product?.featured} className="accent-brand-600 w-4 h-4" />
          <span className="text-sm font-cairo text-gray-700">منتج مميز</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="active" defaultChecked={product?.active !== false} className="accent-brand-600 w-4 h-4" />
          <span className="text-sm font-cairo text-gray-700">نشط ومرئي</span>
        </label>
      </div>

      <div className="flex gap-3 pt-1">
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
