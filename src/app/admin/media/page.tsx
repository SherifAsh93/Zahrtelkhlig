'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import {
  Images, Upload, Search, Copy, Trash2, Check, Loader2,
  FolderOpen, X, ImageIcon, RefreshCw,
} from 'lucide-react'

interface MediaFile {
  name: string
  path: string
  sha: string
  size: number
  url: string
  folder: string
}

const FOLDERS = [
  { key: 'all', label: 'الكل' },
  { key: 'products', label: 'المنتجات' },
  { key: 'banners', label: 'البانرات' },
  { key: 'categories', label: 'الأقسام' },
]

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [folder, setFolder] = useState('all')
  const [search, setSearch] = useState('')
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadTotal, setUploadTotal] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/media')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFiles(data.files)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'فشل تحميل الصور')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const displayed = files
    .filter(f => folder === 'all' || f.folder === folder)
    .filter(f => !search || f.name.toLowerCase().includes(search.toLowerCase()))

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  async function deleteFile(file: MediaFile) {
    if (!confirm(`حذف "${file.name}"؟`)) return
    setDeleting(file.path)
    try {
      const res = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: file.path, sha: file.sha }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setFiles(prev => prev.filter(f => f.path !== file.path))
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'فشل الحذف')
    } finally {
      setDeleting(null)
    }
  }

  async function uploadFiles(fileList: File[]) {
    const targetFolder = folder === 'all' ? 'products' : folder
    setUploading(true)
    setUploadProgress(0)
    setUploadTotal(fileList.length)
    let done = 0
    for (const file of fileList) {
      try {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('folder', targetFolder)
        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (res.ok) {
          setFiles(prev => [{
            name: data.filename,
            path: `public/images/${targetFolder}/${data.filename}`,
            sha: '',
            size: file.size,
            url: data.url,
            folder: targetFolder,
          }, ...prev])
        }
      } catch { /* skip failed */ }
      done++
      setUploadProgress(done)
    }
    setUploading(false)
    setUploadProgress(0)
    setUploadTotal(0)
    load()
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    if (files.length) uploadFiles(files)
  }

  const totalSize = displayed.reduce((s, f) => s + f.size, 0)

  return (
    <div dir="rtl" className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
            <Images size={20} className="text-brand-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-cairo">مكتبة الصور</h1>
            {!loading && (
              <p className="text-xs text-gray-400 font-cairo">{displayed.length} صورة · {formatSize(totalSize)}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-cairo font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {uploadProgress}/{uploadTotal}
              </>
            ) : (
              <>
                <Upload size={16} />
                رفع صور
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Folder tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {FOLDERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFolder(f.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-cairo font-medium transition-colors ${
                folder === f.key
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[180px] relative">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث باسم الملف..."
            className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm font-cairo focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 text-sm font-cairo px-4 py-3 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl py-5 flex flex-col items-center gap-2 cursor-pointer transition-all ${
          dragOver
            ? 'border-brand-400 bg-brand-50'
            : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
        }`}
      >
        <FolderOpen size={28} className={dragOver ? 'text-brand-500' : 'text-gray-300'} />
        <p className="text-sm font-cairo text-gray-500">
          {dragOver ? 'اتركي الصور هنا' : 'اسحبي وأفلتي صور هنا أو اضغطي للاختيار'}
        </p>
        {folder !== 'all' && (
          <p className="text-xs font-cairo text-gray-400">سيتم الرفع إلى مجلد: {folder}</p>
        )}
      </div>

      {/* Hidden file input */}
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

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && displayed.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <ImageIcon size={48} className="text-gray-200" />
          <p className="text-gray-400 font-cairo">لا توجد صور</p>
        </div>
      )}

      {/* Image grid */}
      {!loading && displayed.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
          {displayed.map(file => (
            <div
              key={file.path}
              className="group relative rounded-xl overflow-hidden bg-gray-100 aspect-square border border-gray-200 hover:border-brand-300 transition-colors"
            >
              <Image
                src={file.url}
                alt={file.name}
                fill
                className="object-cover"
                unoptimized
                sizes="150px"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                {/* Copy URL */}
                <button
                  onClick={() => copyUrl(file.url)}
                  title="نسخ رابط CDN"
                  className="flex items-center gap-1 px-3 py-1.5 bg-white text-gray-800 rounded-lg text-xs font-cairo font-semibold shadow hover:bg-brand-50 transition-colors"
                >
                  {copiedUrl === file.url ? (
                    <><Check size={12} className="text-green-600" /> تم النسخ</>
                  ) : (
                    <><Copy size={12} /> نسخ الرابط</>
                  )}
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteFile(file)}
                  disabled={deleting === file.path}
                  title="حذف"
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-cairo font-semibold shadow hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deleting === file.path ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Trash2 size={12} />
                  )}
                  حذف
                </button>
              </div>

              {/* Folder badge */}
              {folder === 'all' && (
                <div className="absolute top-1 right-1 bg-black/60 text-white text-[9px] font-cairo px-1.5 py-0.5 rounded-md">
                  {file.folder}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats footer */}
      {!loading && displayed.length > 0 && (
        <div className="text-center pt-2">
          <p className="text-xs text-gray-400 font-cairo">
            {displayed.length} صورة · {formatSize(totalSize)} إجمالي
          </p>
        </div>
      )}
    </div>
  )
}
