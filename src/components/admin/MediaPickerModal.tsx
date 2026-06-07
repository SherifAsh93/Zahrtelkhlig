'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { X, Search, Check, Loader2, Upload, Images, FolderOpen } from 'lucide-react'

interface MediaFile {
  name: string
  path: string
  sha: string
  size: number
  url: string
  folder: string
}

interface Props {
  onSelect: (url: string) => void
  onClose: () => void
}

const FOLDERS = [
  { key: 'all', label: 'الكل' },
  { key: 'products', label: 'المنتجات' },
  { key: 'banners', label: 'البانرات' },
  { key: 'categories', label: 'الأقسام' },
]

export default function MediaPickerModal({ onSelect, onClose }: Props) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [folder, setFolder] = useState('products')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
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

  async function uploadFiles(fileList: File[]) {
    setUploading(true)
    try {
      for (const file of fileList) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('folder', folder === 'all' ? 'products' : folder)
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (res.ok) {
          setFiles(prev => [{
            name: data.filename,
            path: `public/images/${folder === 'all' ? 'products' : folder}/${data.filename}`,
            sha: '',
            size: file.size,
            url: data.url,
            folder: folder === 'all' ? 'products' : folder,
          }, ...prev])
          setSelected(data.url)
        }
      }
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
    if (selected) { onSelect(selected); onClose() }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Images size={20} className="text-brand-600" />
            <h2 className="text-base font-bold text-gray-900 font-cairo">اختر صورة من المكتبة</h2>
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
          className={`mx-5 mt-3 rounded-xl border-2 border-dashed py-3 flex items-center justify-center gap-2 transition-all ${
            dragOver ? 'border-brand-400 bg-brand-50' : 'border-gray-200'
          }`}
        >
          <FolderOpen size={16} className="text-gray-300" />
          <p className="text-xs text-gray-400 font-cairo">
            {dragOver ? 'اتركي الصور هنا' : 'أو اسحبي صور هنا للرفع مباشرة'}
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
              {displayed.map(file => (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setSelected(file.url === selected ? null : file.url)}
                  className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                    selected === file.url
                      ? 'border-brand-500 ring-2 ring-brand-300'
                      : 'border-transparent hover:border-brand-300'
                  }`}
                >
                  <Image src={file.url} alt={file.name} fill className="object-cover" unoptimized sizes="120px" />
                  {selected === file.url && (
                    <div className="absolute inset-0 bg-brand-600/20 flex items-center justify-center">
                      <div className="w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center shadow">
                        <Check size={14} className="text-white" strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          {selected ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                <Image src={selected} alt="selected" width={36} height={36} className="w-full h-full object-cover" unoptimized />
              </div>
              <p className="text-xs text-gray-500 font-cairo truncate">تم الاختيار</p>
            </div>
          ) : (
            <p className="text-xs text-gray-400 font-cairo">{displayed.length} صورة</p>
          )}
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-cairo hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={!selected}
              className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-cairo font-semibold hover:bg-brand-700 transition-colors disabled:opacity-40"
            >
              اختر هذه الصورة
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
