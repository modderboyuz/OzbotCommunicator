"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/layout/navigation"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { CartBar } from "@/components/layout/cart-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { User, Phone, Mail, MapPin, Calendar, Settings, LogOut, Edit, Save, X } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  first_name: string
  last_name?: string
  phone?: string
  email?: string
  telegram_id?: number
  username?: string
  role: "client" | "worker" | "admin"
  address?: string
  date_of_birth?: string
  profile_image?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    address: "",
    date_of_birth: "",
  })

  const { user, isAuthenticated, logout } = useAuthStore()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }
    loadProfile()
  }, [isAuthenticated, router])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      // Mock profile data based on current user
      if (user) {
        const mockProfile: UserProfile = {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          email: "user@example.com",
          telegram_id: user.telegram_id,
          username: user.username,
          role: user.role,
          address: "Toshkent, Yunusobod tumani, 15-uy",
          date_of_birth: "1990-01-01",
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at,
        }
        setProfile(mockProfile)
        setEditForm({
          first_name: mockProfile.first_name,
          last_name: mockProfile.last_name || "",
          phone: mockProfile.phone || "",
          email: mockProfile.email || "",
          address: mockProfile.address || "",
          date_of_birth: mockProfile.date_of_birth || "",
        })
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      toast({
        title: "Xatolik",
        description: "Profil ma'lumotlarini yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      // Mock save profile
      if (profile) {
        const updatedProfile = {
          ...profile,
          ...editForm,
          updated_at: new Date().toISOString(),
        }
        setProfile(updatedProfile)
        setIsEditing(false)
        toast({
          title: "Muvaffaqiyat",
          description: "Profil ma'lumotlari yangilandi",
        })
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Xatolik",
        description: "Profil yangilashda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Chiqish",
      description: "Tizimdan muvaffaqiyatli chiqdingiz",
    })
    router.push("/")
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case "client":
        return "Mijoz"
      case "worker":
        return "Ishchi"
      case "admin":
        return "Administrator"
      default:
        return "Noma'lum"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "client":
        return "bg-blue-100 text-blue-800"
      case "worker":
        return "bg-green-100 text-green-800"
      case "admin":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
          <div className="text-center py-12">
            <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Profilni ko'rish uchun kiring</h3>
            <p className="text-gray-600">Profil ma'lumotlarini ko'rish uchun tizimga kirishingiz kerak</p>
          </div>
        </main>
        <BottomNavigation />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil</h1>
          <p className="text-gray-600">Shaxsiy ma'lumotlaringizni boshqaring</p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Card className="animate-pulse">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full" />
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-48" />
                    <div className="h-4 bg-gray-200 rounded w-32" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-10 w-10 text-gray-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {profile?.first_name} {profile?.last_name}
                      </h2>
                      <div className="flex items-center space-x-3 mt-2">
                        <Badge className={getRoleColor(profile?.role || "")}>{getRoleText(profile?.role || "")}</Badge>
                        <Badge variant={profile?.is_active ? "default" : "secondary"}>
                          {profile?.is_active ? "Faol" : "Nofaol"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500 mt-2">
                        <Calendar className="h-4 w-4" />
                        <span>Ro'yxatdan o'tgan: {new Date(profile?.created_at || "").toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!isEditing ? (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Tahrirlash
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                          <X className="h-4 w-4 mr-2" />
                          Bekor qilish
                        </Button>
                        <Button size="sm" onClick={handleSaveProfile}>
                          <Save className="h-4 w-4 mr-2" />
                          Saqlash
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Shaxsiy ma'lumotlar</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name">Ism</Label>
                        <Input
                          id="first_name"
                          value={editForm.first_name}
                          onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name">Familiya</Label>
                        <Input
                          id="last_name"
                          value={editForm.last_name}
                          onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefon raqam</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Manzil</Label>
                      <Input
                        id="address"
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Tug'ilgan sana</Label>
                      <Input
                        id="date_of_birth"
                        type="date"
                        value={editForm.date_of_birth}
                        onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                      />
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">To'liq ism</p>
                            <p className="font-medium">
                              {profile?.first_name} {profile?.last_name}
                            </p>
                          </div>
                        </div>

                        {profile?.phone && (
                          <div className="flex items-center space-x-3">
                            <Phone className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Telefon raqam</p>
                              <p className="font-medium">{profile.phone}</p>
                            </div>
                          </div>
                        )}

                        {profile?.email && (
                          <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="font-medium">{profile.email}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        {profile?.address && (
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Manzil</p>
                              <p className="font-medium">{profile.address}</p>
                            </div>
                          </div>
                        )}

                        {profile?.date_of_birth && (
                          <div className="flex items-center space-x-3">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Tug'ilgan sana</p>
                              <p className="font-medium">{new Date(profile.date_of_birth).toLocaleDateString()}</p>
                            </div>
                          </div>
                        )}

                        {profile?.telegram_id && (
                          <div className="flex items-center space-x-3">
                            <User className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">Telegram ID</p>
                              <p className="font-medium">{profile.telegram_id}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Hisob sozlamalari</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Parolni o'zgartirish</h4>
                      <p className="text-sm text-gray-500">Hisobingiz xavfsizligini ta'minlash uchun</p>
                    </div>
                    <Button variant="outline" size="sm">
                      O'zgartirish
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Bildirishnomalar</h4>
                      <p className="text-sm text-gray-500">Email va SMS bildirishnomalarini boshqarish</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Sozlash
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <h4 className="font-medium text-red-900">Hisobni o'chirish</h4>
                      <p className="text-sm text-red-600">Bu amalni qaytarib bo'lmaydi</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      O'chirish
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logout */}
            <Card>
              <CardContent className="pt-6">
                <Button variant="outline" onClick={handleLogout} className="w-full bg-transparent">
                  <LogOut className="h-4 w-4 mr-2" />
                  Tizimdan chiqish
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <CartBar />
      <BottomNavigation />
    </div>
  )
}
