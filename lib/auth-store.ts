import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  telegram_id: number
  username?: string
  first_name: string
  last_name?: string
  phone?: string
  role: "client" | "worker" | "admin"
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
    },
  ),
)
