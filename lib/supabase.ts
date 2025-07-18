import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client
export const createServerSupabaseClient = () => {
  const cookieStore = cookies()

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: {
        getItem: (key: string) => {
          return cookieStore.get(key)?.value
        },
        setItem: (key: string, value: string) => {
          cookieStore.set(key, value)
        },
        removeItem: (key: string) => {
          cookieStore.delete(key)
        },
      },
    },
  })
}

// Types
export interface User {
  id: string
  telegram_id?: number
  username?: string
  first_name: string
  last_name?: string
  phone?: string
  role: "client" | "worker" | "admin"
  is_active: boolean
  profile_image?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name_uz: string
  name_ru: string
  description_uz?: string
  description_ru?: string
  icon_name?: string
  color?: string
  parent_id?: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name_uz: string
  name_ru: string
  description_uz?: string
  description_ru?: string
  price: number
  image_url?: string
  category_id: string
  unit: string
  is_available: boolean
  type: "sale" | "rent"
  stock_quantity: number
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  created_at: string
  updated_at: string
  product?: Product
}

export interface Order {
  id: string
  user_id: string
  total_amount: number
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  delivery_address?: string
  phone?: string
  customer_name?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  product_name: string
  created_at: string
  product?: Product
}

export interface WorkerApplication {
  id: string
  worker_id: string
  client_id: string
  title: string
  description: string
  location?: string
  budget?: number
  status: "pending" | "accepted" | "rejected" | "completed"
  urgency: "low" | "medium" | "high"
  contact_phone?: string
  preferred_date?: string
  notes?: string
  created_at: string
  updated_at: string
  worker?: User
  client?: User
}
