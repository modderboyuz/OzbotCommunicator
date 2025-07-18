import { create } from "zustand"
import { supabase } from "./supabase"

interface User {
  id: string
  phone: string
  first_name: string
  last_name: string
  telegram_username?: string
  telegram_id?: number
  role: "client" | "worker" | "admin"
  type: "telegram" | "google"
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  loginWithTelegram: (telegramId: number) => Promise<boolean>
  logout: () => void
  getCurrentUser: () => Promise<User | null>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),

  loginWithTelegram: async (telegramId: number) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.from("users").select("*").eq("telegram_id", telegramId).single()

      if (error || !data) {
        console.error("Telegram login error:", error)
        set({ isLoading: false })
        return false
      }

      localStorage.setItem("telegram_id", telegramId.toString())
      set({ user: data, isLoading: false })
      return true
    } catch (error) {
      console.error("Telegram login error:", error)
      set({ isLoading: false })
      return false
    }
  },

  getCurrentUser: async () => {
    const telegramId = localStorage.getItem("telegram_id")
    if (!telegramId) return null

    const success = await get().loginWithTelegram(Number(telegramId))
    return success ? get().user : null
  },

  logout: () => {
    localStorage.removeItem("telegram_id")
    set({ user: null })
  },
}))
