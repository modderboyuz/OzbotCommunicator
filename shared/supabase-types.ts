export interface User {
  id: string;
  phone: string;
  first_name: string;
  last_name: string;
  telegram_username?: string;
  telegram_id?: number;
  role: 'client' | 'worker' | 'admin';
  type: 'telegram' | 'google';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name_uz: string;
  name_ru?: string;
  icon?: string;
  order_index?: number;
  is_active?: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name_uz: string;
  name_ru?: string;
  description_uz?: string;
  description_ru?: string;
  price: number;
  category_id?: string;
  image_url?: string;
  is_available?: boolean;
  is_rental?: boolean;
  unit?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id?: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  delivery_address?: string;
  delivery_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id?: string;
  product_id?: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  created_at: string;
}

export interface Ad {
  id: string;
  title_uz: string;
  title_ru?: string;
  description_uz?: string;
  description_ru?: string;
  image_url?: string;
  link_url?: string;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

// Insert types (without id and timestamps)
export type InsertUser = Omit<User, 'id' | 'created_at' | 'updated_at'>;
export type InsertCategory = Omit<Category, 'id' | 'created_at'>;
export type InsertProduct = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
export type InsertOrder = Omit<Order, 'id' | 'created_at' | 'updated_at'>;
export type InsertOrderItem = Omit<OrderItem, 'id' | 'created_at'>;
export type InsertAd = Omit<Ad, 'id' | 'created_at'>;
