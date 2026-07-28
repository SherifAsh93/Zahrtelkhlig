'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { X, Search, Check, Loader2, Upload, Images, FolderOpen, AlertCircle } from 'lucide-react'

async function compressImage(file: File): Promise<File> {
  if (file.size < 1024 * 1024) return file
  return new Promise((resolve) => {
    const img = new window.Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const MAX = 1600
      let w = img.naturalWidth, h = img.naturalHeight
      if (w > MAX || h > MAX) {
        if (w >= h) { h = Math.round(h * MAX / w); w = MAX }
        else { w = Math.round(w * MAX / h); h = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(file); return }
      ctx.drawImage(img, 0, 0, w, h)
      canvas.toBlob(blob => {
        if (!blob) { resolve(file); return }
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
      }, 'image/jpeg', 0.85)
    }
    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file) }
    img.src = objectUrl
  })
}

interface MediaFile {
  name: string
  path: string
  size: number
  url: string
  folder: string
}

interface Props {
  onSelect: (urls: string[]) => void
  onClose: () => void
  alreadySelected?: string[]
}

const FOLDERS = [
  { key: 'all', label: 'الكل' },
  { key: 'products', label: 'المنتجات' },
  { key: 'banners', label: 'البانرات' },
  { key: 'categories', label: 'الأقسام' },
]

export default function MediaPickerModal({ onSelect, onClose, alreadySelected = [] }: Props) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [folder, setFolder] = useState('products')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/media')
      const data = await res.json()
      if (res.ok) setFiles(data.files)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const displayed = files
    .filter(f => folder === 'all' || f.folder === folder)
    .filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()))

  function toggleImage(url: string) {
    if (alreadySelected.includes(url)) return
    setSelected(prev =>
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    )
  }

  async function uploadFiles(fileList: File[]) {
    setUploading(true)
    setUploadError('')
    try {
      for (const file of fileList) {
        const compressed = await compressImage(file)
        const targetFolder = folder === 'all' ? 'products' : folder
        const fd = new FormData()
        fd.append('file', compressed)
        fd.append('folder', targetFolder)
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (res.ok) {
          const newFile: MediaFile = {
            name: data.filename,
            path: `public/images/${targetFolder}/${data.filename}`,
            size: compressed.size,
            url: data.url,
            folder: targetFolder,
          }
          setFiles(prev => [newFile, ...prev])
          setSelected(prev => [...prev, data.url])
        } else {
          setUploadError(data.error || 'فشل رفع الصورة')
        }
      }
    } catch {
      setUploadError('حدث خطأ أثناء الرفع، يرجى المحاولة مرة أخرى')
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length) uploadFiles(files)
  }

  function confirm() {
    if (selected.length) { onSelect(selected); onClose() }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Images size={20} className="text-brand-600" />
            <h2 className="text-base font-bold text-gray-900 font-cairo">اختر صور من المكتبة</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Controls */}
        <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap gap-2">
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {FOLDERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFolder(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-cairo font-medium transition-colors ${
                  folder === f.key ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex-1 min-w-[160px] relative">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث..."
              className="w-full pr-8 pl-3 py-2 border border-gray-200 rounded-xl text-sm font-cairo focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 text-white rounded-xl text-xs font-cairo font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            رفع جديد
          </button>
        </div>

        {/* Drop area */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`mx-5 mt-3 rounded-xl border-2 border-dashed py-2.5 flex items-center justify-center gap-2 transition-all ${
            dragOver ? 'border-brand-400 bg-brand-50' : 'border-gray-200'
          }`}
        >
          <FolderOpen size={15} className="text-gray-300" />
          <p className="text-xs text-gray-400 font-cairo">
            {dragOver ? 'اترك الصور هنا' : 'أو اسحب الصور هنا للرفع مباشرة'}
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => {
            const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'))
            if (files.length) uploadFiles(files)
            e.target.value = ''
          }}
        />

        {uploadError && (
          <div className="mx-5 mt-2 flex items-center gap-2 bg-red-50 text-red-600 text-xs font-cairo px-3 py-2 rounded-xl border border-red-100">
            <AlertCircle size={14} className="shrink-0" />
            {uploadError}
            <button onClick={() => setUploadError('')} className="mr-auto text-red-400 hover:text-red-600"><X size={12} /></button>
          </div>
        )}

        {/* Tip */}
        {!loading && displayed.length > 0 && (
          <p className="text-center text-xs text-gray-400 font-cairo pt-2">
            اضغط على الصورة لاختيارها · يمكن اختيار أكثر من صورة
          </p>
        )}

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Images size={36} className="text-gray-200" />
              <p className="text-sm text-gray-400 font-cairo">لا توجد صور</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
              {displayed.map(file => {
                const isAlready = alreadySelected.includes(file.url)
                const selIdx = selected.indexOf(file.url)
                const isSelected = selIdx !== -1

                return (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => toggleImage(file.url)}
                    disabled={isAlready}
                    title={isAlready ? 'مضافة بالفعل' : undefined}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                      isAlready
                        ? 'border-gray-200 opacity-40 cursor-not-allowed'
                        : isSelected
                          ? 'border-brand-500 ring-2 ring-brand-300'
                          : 'border-transparent hover:border-brand-300'
                    }`}
                  >
                    <Image src={file.url} alt={file.name} fill className="object-cover" unoptimized sizes="120px" />

                    {/* Selected overlay with order number */}
                    {isSelected && (
                      <div className="absolute inset-0 bg-brand-600/20 flex items-start justify-end p-1.5">
                        <div className="w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center shadow text-white text-[11px] font-bold">
                          {selIdx + 1}
                        </div>
                      </div>
                    )}

                    {/* Already-added badge */}
                    {isAlready && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-7 h-7 bg-gray-600 rounded-full flex items-center justify-center shadow">
                          <Check size={14} className="text-white" strokeWidth={3} />
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {selected.length > 0 ? (
              <>
                {/* Preview strip of selected */}
                <div className="flex -space-x-1 rtl:space-x-reverse">
                  {selected.slice(0, 5).map(url => (
                    <div key={url} className="w-8 h-8 rounded-lg overflow-hidden border-2 border-white bg-gray-100 shrink-0">
                      <Image src={url} alt="" width={32} height={32} className="w-full h-full object-cover" unoptimized />
                    </div>
                  ))}
                  {selected.length > 5 && (
                    <div className="w-8 h-8 rounded-lg border-2 border-white bg-gray-200 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-gray-600">+{selected.length - 5}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-600 font-cairo font-semibold">
                  تم اختيار {selected.length} {selected.length === 1 ? 'صورة' : 'صور'}
                </p>
              </>
            ) : (
              <p className="text-xs text-gray-400 font-cairo">{displayed.length} صورة متاحة</p>
            )}
          </div>

          <div className="flex gap-2 shrink-0">
            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => setSelected([])}
                className="px-3 py-2.5 text-gray-500 text-sm font-cairo hover:text-gray-700 transition-colors"
              >
                إلغاء الاختيار
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-cairo hover:bg-gray-50 transition-colors"
            >
              إغلاق
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={selected.length === 0}
              className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-cairo font-semibold hover:bg-brand-700 transition-colors disabled:opacity-40"
            >
              إضافة {selected.length > 0 ? `${selected.length} ` : ''}
              {selected.length === 1 ? 'صورة' : selected.length > 1 ? 'صور' : 'الصور'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
