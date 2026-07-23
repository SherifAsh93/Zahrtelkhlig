'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { Search, ShoppingCart, X, Plus, Minus, CheckCircle, Snowflake, Sun, Trash2, Printer, User, Tag } from 'lucide-react'
import { posLogout } from '@/app/actions/auth'

interface Variant { size: string; color: string; qty: number }

interface Product {
  id: string
  nameAr: string
  sku?: string
  season: 'WINTER' | 'SUMMER'
  price: number
  variants: Variant[] | null
  sizes: string[]
  sizeStock: Record<string, number> | null
  stock: number
  images: string[]
}

interface CartItem {
  productId: string
  nameAr: string
  price: number
  quantity: number
  size?: string
  color?: string
  image?: string
  key: string
}

const PAY_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: 'كاش',
  VODAFONE_CASH: 'فودافون كاش',
  INSTAPAY: 'إنستاباي',
  BANK_TRANSFER: 'تحويل بنكي',
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [season, setSeason] = useState<'ALL' | 'WINTER' | 'SUMMER'>('ALL')
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [variantPickerProduct, setVariantPickerProduct] = useState<Product | null>(null)
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState<{ orderNumber: string; items: CartItem[]; subtotal: number; discount: number; total: number; payment: string } | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_DELIVERY' | 'VODAFONE_CASH' | 'INSTAPAY' | 'BANK_TRANSFER'>('CASH_ON_DELIVERY')
  const [discount, setDiscount] = useState(0)
  const [discountInput, setDiscountInput] = useState('')
  const [notes, setNotes] = useState('')
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [staffName, setStaffName] = useState<string>('')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/pos/me').then(r => r.json()).then(d => {
      if (d.name) setStaffName(d.name)
    }).catch(() => {})
  }, [])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (season !== 'ALL') params.set('season', season)
    const res = await fetch(`/api/pos/products?${params}`)
    const data = await res.json()
    setProducts(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [search, season])

  useEffect(() => {
    const t = setTimeout(loadProducts, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [loadProducts, search])

  useEffect(() => {
    const interval = setInterval(loadProducts, 30_000)
    return () => clearInterval(interval)
  }, [loadProducts])

  function addVariantToCart(product: Product, variant: Variant) {
    const key = `${product.id}-${variant.size}-${variant.color}`
    const existing = cart.find(c => c.key === key)
    if (existing) {
      setCart(prev => prev.map(c => c.key === key ? { ...c, quantity: c.quantity + 1 } : c))
    } else {
      setCart(prev => [...prev, {
        productId: product.id, nameAr: product.nameAr, price: product.price, quantity: 1,
        size: variant.size, color: variant.color, image: product.images[0], key,
      }])
    }
    setVariantPickerProduct(null)
    setCartOpen(true)
  }

  function addToCartDirect(product: Product) {
    const key = `${product.id}-novariant`
    setCart(prev => {
      const ex = prev.find(c => c.key === key)
      if (ex) return prev.map(c => c.key === key ? { ...c, quantity: c.quantity + 1 } : c)
      return [...prev, { productId: product.id, nameAr: product.nameAr, price: product.price, quantity: 1, image: product.images[0], key }]
    })
    setCartOpen(true)
  }

  function handleProductClick(product: Product) {
    const variants = product.variants && product.variants.length > 0 ? product.variants : null
    if (variants) {
      setVariantPickerProduct(product)
    } else if (product.sizes.length > 0) {
      setVariantPickerProduct(product)
    } else {
      addToCartDirect(product)
    }
  }

  function removeFromCart(key: string) { setCart(prev => prev.filter(c => c.key !== key)) }
  function changeQty(key: string, delta: number) {
    setCart(prev => prev.map(c => c.key === key ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c).filter(c => c.quantity > 0))
  }

  const totalItems = cart.reduce((s, c) => s + c.quantity, 0)
  const subtotal = cart.reduce((s, c) => s + c.price * c.quantity, 0)
  const finalTotal = Math.max(0, subtotal - discount)

  function handleDiscountInput(val: string) {
    setDiscountInput(val)
    const num = parseFloat(val) || 0
    setDiscount(Math.min(num, subtotal))
  }

  function openCheckout() {
    setDiscount(0)
    setDiscountInput('')
    setCheckoutOpen(true)
  }

  function printReceipt(
    orderNumber: string,
    items: CartItem[],
    receiptSubtotal: number,
    receiptDiscount: number,
    receiptTotal: number,
    payment: string,
  ) {
    const w = window.open('', '_blank', 'width=400,height=800')
    if (!w) return
    const now = new Date()
    const dateStr = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
    const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })

    const fmt = (n: number) => new Intl.NumberFormat('ar-EG', {
      style: 'currency', currency: 'EGP', minimumFractionDigits: 0,
    }).format(n)

    w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head>
<meta charset="UTF-8">
<title>فاتورة ${orderNumber}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Cairo', Arial, sans-serif;
    direction: rtl;
    background: #fff;
    color: #000;
    width: 80mm;
    margin: 0 auto;
    padding: 5mm 4mm;
    font-size: 13px;
  }
  .store-name {
    text-align: center;
    font-size: 26px;
    font-weight: 900;
    letter-spacing: 5px;
    margin-bottom: 3px;
    margin-top: 4px;
  }
  .store-sub {
    text-align: center;
    font-size: 11px;
    color: #555;
    margin-bottom: 3px;
  }
  .store-phone {
    text-align: center;
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 6px;
  }
  .dash { border: none; border-top: 1px dashed #aaa; margin: 6px 0; }
  .solid { border: none; border-top: 2px solid #000; margin: 6px 0; }
  .meta-row {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #444;
    margin: 3px 0;
  }
  .order-num {
    text-align: center;
    font-size: 16px;
    font-weight: 900;
    margin: 5px 0;
    letter-spacing: 1px;
  }
  .section-label {
    font-size: 11px;
    font-weight: 700;
    color: #666;
    margin: 5px 0 4px;
  }
  .item-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 4px;
    margin: 4px 0 2px;
  }
  .item-name { flex: 1; font-size: 12px; font-weight: 700; line-height: 1.4; }
  .item-qty { font-size: 11px; color: #555; white-space: nowrap; margin: 0 6px; }
  .item-price { font-size: 12px; font-weight: 900; white-space: nowrap; }
  .item-meta { font-size: 10px; color: #777; margin-bottom: 5px; padding-right: 2px; }
  .sum-row {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    margin: 4px 0;
    color: #333;
  }
  .discount-row {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    margin: 4px 0;
    font-weight: 700;
  }
  .total-label { font-size: 20px; font-weight: 900; }
  .total-amount { font-size: 22px; font-weight: 900; }
  .total-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin: 6px 0;
  }
  .pay-row {
    text-align: center;
    font-size: 12px;
    color: #444;
    margin: 5px 0;
  }
  .footer {
    text-align: center;
    font-size: 11px;
    color: #555;
    margin-top: 6px;
    line-height: 1.8;
  }
  .footer strong { font-size: 13px; color: #000; font-weight: 900; }
  @media print {
    body { width: 80mm; }
    @page { size: 80mm auto; margin: 0; }
  }
</style>
</head><body>

<div class="store-name">زهرة الخليج</div>
<div class="store-sub">ملابس المحجبات</div>
<div class="store-phone">☎ 01002001446</div>

<hr class="dash"/>
<div class="meta-row">
  <span>التاريخ: ${dateStr}</span>
  <span>الوقت: ${timeStr}</span>
</div>
<div class="order-num">فاتورة رقم: ${orderNumber}</div>
<hr class="solid"/>

<div class="section-label">المنتجات المباعة</div>
<hr class="dash"/>

${items.map(i => `<div>
  <div class="item-row">
    <span class="item-name">${i.nameAr}</span>
    <span class="item-qty">${i.quantity}x</span>
    <span class="item-price">${fmt(i.price * i.quantity)}</span>
  </div>
  ${(i.size || i.color) ? `<div class="item-meta">${[i.size ? `مقاس: ${i.size}` : '', i.color ? `لون: ${i.color}` : ''].filter(Boolean).join(' | ')}</div>` : ''}
</div>`).join('')}

<hr class="dash"/>
<div class="sum-row"><span>المجموع الفرعي</span><span>${fmt(receiptSubtotal)}</span></div>
${receiptDiscount > 0 ? `<div class="discount-row"><span>خصم</span><span>- ${fmt(receiptDiscount)}</span></div>` : ''}
<div class="sum-row"><span>الشحن</span><span>مجاني</span></div>
<hr class="solid"/>

<div class="total-row">
  <span class="total-label">الإجمالي</span>
  <span class="total-amount">${fmt(receiptTotal)}</span>
</div>

<div class="pay-row">طريقة الدفع: ${PAY_LABELS[payment] || 'كاش'}</div>

<hr class="dash" style="margin-top:8px"/>
<div class="footer">
  <strong>شكراً لثقتكم في زهرة الخليج</strong><br/>
  نتمنى لكم تسوقاً ممتعاً<br/>
  facebook.com/zahrtelkhlig<br/>
  instagram.com/zahretelkhaleej.c
</div>

</body></html>`)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 600)
  }

  async function processSale() {
    if (cart.length === 0) return
    setProcessing(true)
    const res = await fetch('/api/pos/sale', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, paymentMethod, notes, discount }),
    })
    const data = await res.json()
    if (res.ok) {
      const saleItems = [...cart]
      const saleSubtotal = subtotal
      const saleDiscount = discount
      const saleTotal = data.total
      const salePayment = paymentMethod
      setSuccess({ orderNumber: data.orderNumber, items: saleItems, subtotal: saleSubtotal, discount: saleDiscount, total: saleTotal, payment: salePayment })
      setCart([])
      setCheckoutOpen(false)
      setNotes('')
      setDiscount(0)
      setDiscountInput('')
      loadProducts()
      printReceipt(data.orderNumber, saleItems, saleSubtotal, saleDiscount, saleTotal, salePayment)
    } else {
      alert(data.error || 'حدث خطأ')
    }
    setProcessing(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white" dir="rtl">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center">
            <ShoppingCart size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white font-cairo text-sm">نقطة البيع — زهرة الخليج</p>
            {staffName && (
              <p className="text-xs text-emerald-400 font-cairo flex items-center gap-1">
                <User size={10} />{staffName}
              </p>
            )}
          </div>
        </div>
        <form action={posLogout}>
          <button type="submit" className="px-3 py-1.5 text-xs font-cairo text-gray-400 hover:text-red-400 transition-colors border border-gray-700 rounded-lg">خروج</button>
        </form>
      </div>

      <div className="flex h-[calc(100vh-56px)]">
        {/* Products panel */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="p-3 bg-gray-800 border-b border-gray-700 space-y-2">
            <div className="relative">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input ref={searchRef} value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث بالاسم أو الكود..." autoFocus
                className="w-full pr-9 pl-4 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-sm font-cairo text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              {search && <button onClick={() => setSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"><X size={14} /></button>}
            </div>
            <div className="flex gap-2">
              {(['ALL', 'WINTER', 'SUMMER'] as const).map(s => (
                <button key={s} onClick={() => setSeason(s)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-cairo font-medium transition-colors ${
                    season === s ? s === 'WINTER' ? 'bg-blue-600 text-white' : s === 'SUMMER' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                    : 'bg-gray-700 text-gray-400 hover:text-white'}`}>
                  {s === 'WINTER' && <Snowflake size={12} />}
                  {s === 'SUMMER' && <Sun size={12} />}
                  {s === 'ALL' ? 'الكل' : s === 'WINTER' ? 'شتوي' : 'صيفي'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-gray-500 font-cairo"><Search size={40} className="mx-auto mb-3 text-gray-600" />لا توجد منتجات</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {products.map(product => {
                  const inCart = cart.filter(c => c.productId === product.id).reduce((s, c) => s + c.quantity, 0)
                  return (
                    <button key={product.id} onClick={() => handleProductClick(product)}
                      className="relative bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-emerald-500 transition-all text-right group active:scale-95">
                      <div className="relative aspect-[3/4] bg-gray-700">
                        {product.images[0]
                          ? <Image src={product.images[0]} alt={product.nameAr} fill className="object-cover" unoptimized />
                          : <div className="w-full h-full flex items-center justify-center text-gray-500"><ShoppingCart size={24} /></div>}
                        {inCart > 0 && (
                          <div className="absolute top-1.5 left-1.5 w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{inCart}</div>
                        )}
                        <div className="absolute top-1.5 right-1.5">
                          {product.season === 'WINTER'
                            ? <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center"><Snowflake size={10} className="text-white" /></div>
                            : <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center"><Sun size={10} className="text-white" /></div>}
                        </div>
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-cairo font-semibold text-white leading-tight line-clamp-2">{product.nameAr}</p>
                        {product.sku && <p className="text-[10px] font-mono text-gray-500 mt-0.5">{product.sku}</p>}
                        <p className="text-sm font-bold text-emerald-400 font-cairo mt-1">{formatPrice(product.price)}</p>
                        <p className="text-[10px] text-gray-500 font-cairo">{product.stock} متاح</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Cart panel */}
        <div className={`lg:flex flex-col bg-gray-800 border-r border-gray-700 w-full lg:w-80 xl:w-96 shrink-0 ${cartOpen ? 'fixed inset-0 z-50 flex' : 'hidden'} lg:relative lg:z-auto`}>
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="font-bold text-white font-cairo flex items-center gap-2">
              <ShoppingCart size={18} />الفاتورة
              {totalItems > 0 && <span className="bg-emerald-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{totalItems}</span>}
            </h2>
            <button onClick={() => setCartOpen(false)} className="lg:hidden p-1.5 text-gray-400 hover:text-white rounded-lg"><X size={18} /></button>
          </div>
          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-600 font-cairo text-sm">أضف منتجات للفاتورة</div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {cart.map(item => (
                  <div key={item.key} className="bg-gray-700 rounded-xl p-3 flex gap-3 items-center">
                    {item.image && (
                      <div className="relative w-10 h-12 rounded-lg overflow-hidden shrink-0">
                        <Image src={item.image} alt={item.nameAr} fill className="object-cover" unoptimized />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-cairo font-semibold text-white leading-tight">{item.nameAr}</p>
                      {(item.size || item.color) && (
                        <div className="flex gap-1 mt-0.5 flex-wrap">
                          {item.size && <span className="text-[10px] bg-gray-600 text-gray-300 px-1.5 py-0.5 rounded font-cairo">مقاس {item.size}</span>}
                          {item.color && <span className="text-[10px] bg-gray-600 text-gray-300 px-1.5 py-0.5 rounded font-cairo">{item.color}</span>}
                        </div>
                      )}
                      <p className="text-xs text-emerald-400 font-cairo mt-0.5">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => changeQty(item.key, -1)} className="w-6 h-6 bg-gray-600 hover:bg-gray-500 rounded-lg flex items-center justify-center text-white font-bold"><Minus size={12} /></button>
                      <span className="w-6 text-center text-sm font-bold text-white font-cairo">{item.quantity}</span>
                      <button onClick={() => changeQty(item.key, 1)} className="w-6 h-6 bg-gray-600 hover:bg-gray-500 rounded-lg flex items-center justify-center text-white font-bold"><Plus size={12} /></button>
                      <button onClick={() => removeFromCart(item.key)} className="w-6 h-6 text-gray-500 hover:text-red-400 flex items-center justify-center rounded-lg"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-700 space-y-3">
                <div className="flex justify-between text-white font-cairo">
                  <span className="text-gray-400 text-sm">{totalItems} قطعة</span>
                  <span className="font-bold text-lg">{formatPrice(subtotal)}</span>
                </div>
                <button onClick={openCheckout} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold font-cairo rounded-xl transition-colors text-sm">إتمام البيع</button>
                <button onClick={() => setCart([])} className="w-full py-2 text-gray-500 hover:text-red-400 font-cairo text-xs transition-colors">مسح الفاتورة</button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile cart button */}
      {!cartOpen && cart.length > 0 && (
        <button onClick={() => setCartOpen(true)}
          className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full shadow-2xl font-cairo font-bold">
          <ShoppingCart size={18} />الفاتورة ({totalItems}) <span className="font-bold">{formatPrice(subtotal)}</span>
        </button>
      )}

      {/* Variant picker modal */}
      {variantPickerProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-sm max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700 shrink-0">
              <div>
                <h3 className="font-bold text-white font-cairo">{variantPickerProduct.nameAr}</h3>
                <p className="text-sm text-emerald-400 font-bold font-cairo">{formatPrice(variantPickerProduct.price)}</p>
              </div>
              <button onClick={() => setVariantPickerProduct(null)} className="p-1.5 text-gray-400 hover:text-white rounded-lg"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto p-4 space-y-2">
              <p className="text-xs text-gray-400 font-cairo mb-3">اختر المقاس واللون:</p>
              {(() => {
                const variants = variantPickerProduct.variants && variantPickerProduct.variants.length > 0
                  ? variantPickerProduct.variants
                  : variantPickerProduct.sizes.map(s => ({ size: s, color: '', qty: variantPickerProduct.sizeStock?.[s] ?? 0 }))
                return variants.map((v, idx) => {
                  const cartQty = cart.filter(c => c.productId === variantPickerProduct.id && c.size === v.size && c.color === v.color).reduce((s, c) => s + c.quantity, 0)
                  const remaining = v.qty - cartQty
                  return (
                    <button key={idx} onClick={() => remaining > 0 && addVariantToCart(variantPickerProduct, v)} disabled={remaining <= 0}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${remaining > 0 ? 'border-gray-600 hover:border-emerald-500 hover:bg-emerald-900/20 active:scale-98' : 'border-gray-700 opacity-40 cursor-not-allowed'}`}>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white font-cairo">مقاس {v.size}</p>
                        {v.color && <p className="text-xs text-gray-400 font-cairo">{v.color}</p>}
                      </div>
                      <span className={`text-sm font-bold font-cairo ${remaining <= 0 ? 'text-red-500' : remaining < 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {remaining <= 0 ? 'نفد' : `${remaining} متاح`}
                      </span>
                    </button>
                  )
                })
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Checkout modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-5 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white font-cairo">إتمام البيع</h3>
              <button onClick={() => setCheckoutOpen(false)} className="p-1.5 text-gray-400 hover:text-white rounded-lg"><X size={18} /></button>
            </div>
            <div className="space-y-4">

              {/* Payment method */}
              <div>
                <label className="block text-xs text-gray-400 font-cairo mb-1.5">طريقة الدفع</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ val: 'CASH_ON_DELIVERY', label: '💵 كاش' }, { val: 'VODAFONE_CASH', label: '📱 فودافون' }, { val: 'INSTAPAY', label: '💳 إنستاباي' }, { val: 'BANK_TRANSFER', label: '🏦 تحويل' }].map(({ val, label }) => (
                    <button key={val} onClick={() => setPaymentMethod(val as typeof paymentMethod)}
                      className={`py-2.5 rounded-xl text-sm font-cairo transition-colors ${paymentMethod === val ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount */}
              <div>
                <label className="block text-xs text-gray-400 font-cairo mb-1.5 flex items-center gap-1">
                  <Tag size={11} />خصم (جنيه)
                </label>
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discountInput}
                  onChange={(e) => handleDiscountInput(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-sm font-cairo text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs text-gray-400 font-cairo mb-1.5">ملاحظات (اختياري)</label>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="أي ملاحظات..."
                  className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-xl text-sm font-cairo text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>

              {/* Totals summary */}
              <div className="bg-gray-700 rounded-xl p-3 space-y-2">
                <div className="flex justify-between text-sm font-cairo text-gray-300">
                  <span>المجموع</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm font-cairo text-amber-400 font-bold">
                    <span>خصم</span>
                    <span>- {formatPrice(discount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-600 pt-2 flex justify-between font-cairo">
                  <span className="text-gray-300 text-sm">الإجمالي</span>
                  <span className={`text-2xl font-bold ${discount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>

            <button onClick={processSale} disabled={processing}
              className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold font-cairo rounded-xl transition-colors disabled:opacity-50 text-sm">
              {processing ? 'جاري التسجيل...' : `تأكيد البيع — ${formatPrice(finalTotal)}`}
            </button>
          </div>
        </div>
      )}

      {/* Success screen */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-gray-800 rounded-2xl border border-emerald-600 p-8 w-full max-w-sm text-center">
            <CheckCircle size={56} className="text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white font-cairo mb-1">تم البيع بنجاح!</h2>
            <p className="text-gray-400 font-cairo text-sm mb-1">رقم الفاتورة:</p>
            <p className="text-2xl font-mono font-bold text-emerald-400 mb-1">{success.orderNumber}</p>
            <p className="text-xl font-bold text-white font-cairo mb-1">{formatPrice(success.total)}</p>
            {success.discount > 0 && (
              <p className="text-sm text-amber-400 font-cairo mb-2">خصم: {formatPrice(success.discount)}</p>
            )}
            <p className="text-xs text-gray-500 font-cairo mb-6">تم إرسال الفاتورة للطباعة تلقائياً</p>
            <div className="flex gap-3">
              <button onClick={() => printReceipt(success.orderNumber, success.items, success.subtotal, success.discount, success.total, success.payment)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-cairo text-sm transition-colors">
                <Printer size={16} />إعادة الطباعة
              </button>
              <button onClick={() => setSuccess(null)}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-cairo text-sm font-bold transition-colors">
                بيعة جديدة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
