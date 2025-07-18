import { createClient } from '@supabase/supabase-js';
import type { 
  User, 
  Category, 
  Product, 
  Order, 
  OrderItem, 
  Ad,
  InsertUser,
  InsertCategory,
  InsertProduct,
  InsertOrder,
  InsertOrderItem,
  InsertAd
} from "@shared/supabase-types";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://hliixatnpxjkhkyoswcw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsaWl4YXRucHhqa2hreW9zd2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3MzAwOTYsImV4cCI6MjA2ODMwNjA5Nn0.cdtvakmd5huipmZ5vOkDOzcCkI1uUy8P83QHfJNg1y4';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | null>;
  getUserByTelegramId(telegramId: number | undefined): Promise<User | null>;
  getUserByPhone(phone: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  
  // Products
  getProducts(categoryId?: string, search?: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  // Orders
  getOrders(userId?: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order>;
  
  // Order Items
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Ads
  getActiveAds(): Promise<Ad[]>;
  getAds(): Promise<Ad[]>;
  createAd(ad: InsertAd): Promise<Ad>;
  updateAd(id: string, ad: Partial<InsertAd>): Promise<Ad>;
  deleteAd(id: string): Promise<void>;
}

export class SupabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    
    return data;
  }

  async getUserByTelegramId(telegramId: number | undefined): Promise<User | null> {
    if (!telegramId) return null;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_id', telegramId)
      .single();
    
    if (error) {
      console.error('Error fetching user by telegram ID:', error);
      return null;
    }
    
    return data;
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();
    
    if (error) {
      console.error('Error fetching user by phone:', error);
      return null;
    }
    
    return data;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
    
    return data;
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(user)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
    
    return data;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('order_index');
    
    if (error) {
      throw new Error(`Error fetching categories: ${error.message}`);
    }
    
    return data || [];
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creating category: ${error.message}`);
    }
    
    return data;
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error updating category: ${error.message}`);
    }
    
    return data;
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(`Error deleting category: ${error.message}`);
    }
  }

  // Products
  async getProducts(categoryId?: string, search?: string): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select('*')
      .eq('is_available', true);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (search) {
      query = query.or(`name_uz.ilike.%${search}%,description_uz.ilike.%${search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching products: ${error.message}`);
    }
    
    return data || [];
  }

  async getProduct(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }
    
    return data;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }
    
    return data;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error updating product: ${error.message}`);
    }
    
    return data;
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(`Error deleting product: ${error.message}`);
    }
  }

  // Orders
  async getOrders(userId?: string): Promise<Order[]> {
    let query = supabase
      .from('orders')
      .select('*');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching orders: ${error.message}`);
    }
    
    return data || [];
  }

  async getOrder(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching order:', error);
      return null;
    }
    
    return data;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creating order: ${error.message}`);
    }
    
    return data;
  }

  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update(order)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error updating order: ${error.message}`);
    }
    
    return data;
  }

  // Order Items
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    
    if (error) {
      throw new Error(`Error fetching order items: ${error.message}`);
    }
    
    return data || [];
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const { data, error } = await supabase
      .from('order_items')
      .insert([orderItem])
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creating order item: ${error.message}`);
    }
    
    return data;
  }

  // Ads
  async getActiveAds(): Promise<Ad[]> {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching active ads: ${error.message}`);
    }
    
    return data || [];
  }

  async getAds(): Promise<Ad[]> {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Error fetching ads: ${error.message}`);
    }
    
    return data || [];
  }

  async createAd(ad: InsertAd): Promise<Ad> {
    const { data, error } = await supabase
      .from('ads')
      .insert([ad])
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error creating ad: ${error.message}`);
    }
    
    return data;
  }

  async updateAd(id: string, ad: Partial<InsertAd>): Promise<Ad> {
    const { data, error } = await supabase
      .from('ads')
      .update(ad)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Error updating ad: ${error.message}`);
    }
    
    return data;
  }

  async deleteAd(id: string): Promise<void> {
    const { error } = await supabase
      .from('ads')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(`Error deleting ad: ${error.message}`);
    }
  }
}

export const storage = new SupabaseStorage();
