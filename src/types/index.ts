export type Language = 'ar' | 'en'

export interface CartItem {
  id: string
  productId: string
  nameAr: string
  nameEn: string
  price: number
  image: string
  quantity: number
  stock: number
}

export interface WishlistItem {
  id: string
  productId: string
  nameAr: string
  nameEn: string
  price: number
  image: string
}

export interface ProductWithCategory {
  id: string
  nameAr: string
  nameEn: string
  descriptionAr: string
  descriptionEn: string
  price: number
  comparePrice: number | null
  stock: number
  images: string[]
  featured: boolean
  active: boolean
  categoryId: string
  createdAt: Date
  updatedAt: Date
  category: {
    id: string
    nameAr: string
    nameEn: string
    slug: string
  }
}

export interface SessionUser {
  userId: string
  email: string
  role: string
  name: string
}
