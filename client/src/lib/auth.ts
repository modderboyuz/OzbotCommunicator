import { supabase } from "./supabase"

export interface AuthUser {
  id: string
  telegram_id: number
  first_name: string
  last_name?: string
  username?: string
  role: "user" | "worker" | "admin"
  phone?: string
  created_at: string
}

export interface TelegramLoginData {
  token: string
  client_id: string
  bot_url: string
}

class AuthService {
  private baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000"

  async startTelegramLogin(): Promise<TelegramLoginData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/telegram/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to start Telegram login")
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error starting Telegram login:", error)
      return null
    }
  }

  async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/telegram/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        throw new Error("Token verification failed")
      }

      const data = await response.json()

      if (data.user) {
        // Store user data in localStorage
        localStorage.setItem("telegram_id", data.user.telegram_id.toString())
        localStorage.setItem("user_id", data.user.id)
        return data.user
      }

      return null
    } catch (error) {
      console.error("Error verifying token:", error)
      return null
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const telegramId = localStorage.getItem("telegram_id")
    if (!telegramId) return null

    try {
      const { data, error } = await supabase.from("users").select("*").eq("telegram_id", Number(telegramId)).single()

      if (error) {
        console.error("Error getting current user:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error getting current user:", error)
      return null
    }
  }

  logout() {
    localStorage.removeItem("telegram_id")
    localStorage.removeItem("user_id")
  }
}

export const authService = new AuthService()
