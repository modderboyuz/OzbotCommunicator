"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  telegram_id: number
  first_name: string
  last_name: string
  username?: string
  phone?: string
  role: "client" | "worker" | "admin"
  delivery_address?: string
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  login: (telegramData: any) => Promise<void>
  logout: () => void
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      login: async (telegramData) => {
        try {
          // Simulate login process
          const user: User = {
            id: telegramData.id.toString(),
            telegram_id: telegramData.id,
            first_name: telegramData.first_name,
            last_name: telegramData.last_name || "",
            username: telegramData.username,
            role: "client",
          }
          set({ user, isAuthenticated: true })
        } catch (error) {
          console.error("Login error:", error)
        }
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
    },
  ),
)
