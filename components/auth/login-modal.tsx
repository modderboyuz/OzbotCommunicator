"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { MessageCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (user: any) => void
}

export function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [currentToken, setCurrentToken] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    let pollInterval: NodeJS.Timeout

    if (isPolling && currentToken) {
      pollInterval = setInterval(async () => {
        try {
          const response = await fetch("/api/auth/telegram-verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: currentToken }),
          })

          const data = await response.json()

          if (data.success && data.user) {
            // Login successful
            localStorage.setItem("telegram_id", data.user.telegram_id.toString())
            onLogin(data.user)
            setIsPolling(false)
            setCurrentToken(null)
            onClose()

            toast({
              title: "Muvaffaqiyat",
              description: "Tizimga muvaffaqiyatli kirdingiz",
            })
          } else if (response.status === 400) {
            // Token expired or invalid
            setIsPolling(false)
            setCurrentToken(null)
            setIsLoading(false)

            toast({
              title: "Xatolik",
              description: "Vaqt tugadi. Qaytadan urinib ko'ring",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Polling error:", error)
        }
      }, 3000) // Poll every 3 seconds
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [isPolling, currentToken, onLogin, onClose, toast])

  const handleTelegramLogin = async () => {
    setIsLoading(true)

    try {
      // Generate client ID
      const clientId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Initialize Telegram OAuth
      const response = await fetch("/api/auth/telegram-init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ client_id: clientId }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Token yaratishda xatolik")
      }

      // Open Telegram bot
      window.open(data.telegram_url, "_blank")

      // Start polling for authentication
      setCurrentToken(data.token)
      setIsPolling(true)

      toast({
        title: "Telegram botga o'ting",
        description: "Botda /start buyrug'ini bosing va ko'rsatmalarga amal qiling",
      })
    } catch (error) {
      console.error("Telegram login error:", error)
      setIsLoading(false)

      toast({
        title: "Xatolik",
        description: "Telegram orqali kirishda xatolik",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setIsPolling(false)
    setCurrentToken(null)
    setIsLoading(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Tizimga kirish</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <p className="text-gray-600">MetalBaza tizimiga kirish uchun Telegram akkauntingizdan foydalaning</p>
          </div>

          {!isPolling ? (
            <Button
              onClick={handleTelegramLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
              <span>Telegram orqali kirish</span>
            </Button>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-blue-600">Telegram orqali autentifikatsiya kutilmoqda...</span>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  1. Telegram botga o'ting
                  <br />
                  2. /start buyrug'ini bosing
                  <br />
                  3. Ko'rsatmalarga amal qiling
                  <br />
                  4. Bu oyna avtomatik ravishda yopiladi
                </p>
              </div>

              <Button variant="outline" onClick={handleCancel} className="w-full bg-transparent">
                Bekor qilish
              </Button>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-500">Telegram botimiz orqali xavfsiz va tez kirish</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
