'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Plus, X, Camera, Loader2, Snowflake, Sun } from 'lucide-react'

const SIZES = ['44', '46', '48', '50']

interface SizeStock { [size: string]: number }

interface ProductData {
  id?: string
  nameAr?: string
  nameEn?: string
  descriptionAr?: string
  descriptionEn?: string
  sku?: string
  price?: number
  comparePrice?: number | null
  season?: 'WINTER' | 'SUMMER'
  sizes?: string[]
  sizeStock?: SizeStock
  stock?: number
  images?: string[]
  featured?: boolean
  active?: boolean
}

export default function ProductForm({ product }: { product?: ProductData }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [urlInput, setUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [season, setSeason] = useState<'WINTER' | 'SUMMER'>(product?.season || 'WINTER')
  const [selectedSizes, setSelectedSizes] = useState<string[]>(product?.sizes || [])
  const [sizeStock, setSizeStock] = useState<SizeStock>(
    (product?.sizeStock as SizeStock) || {}
  )
  const isEdit = !!product?.id

  function toggleSize(size: string) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }

  function setSizeQty(size: string, qty: number) {
    setSizeStock((prev) => ({ ...prev, [size]: qty }))
  }

  function totalStock() {
    if (selectedSizes.length === 0) return 0
    return selectedSizes.reduce((sum, s) => sum + (sizeStock[s] || 0), 0)
  }

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
    if (url.includes('cdn.jsdelivr.net')) {
      setImages((prev) => [...prev, url])
      setUrlInput('')
      return
    }
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
    } catch {
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
    const filteredSizeStock: SizeStock = {}
    selectedSizes.forEach((s) => { filteredSizeStock[s] = sizeStock[s] || 0 })
    const data = {
      nameAr: form.get('nameAr') as string,
      nameEn: form.get('nameEn') as string,
      descriptionAr: form.get('descriptionAr') as string,
      descriptionEn: form.get('descriptionEn') as string,
      sku: (form.get('sku') as string) || null,
      price: parseFloat(form.get('price') as string),
      comparePrice: form.get('comparePrice') ? parseFloat(form.get('comparePrice') as string) : null,
      season,
      sizes: selectedSizes,
      sizeStock: filteredSizeStock,
      stock: totalStock(),
      featured: false,
      active: true,
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

      {/* SKU + Price + ComparePrice */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 font-cairo mb-1.5">كود المنتج (SKU)</label>
          <input name="sku" defaultValue={product?.sku || ''} placeholder="مثلاً: 5001"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-mono" dir="ltr" />
        </div>
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
      </div>

      {/* Season */}
      <div>
        <label className="block text-sm font-medium text-gray-700 font-cairo mb-2">الموسم *</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setSeason('WINTER')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-cairo font-semibold transition-all ${
              season === 'WINTER' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-300'
            }`}
          >
            <Snowflake size={18} />
            شتوي
          </button>
          <button
            type="button"
            onClick={() => setSeason('SUMMER')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-cairo font-semibold transition-all ${
              season === 'SUMMER' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600 hover:border-amber-300'
            }`}
          >
            <Sun size={18} />
            صيفي
          </button>
        </div>
      </div>

      {/* Sizes + Stock per size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 font-cairo mb-2">المقاسات والكميات</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SIZES.map((size) => {
            const active = selectedSizes.includes(size)
            return (
              <div key={size} className={`rounded-xl border-2 p-3 transition-all ${active ? 'border-brand-400 bg-brand-50' : 'border-gray-200 bg-gray-50'}`}>
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleSize(size)}
                    className="accent-brand-600 w-4 h-4"
                  />
                  <span className="font-bold text-gray-800 font-cairo">مقاس {size}</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={active ? (sizeStock[size] ?? 0) : ''}
                  onChange={(e) => setSizeQty(size, parseInt(e.target.value) || 0)}
                  disabled={!active}
                  placeholder="الكمية"
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-cairo focus:outline-none focus:ring-2 focus:ring-brand-300 disabled:opacity-40"
                />
              </div>
            )
          })}
        </div>
        {selectedSizes.length > 0 && (
          <p className="text-xs text-gray-500 font-cairo mt-2">
            إجمالي المخزون: <span className="font-bold text-gray-800">{totalStock()} قطعة</span>
          </p>
        )}
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

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 font-cairo mb-3">
          صور المنتج
          <span className="text-xs text-gray-400 font-normal mr-2">(يمكن إضافة أكثر من صورة)</span>
        </label>

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
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-brand-300 rounded-xl text-sm font-cairo text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
            {uploading ? 'جاري الرفع...' : 'رفع من الجهاز أو الكاميرا'}
          </button>

          <div className="flex gap-2 flex-1">
            <input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); uploadFromUrl() } }}
              placeholder="الصق رابط صورة..."
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

        {uploadError && <p className="mt-2 text-xs text-red-500 font-cairo">{uploadError}</p>}
        <p className="mt-2 text-xs text-gray-400 font-cairo">
          يمكنك رفع الصور مباشرة من هاتفك أو لصق رابط. أول صورة تُضاف هي الصورة الرئيسية.
        </p>
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
