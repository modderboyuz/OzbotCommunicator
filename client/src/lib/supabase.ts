import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Auth helper functions
export const authService = {
  async loginWithTelegram(telegramId: number) {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("telegram_id", telegramId).single()

      if (error) {
        console.error("Telegram login error:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Telegram login error:", error)
      return null
    }
  },

  async getCurrentUser() {
    const telegramId = localStorage.getItem("telegram_id")
    if (!telegramId) return null

    return await this.loginWithTelegram(Number(telegramId))
  },

  logout() {
    localStorage.removeItem("telegram_id")
  },
}

// Database helper functions
export const dbService = {
  // Users
  async createUser(userData: {
    telegram_id: string
    username?: string
    first_name?: string
    last_name?: string
    phone?: string
  }) {
    const { data, error } = await supabase.from("users").insert([userData]).select().single()

    if (error) throw error
    return data
  },

  async getUserByTelegramId(telegramId: string) {
    const { data, error } = await supabase.from("users").select("*").eq("telegram_id", telegramId).single()

    if (error && error.code !== "PGRST116") throw error
    return data
  },

  // Categories
  async getCategories() {
    const { data, error } = await supabase.from("categories").select("*").eq("is_active", true).order("name_uz")

    if (error) throw error
    return data
  },

  // Products
  async getProducts(categoryId?: string, searchQuery?: string) {
    let query = supabase
      .from("products")
      .select(`
        *,
        categories (
          id,
          name_uz,
          name_ru,
          icon
        )
      `)
      .eq("is_active", true)

    if (categoryId) {
      query = query.eq("category_id", categoryId)
    }

    if (searchQuery) {
      query = query.or(
        `name_uz.ilike.%${searchQuery}%,name_ru.ilike.%${searchQuery}%,description_uz.ilike.%${searchQuery}%`,
      )
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  async getProductById(id: string) {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories (
          id,
          name_uz,
          name_ru,
          icon
        )
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    return data
  },

  // Cart
  async getCartItems(userId: string) {
    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        *,
        products (
          id,
          name_uz,
          name_ru,
          price,
          unit,
          image_url,
          is_rental
        )
      `)
      .eq("user_id", userId)

    if (error) throw error
    return data
  },

  async addToCart(userId: string, productId: string, quantity: number) {
    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single()

    if (existingItem) {
      // Update quantity
      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Add new item
      const { data, error } = await supabase
        .from("cart_items")
        .insert([{ user_id: userId, product_id: productId, quantity }])
        .select()
        .single()

      if (error) throw error
      return data
    }
  },

  async updateCartItemQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeCartItem(itemId)
    }

    const { data, error } = await supabase.from("cart_items").update({ quantity }).eq("id", itemId).select().single()

    if (error) throw error
    return data
  },

  async removeCartItem(itemId: string) {
    const { error } = await supabase.from("cart_items").delete().eq("id", itemId)

    if (error) throw error
  },

  async clearCart(userId: string) {
    const { error } = await supabase.from("cart_items").delete().eq("user_id", userId)

    if (error) throw error
  },

  // Orders
  async createOrder(orderData: {
    user_id: string
    total_amount: number
    delivery_address?: string
    phone?: string
    notes?: string
  }) {
    const { data, error } = await supabase.from("orders").insert([orderData]).select().single()

    if (error) throw error
    return data
  },

  async getOrders(userId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name_uz,
            name_ru,
            image_url
          )
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  // Ads
  async getAds() {
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  // Workers
  async getWorkers(search?: string) {
    let query = supabase.from("users").select("*").eq("role", "worker")

    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,telegram_username.ilike.%${search}%`)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    // Add ratings for each worker
    const workersWithRatings = await Promise.all(
      data.map(async (worker) => {
        const { data: reviews } = await supabase.from("worker_reviews").select("rating").eq("worker_id", worker.id)

        const avgRating =
          reviews && reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

        return {
          ...worker,
          average_rating: avgRating,
          review_count: reviews ? reviews.length : 0,
        }
      }),
    )

    return workersWithRatings
  },

  // Worker Applications
  async getWorkerApplications(workerId: string) {
    const { data, error } = await supabase
      .from("worker_applications")
      .select("*")
      .eq("worker_id", workerId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data
  },

  async createWorkerApplication(applicationData: any) {
    const { data, error } = await supabase.from("worker_applications").insert(applicationData).select().single()

    if (error) throw error
    return data
  },

  async updateWorkerApplication(id: string, updates: any) {
    const { data, error } = await supabase.from("worker_applications").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  },

  // User profile
  async updateUserProfile(userId: string, profileData: any) {
    const { data, error } = await supabase.from("users").update(profileData).eq("id", userId).select().single()

    if (error) throw error
    return data
  },
}
