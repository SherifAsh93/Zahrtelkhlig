'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  nameAr: string
  price: number
  stock: number
  active: boolean
  featured: boolean
  images: string[]
  category: { nameAr: string }
  createdAt: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/admin/products?page=${page}&limit=15`)
    const data = await res.json()
    setProducts(data.products)
    setTotal(data.total)
    setLoading(false)
  }

  useEffect(() => { load() }, [page])

  async function deleteProduct(id: string) {
    if (!confirm('هل أنت متأكدة من حذف هذا المنتج؟')) return
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    load()
  }

  const filtered = search
    ? products.filter((p) => p.nameAr.includes(search))
    : products

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-cairo">المنتجات</h1>
          <p className="text-gray-500 text-sm font-cairo mt-1">{total} منتج إجمالاً</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus size={16} />
            إضافة منتج
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-xs">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث..."
          className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 font-cairo"
        />
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-brand-600 border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 font-cairo">
            <Package size={48} className="mx-auto mb-3 text-gray-200" />
            لا توجد منتجات
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['المنتج', 'القسم', 'السعر', 'المخزون', 'الحالة', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-right text-xs font-bold text-gray-600 font-cairo">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {product.images[0] ? (
                            <Image src={product.images[0]} alt={product.nameAr} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Package size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 font-cairo">{product.nameAr}</p>
                          {product.featured && <Badge variant="warning" className="mt-0.5">مميز</Badge>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-cairo">{product.category.nameAr}</td>
                    <td className="px-4 py-3 text-sm font-bold text-brand-600 font-cairo">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={product.stock > 0 ? 'success' : 'danger'}>{product.stock}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={product.active ? 'success' : 'default'}>{product.active ? 'نشط' : 'مخفي'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link href={`/admin/products/${product.id}/edit`} className="p-1.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                          <Edit size={15} />
                        </Link>
                        <button onClick={() => deleteProduct(product.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
