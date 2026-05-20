export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
  }).format(price)
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `ZH-${timestamp}-${random}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const CITIES = [
  'القاهرة',
  'الإسكندرية',
  'الجيزة',
  'الشرقية',
  'المنوفية',
  'الدقهلية',
  'الغربية',
  'القليوبية',
  'الإسماعيلية',
  'بورسعيد',
  'السويس',
  'دمياط',
  'كفر الشيخ',
  'البحيرة',
  'مرسى مطروح',
  'شمال سيناء',
  'جنوب سيناء',
  'البحر الأحمر',
  'الوادي الجديد',
  'أسوان',
  'قنا',
  'الأقصر',
  'سوهاج',
  'أسيوط',
  'المنيا',
  'بني سويف',
  'الفيوم',
]

export const SHIPPING_COST = 50
export const FREE_SHIPPING_THRESHOLD = 500
export const PAYMENT_PHONE = '01002001446'
export const BANK_ACCOUNT = '100047644822'
