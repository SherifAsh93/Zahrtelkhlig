'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Plus, X, Camera, Loader2, Snowflake, Sun, Images } from 'lucide-react'
import MediaPickerModal from './MediaPickerModal'

const SIZES = ['44', '46', '48', '50', 'مقاس موحد']
const COLORS = ['مينت', 'موڤ', 'كحلي', 'كافية', 'أسود', 'لبني', 'چينز']

interface Variant { size: string; color: string; qty: number }
type ColorQtys = Record<string, Record<string, number>>

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
  variants?: Variant[]
  stock?: number
  images?: string[]
}

function variantsToColorQtys(variants: Variant[]): ColorQtys {
  const result: ColorQtys = {}
  for (const v of variants) {
    if (!result[v.color]) result[v.color] = Object.fromEntries(SIZES.map(s => [s, 0]))
    result[v.color][v.size] = v.qty
  }
  return result
}

function colorQtysToVariants(cq: ColorQtys): Variant[] {
  const result: Variant[] = []
  for (const [color, sizes] of Object.entries(cq)) {
    for (const [size, qty] of Object.entries(sizes)) {
      if (qty > 0) result.push({ color, size, qty })
    }
  }
  return result
}

export default function ProductForm({ product }: { product?: ProductData }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [urlInput, setUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [season, setSeason] = useState<'WINTER' | 'SUMMER'>(product?.season || 'WINTER')
  const [colorQtys, setColorQtys] = useState<ColorQtys>(
    variantsToColorQtys((product?.variants as Variant[]) || [])
  )
  const isEdit = !!product?.id
  const activeColors = Object.keys(colorQtys)
  const variants = colorQtysToVariants(colorQtys)
  const totalStock = variants.reduce((s, v) => s + v.qty, 0)

  function toggleColor(color: string) {
    setColorQtys(prev => {
      if (color in prev) {
        const next = { ...prev }
        delete next[color]
        return next
      }
      return { ...prev, [color]: Object.fromEntries(SIZES.map(s => [s, 0])) }
    })
  }

  function setQty(color: string, size: string, qty: number) {
    setColorQtys(prev => ({
      ...prev,
      [color]: { ...prev[color], [size]: Math.max(0, isNaN(qty) ? 0 : qty) },
    }))
  }

  function setAsMain(idx: number) {
    setImages(prev => {
      const next = [...prev]
      const [img] = next.splice(idx, 1)
      return [img, ...next]
    })
  }

  function removeImage(idx: number) {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  async function uploadFiles(files: File[]) {
    setUploading(true)
    setUploadError('')
    try {
      for (const file of files) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Upload failed')
        setImages(prev => [...prev, data.url])
      }
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
    if (url.includes('cdn.jsdelivr.net')) { setImages(prev => [...prev, url]); setUrlInput(''); return }
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
      setImages(prev => [...prev, data.url])
      setUrlInput('')
    } catch {
      setImages(prev => [...prev, url])
      setUrlInput('')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const sizeStock: Record<string, number> = {}
    for (const v of variants) { sizeStock[v.size] = (sizeStock[v.size] || 0) + v.qty }
    const data = {
      nameAr: form.get('nameAr') as string,
      nameEn: form.get('nameEn') as string,
      descriptionAr: form.get('descriptionAr') as string,
      descriptionEn: form.get('descriptionEn') as string,
      sku: (form.get('sku') as string) || null,
      price: parseFloat(form.get('price') as string),
      comparePrice: form.get('comparePrice') ? parseFloat(form.get('comparePrice') as string) : null,
      season,
      variants,
      sizeStock,
      sizes: [...new Set(variants.map(v => v.size))],
      stock: totalStock,
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
          <button type="button" onClick={() => setSeason('WINTER')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-cairo font-semibold transition-all ${season === 'WINTER' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-300'}`}>
            <Snowflake size={18} /> شتوي
          </button>
          <button type="button" onClick={() => setSeason('SUMMER')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-cairo font-semibold transition-all ${season === 'SUMMER' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600 hover:border-amber-300'}`}>
            <Sun size={18} /> صيفي
          </button>
        </div>
      </div>

      {/* ── Variants ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700 font-cairo">
            المتغيرات (ألوان + مقاسات + كميات)
          </label>
          {totalStock > 0 && (
            <span className="text-xs text-brand-600 font-semibold font-cairo bg-brand-50 px-2.5 py-1 rounded-full">
              إجمالي: {totalStock} قطعة
            </span>
          )}
        </div>

        {/* Color chips */}
        <p className="text-xs text-gray-400 font-cairo mb-2">اختر الألوان المتاحة في هذا المنتج:</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {COLORS.map(color => {
            const active = color in colorQtys
            return (
              <button
                key={color}
                type="button"
                onClick={() => toggleColor(color)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-cairo font-semibold transition-all border-2 select-none ${
                  active
                    ? 'bg-brand-600 border-brand-600 text-white shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-brand-300'
                }`}
              >
                {color}
                {active && <X size={13} strokeWidth={2.5} />}
              </button>
            )
          })}
        </div>

        {/* Per-color size grids */}
        {activeColors.length === 0 && (
          <p className="text-xs text-gray-400 font-cairo text-center py-4 border border-dashed border-gray-200 rounded-xl">
            لم يتم اختيار أي لون بعد
          </p>
        )}
        <div className="space-y-3">
          {activeColors.map(color => (
            <div key={color} className="rounded-xl border border-gray-200 overflow-hidden">
              {/* Card header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                <span className="text-sm font-bold font-cairo text-gray-800">{color}</span>
                <button
                  type="button"
                  onClick={() => toggleColor(color)}
                  className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                >
                  <X size={16} />
                </button>
              </div>
              {/* Size qty inputs */}
              <div className="p-3">
                <div className="grid grid-cols-5 gap-2">
                  {SIZES.map(size => (
                    <div key={size} className="flex flex-col items-center gap-1.5">
                      <span className="text-[11px] text-gray-500 font-cairo font-medium">
                        {size === 'مقاس موحد' ? 'موحد' : size}
                      </span>
                      <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={colorQtys[color][size] ?? 0}
                        onChange={e => setQty(color, size, parseInt(e.target.value))}
                        className="w-full text-center py-2.5 border border-gray-200 rounded-xl text-sm font-bold font-cairo focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
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

      {/* ── Images ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700 font-cairo">
            صور المنتج
          </label>
          <span className="text-xs text-gray-400 font-cairo">الصورة الأولى هي الرئيسية</span>
        </div>

        {images.length > 0 && (
          <div className="mb-3">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {images.map((img, i) => (
                <div
                  key={i}
                  className={`relative rounded-xl overflow-hidden bg-gray-100 aspect-[3/4] border-2 group ${
                    i === 0 ? 'border-brand-400' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image src={img} alt={`صورة ${i + 1}`} fill className="object-cover" unoptimized />

                  {/* Main badge */}
                  {i === 0 && (
                    <div className="absolute top-0 inset-x-0 bg-brand-600/90 text-white text-[10px] text-center py-1 font-cairo font-bold z-10">
                      ★ رئيسية
                    </div>
                  )}

                  {/* Order badge for non-main */}
                  {i > 0 && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/50 text-white text-[10px] rounded-full flex items-center justify-center font-bold z-10">
                      {i + 1}
                    </div>
                  )}

                  {/* Actions overlay — visible on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex flex-col justify-between p-1.5 opacity-0 group-hover:opacity-100 z-20">
                    {/* Delete top-left */}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="self-start w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      <X size={13} strokeWidth={2.5} />
                    </button>

                    {/* Set as main — bottom strip, only for non-first */}
                    {i > 0 && (
                      <button
                        type="button"
                        onClick={() => setAsMain(i)}
                        className="w-full bg-brand-600/90 text-white text-[10px] text-center py-1.5 rounded-lg font-cairo font-bold"
                      >
                        تعيين رئيسية
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 font-cairo mt-1.5 text-center">
              مرر الماوس على الصورة للحذف أو تعيينها رئيسية
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => {
            const files = Array.from(e.target.files || [])
            if (files.length) uploadFiles(files)
            e.target.value = ''
          }}
        />

        {showMediaPicker && (
          <MediaPickerModal
            alreadySelected={images}
            onSelect={urls => setImages(prev => [...prev, ...urls.filter(u => !prev.includes(u))])}
            onClose={() => setShowMediaPicker(false)}
          />
        )}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowMediaPicker(true)}
            className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-brand-500 bg-brand-50 rounded-xl text-sm font-cairo text-brand-700 hover:bg-brand-100 transition-colors font-semibold"
          >
            <Images size={18} />
            اختر من مكتبة الصور
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-dashed border-gray-300 rounded-xl text-sm font-cairo text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 active:bg-gray-100"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
            {uploading ? 'جاري الرفع...' : 'رفع صورة جديدة من الجهاز'}
          </button>
          <div className="flex gap-2">
            <input
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); uploadFromUrl() } }}
              placeholder="الصق رابط صورة..."
              className="flex-1 min-w-0 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo"
              dir="rtl"
            />
            <button
              type="button"
              onClick={uploadFromUrl}
              disabled={uploading || !urlInput.trim()}
              className="shrink-0 flex items-center gap-1.5 px-4 py-3 bg-brand-600 text-white rounded-xl text-sm font-cairo hover:bg-brand-700 disabled:opacity-40 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
        {uploadError && <p className="mt-2 text-xs text-red-500 font-cairo">{uploadError}</p>}
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
