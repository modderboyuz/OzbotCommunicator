export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          telegram_id: string
          username: string | null
          first_name: string | null
          last_name: string | null
          phone: string | null
          is_admin: boolean
          is_worker: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          telegram_id: string
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          is_admin?: boolean
          is_worker?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          telegram_id?: string
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          is_admin?: boolean
          is_worker?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name_uz: string
          name_ru: string
          icon: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name_uz: string
          name_ru: string
          icon: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name_uz?: string
          name_ru?: string
          icon?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          category_id: string
          name_uz: string
          name_ru: string
          description_uz: string | null
          description_ru: string | null
          price: number
          unit: string
          image_url: string | null
          is_rental: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          name_uz: string
          name_ru: string
          description_uz?: string | null
          description_ru?: string | null
          price: number
          unit: string
          image_url?: string | null
          is_rental?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          name_uz?: string
          name_ru?: string
          description_uz?: string | null
          description_ru?: string | null
          price?: number
          unit?: string
          image_url?: string | null
          is_rental?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: string
          total_amount: number
          delivery_address: string | null
          phone: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          total_amount: number
          delivery_address?: string | null
          phone?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          total_amount?: number
          delivery_address?: string | null
          phone?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
          created_at?: string
        }
      }
      ads: {
        Row: {
          id: string
          title_uz: string
          title_ru: string
          description_uz: string | null
          description_ru: string | null
          image_url: string | null
          link_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title_uz: string
          title_ru: string
          description_uz?: string | null
          description_ru?: string | null
          image_url?: string | null
          link_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title_uz?: string
          title_ru?: string
          description_uz?: string | null
          description_ru?: string | null
          image_url?: string | null
          link_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      telegram_login_attempts: {
        Row: {
          id: string
          telegram_id: string
          token: string
          expires_at: string
          is_used: boolean
          created_at: string
        }
        Insert: {
          id?: string
          telegram_id: string
          token: string
          expires_at: string
          is_used?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          telegram_id?: string
          token?: string
          expires_at?: string
          is_used?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type aliases for easier use
export type User = Database["public"]["Tables"]["users"]["Row"]
export type Category = Database["public"]["Tables"]["categories"]["Row"]
export type Product = Database["public"]["Tables"]["products"]["Row"]
export type CartItem = Database["public"]["Tables"]["cart_items"]["Row"]
export type Order = Database["public"]["Tables"]["orders"]["Row"]
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"]
export type Ad = Database["public"]["Tables"]["ads"]["Row"]
export type TelegramLoginAttempt = Database["public"]["Tables"]["telegram_login_attempts"]["Row"]
