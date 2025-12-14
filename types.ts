
export interface Product {
  id: number;
  nameEn: string;
  nameAr: string;
  price: number;
  category: string;
  image: string; // Main thumbnail
  images: string[]; // Gallery images
  descriptionEn: string;
  descriptionAr: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: number;
  created_at: string;
  
  // Fields matching your provided schema
  total_amount: number;
  status: string; // 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
  shipping_address: string;
  payment_method: string;
  
  // Link to Auth User
  user_id?: string | null;

  // Contact info snapshot (incase they change profile later)
  customer_name?: string;
  phone?: string;
  items?: CartItem[]; 

  // UI helpers
  city?: string; 
}

export interface Client {
  id: number;
  name: string;
  phone: string;
  address: string;
}

export interface UserProfile {
  id: string; // Matches auth.users id
  email: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
}

export type Language = 'en' | 'ar';
export type Theme = 'light' | 'dark';

export interface FilterState {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
}

export interface CheckoutForm {
  fullName: string;
  phone: string;
  address: string;
  city: string;
}
