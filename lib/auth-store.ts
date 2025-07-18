import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  telegram_id?: number
  username?: string
  first_name: string
  last_name?: string
  phone?: string
  role: "client" | "worker" | "admin"
  is_active: boolean
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user: User, token: string) => {
        set({ user, token, isAuthenticated: true })
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } })
        }
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)
