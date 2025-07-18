import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const authService = {
  async loginWithTelegram(telegramId: number) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

      if (error) {
        console.error('Telegram login error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Telegram login error:', error);
      return null;
    }
  },

  async getCurrentUser() {
    const telegramId = localStorage.getItem('telegram_id');
    if (!telegramId) return null;

    return await this.loginWithTelegram(Number(telegramId));
  },

  logout() {
    localStorage.removeItem('telegram_id');
  },
};

// Database helper functions
export const dbService = {
  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('order_index');

    if (error) throw error;
    return data;
  },

  // Products
  async getProducts(categoryId?: string, search?: string) {
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

    if (error) throw error;
    return data;
  },

  // Cart
  async getCartItems(userId: string) {
    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async addToCart(userId: string, productId: string, quantity: number) {
    // Check if item already exists
    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      // Update existing item
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Create new item
      const { data, error } = await supabase
        .from('cart_items')
        .insert({ user_id: userId, product_id: productId, quantity })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  async updateCartItem(userId: string, productId: string, quantity: number) {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', userId)
      .eq('product_id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeFromCart(userId: string, productId: string) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
  },

  async clearCart(userId: string) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Orders
  async getOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createOrder(orderData: any, items: any[]) {
    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        ...orderData,
        total_amount: total
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_per_unit: item.price_per_unit,
      total_price: item.quantity * item.price_per_unit
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return order;
  },

  // Ads
  async getAds() {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Workers
  async getWorkers(search?: string) {
    let query = supabase
      .from('users')
      .select('*')
      .eq('role', 'worker');

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,telegram_username.ilike.%${search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Add ratings for each worker
    const workersWithRatings = await Promise.all(
      data.map(async (worker) => {
        const { data: reviews } = await supabase
          .from('worker_reviews')
          .select('rating')
          .eq('worker_id', worker.id);

        const avgRating = reviews && reviews.length > 0 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
          : 0;

        return {
          ...worker,
          average_rating: avgRating,
          review_count: reviews ? reviews.length : 0
        };
      })
    );

    return workersWithRatings;
  },

  // Worker Applications
  async getWorkerApplications(workerId: string) {
    const { data, error } = await supabase
      .from('worker_applications')
      .select('*')
      .eq('worker_id', workerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createWorkerApplication(applicationData: any) {
    const { data, error } = await supabase
      .from('worker_applications')
      .insert(applicationData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateWorkerApplication(id: string, updates: any) {
    const { data, error } = await supabase
      .from('worker_applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // User profile
  async updateUserProfile(userId: string, profileData: any) {
    const { data, error } = await supabase
      .from('users')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export type { Database } from './database.types';
