'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Plus, X, Camera, Loader2, Snowflake, Sun, Trash2 } from 'lucide-react'

const SIZES = ['44', '46', '48', '50']

interface Variant { size: string; color: string; qty: number }

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

export default function ProductForm({ product }: { product?: ProductData }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [urlInput, setUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [season, setSeason] = useState<'WINTER' | 'SUMMER'>(product?.season || 'WINTER')
  const [variants, setVariants] = useState<Variant[]>((product?.variants as Variant[]) || [])
  const [newSize, setNewSize] = useState('44')
  const [newColor, setNewColor] = useState('')
  const [newQty, setNewQty] = useState(1)
  const isEdit = !!product?.id

  function addVariant() {
    const color = newColor.trim()
    if (!color) return
    const existing = variants.findIndex(v => v.size === newSize && v.color === color)
    if (existing >= 0) {
      setVariants(prev => prev.map((v, i) => i === existing ? { ...v, qty: v.qty + newQty } : v))
    } else {
      setVariants(prev => [...prev, { size: newSize, color, qty: newQty }])
    }
    setNewColor('')
    setNewQty(1)
  }

  function removeVariant(idx: number) {
    setVariants(prev => prev.filter((_, i) => i !== idx))
  }

  function updateVariantQty(idx: number, qty: number) {
    setVariants(prev => prev.map((v, i) => i === idx ? { ...v, qty: Math.max(0, qty) } : v))
  }

  const totalStock = variants.reduce((s, v) => s + v.qty, 0)

  async function uploadFile(file: File) {
    setUploading(true); setUploadError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setImages(prev => [...prev, data.url])
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : 'فشل الرفع')
    } finally { setUploading(false) }
  }

  async function uploadFromUrl() {
    const url = urlInput.trim()
    if (!url) return
    if (images.includes(url)) { setUrlInput(''); return }
    if (url.includes('cdn.jsdelivr.net')) { setImages(prev => [...prev, url]); setUrlInput(''); return }
    setUploading(true); setUploadError('')
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Download failed')
      setImages(prev => [...prev, data.url]); setUrlInput('')
    } catch {
      setImages(prev => [...prev, url]); setUrlInput('')
    } finally { setUploading(false) }
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

      {/* Variants: size + color + qty */}
      <div>
        <label className="block text-sm font-medium text-gray-700 font-cairo mb-2">
          المتغيرات (مقاس + لون + كمية)
          {totalStock > 0 && <span className="text-xs text-gray-400 font-normal mr-2">إجمالي: {totalStock} قطعة</span>}
        </label>

        {/* Add variant row */}
        <div className="flex gap-2 mb-3 flex-wrap">
          <select value={newSize} onChange={(e) => setNewSize(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-cairo focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white">
            {SIZES.map(s => <option key={s} value={s}>مقاس {s}</option>)}
          </select>
          <input
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addVariant() } }}
            placeholder="اللون (مثلاً: أحمر)"
            className="flex-1 min-w-28 px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-cairo focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
          <input
            type="number" min="1" value={newQty}
            onChange={(e) => setNewQty(parseInt(e.target.value) || 1)}
            className="w-20 px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-center font-cairo focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
          <button type="button" onClick={addVariant} disabled={!newColor.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-cairo hover:bg-brand-700 disabled:opacity-40 transition-colors shrink-0">
            <Plus size={15} /> إضافة
          </button>
        </div>

        {/* Variants table */}
        {variants.length > 0 && (
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-2 text-right text-xs font-bold text-gray-600 font-cairo">المقاس</th>
                  <th className="px-3 py-2 text-right text-xs font-bold text-gray-600 font-cairo">اللون</th>
                  <th className="px-3 py-2 text-center text-xs font-bold text-gray-600 font-cairo">الكمية</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {variants.map((v, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-bold font-cairo text-gray-800">{v.size}</td>
                    <td className="px-3 py-2 font-cairo text-gray-700">{v.color}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number" min="0" value={v.qty}
                        onChange={(e) => updateVariantQty(idx, parseInt(e.target.value) || 0)}
                        className="w-full text-center py-1 border border-gray-200 rounded-lg text-sm font-bold font-cairo bg-white focus:outline-none focus:ring-1 focus:ring-brand-300"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <button type="button" onClick={() => removeVariant(idx)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {variants.length === 0 && (
          <p className="text-xs text-gray-400 font-cairo mt-1">أضف على الأقل متغيراً واحداً (مقاس + لون + كمية)</p>
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
                <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))}
                  className="absolute top-1 left-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={10} />
                </button>
                {i === 0 && (
                  <div className="absolute bottom-0 inset-x-0 bg-brand-600/80 text-white text-[9px] text-center py-0.5 font-cairo">رئيسية</div>
                )}
              </div>
            ))}
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = '' }} />
        <div className="flex flex-col sm:flex-row gap-2">
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-brand-300 rounded-xl text-sm font-cairo text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-50">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
            {uploading ? 'جاري الرفع...' : 'رفع من الجهاز أو الكاميرا'}
          </button>
          <div className="flex gap-2 flex-1">
            <input value={urlInput} onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); uploadFromUrl() } }}
              placeholder="الصق رابط صورة..."
              className="flex-1 min-w-0 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo" dir="rtl" />
            <button type="button" onClick={uploadFromUrl} disabled={uploading || !urlInput.trim()}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-cairo hover:bg-brand-700 disabled:opacity-40 transition-colors">
              <Plus size={16} /> إضافة
            </button>
          </div>
        </div>
        {uploadError && <p className="mt-2 text-xs text-red-500 font-cairo">{uploadError}</p>}
        <p className="mt-2 text-xs text-gray-400 font-cairo">يمكنك رفع الصور مباشرة من هاتفك أو لصق رابط. أول صورة تُضاف هي الصورة الرئيسية.</p>
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
