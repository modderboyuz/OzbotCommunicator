"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/lib/auth-store"
import { useToast } from "@/hooks/use-toast"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [phone, setPhone] = React.useState("")
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const { setUser } = useAuthStore()
  const { toast } = useToast()

  const handleTelegramLogin = async () => {
    try {
      setIsLoading(true)

      // Check if Telegram WebApp is available
      if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
        const tg = (window as any).Telegram.WebApp
        const user = tg.initDataUnsafe?.user

        if (user) {
          const response = await fetch("/api/auth/telegram-verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              telegram_id: user.id,
              username: user.username,
              first_name: user.first_name,
              last_name: user.last_name,
            }),
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Server error: ${response.status}`)
          }

          const data = await response.json()

          if (data.success && data.user) {
            setUser(data.user)
            toast({
              title: "Muvaffaqiyatli kirish",
              description: "Telegram orqali muvaffaqiyatli kirdingiz",
            })
            onClose()
          } else {
            throw new Error(data.message || "Login failed")
          }
        } else {
          throw new Error("Telegram user data not found")
        }
      } else {
        // Fallback for testing without Telegram
        const mockUser = {
          id: "test-user-1",
          telegram_id: 123456789,
          first_name: "Test",
          last_name: "User",
          phone: "+998901234567",
          role: "client" as const,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setUser(mockUser)
        toast({
          title: "Test rejimida kirish",
          description: "Test foydalanuvchi sifatida kirdingiz",
        })
        onClose()
      }
    } catch (error) {
      console.error("Telegram login error:", error)
      toast({
        title: "Xatolik",
        description: error instanceof Error ? error.message : "Telegram orqali kirishda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || !firstName) {
      toast({
        title: "Xatolik",
        description: "Telefon raqam va ismni kiriting",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Mock phone login for now
      const mockUser = {
        id: "phone-user-1",
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        role: "client" as const,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setUser(mockUser)
      toast({
        title: "Muvaffaqiyatli kirish",
        description: "Telefon raqam orqali muvaffaqiyatli kirdingiz",
      })
      onClose()
    } catch (error) {
      console.error("Phone login error:", error)
      toast({
        title: "Xatolik",
        description: "Telefon orqali kirishda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">MetalBaza'ga kirish</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Telegram Login */}
          <div className="space-y-4">
            <Button
              onClick={handleTelegramLogin}
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isLoading ? "Kuting..." : "Telegram orqali kirish"}
            </Button>
            <p className="text-xs text-gray-500 text-center">Telegram orqali tez va xavfsiz kirish</p>
          </div>

          <Separator />

          {/* Phone Login */}
          <form onSubmit={handlePhoneLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon raqam</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+998 90 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Ism</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Ismingiz"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Familiya</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Familiyangiz"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-transparent" variant="outline">
              {isLoading ? "Kuting..." : "Telefon orqali kirish"}
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center">
            Kirishingiz bilan siz{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Foydalanish shartlari
            </a>{" "}
            va{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Maxfiylik siyosati
            </a>
            ga rozilik bildirasiz
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
