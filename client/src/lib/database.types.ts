export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      ads: {
        Row: {
          created_at: string
          description_ru: string | null
          description_uz: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link_url: string | null
          start_date: string | null
          title_ru: string | null
          title_uz: string
        }
        Insert: {
          created_at?: string
          description_ru?: string | null
          description_uz?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          start_date?: string | null
          title_ru?: string | null
          title_uz: string
        }
        Update: {
          created_at?: string
          description_ru?: string | null
          description_uz?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          start_date?: string | null
          title_ru?: string | null
          title_uz?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_active: boolean | null
          name_ru: string | null
          name_uz: string
          order_index: number | null
          parent_id: string | null
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ru?: string | null
          name_uz: string
          order_index?: number | null
          parent_id?: string | null
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ru?: string | null
          name_uz?: string
          order_index?: number | null
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          price_per_unit: number
          product_id: string | null
          quantity: number
          total_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          price_per_unit: number
          product_id?: string | null
          quantity?: number
          total_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          price_per_unit?: number
          product_id?: string | null
          quantity?: number
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          created_at: string
          delivery_address: string | null
          delivery_amount: number | null
          delivery_date: string | null
          delivery_latitude: number | null
          delivery_longitude: number | null
          id: string
          is_delivery: boolean | null
          notes: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          delivery_address?: string | null
          delivery_amount?: number | null
          delivery_date?: string | null
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          id?: string
          is_delivery?: boolean | null
          notes?: string | null
          status?: string
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          delivery_address?: string | null
          delivery_amount?: number | null
          delivery_date?: string | null
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          id?: string
          is_delivery?: boolean | null
          notes?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          delivery_available: boolean | null
          delivery_price: number | null
          description_ru: string | null
          description_uz: string | null
          free_delivery_threshold: number | null
          id: string
          image_url: string | null
          images: string[] | null
          is_available: boolean | null
          is_rental: boolean | null
          name_ru: string | null
          name_uz: string
          order_count: number | null
          price: number
          stock_quantity: number | null
          subcategory_id: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          delivery_available?: boolean | null
          delivery_price?: number | null
          description_ru?: string | null
          description_uz?: string | null
          free_delivery_threshold?: number | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_available?: boolean | null
          is_rental?: boolean | null
          name_ru?: string | null
          name_uz: string
          order_count?: number | null
          price: number
          stock_quantity?: number | null
          subcategory_id?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          delivery_available?: boolean | null
          delivery_price?: number | null
          description_ru?: string | null
          description_uz?: string | null
          free_delivery_threshold?: number | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          is_available?: boolean | null
          is_rental?: boolean | null
          name_ru?: string | null
          name_uz?: string
          order_count?: number | null
          price?: number
          stock_quantity?: number | null
          subcategory_id?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      temp_tokens: {
        Row: {
          client_id: string
          created_at: string
          expires_at: string
          id: string
          telegram_id: number
          token: string
          used: boolean | null
        }
        Insert: {
          client_id: string
          created_at?: string
          expires_at: string
          id?: string
          telegram_id: number
          token: string
          used?: boolean | null
        }
        Update: {
          client_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          telegram_id?: number
          token?: string
          used?: boolean | null
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          experience_years: number | null
          first_name: string
          hourly_rate: number | null
          id: string
          last_name: string
          phone: string
          role: string
          telegram_id: number | null
          telegram_username: string | null
          type: string
          updated_at: string
          work_type_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          experience_years?: number | null
          first_name: string
          hourly_rate?: number | null
          id?: string
          last_name: string
          phone: string
          role?: string
          telegram_id?: number | null
          telegram_username?: string | null
          type?: string
          updated_at?: string
          work_type_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          experience_years?: number | null
          first_name?: string
          hourly_rate?: number | null
          id?: string
          last_name?: string
          phone?: string
          role?: string
          telegram_id?: number | null
          telegram_username?: string | null
          type?: string
          updated_at?: string
          work_type_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_work_type_id_fkey"
            columns: ["work_type_id"]
            isOneToOne: false
            referencedRelation: "work_types"
            referencedColumns: ["id"]
          }
        ]
      }
      work_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name_ru: string
          name_uz: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name_ru: string
          name_uz: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name_ru?: string
          name_uz?: string
        }
        Relationships: []
      }
      worker_applications: {
        Row: {
          budget: number | null
          client_id: string
          contact_phone: string | null
          created_at: string
          description: string
          id: string
          location: string | null
          location_latitude: number | null
          location_longitude: number | null
          notes: string | null
          preferred_date: string | null
          status: string
          title: string
          updated_at: string
          urgency: string
          worker_id: string
        }
        Insert: {
          budget?: number | null
          client_id: string
          contact_phone?: string | null
          created_at?: string
          description: string
          id?: string
          location?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          notes?: string | null
          preferred_date?: string | null
          status?: string
          title: string
          updated_at?: string
          urgency?: string
          worker_id: string
        }
        Update: {
          budget?: number | null
          client_id?: string
          contact_phone?: string | null
          created_at?: string
          description?: string
          id?: string
          location?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          notes?: string | null
          preferred_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          urgency?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_applications_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_applications_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      worker_reviews: {
        Row: {
          application_id: string | null
          client_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          worker_id: string
        }
        Insert: {
          application_id?: string | null
          client_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          worker_id: string
        }
        Update: {
          application_id?: string | null
          client_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_reviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "worker_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_reviews_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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