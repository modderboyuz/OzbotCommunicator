"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/layout/navigation"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { CartBar } from "@/components/layout/cart-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { User, MapPin, Phone, Calendar, Star, Plus, Filter } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { useToast } from "@/hooks/use-toast"

interface Worker {
  id: string
  first_name: string
  last_name: string
  phone?: string
  specialization: string
  experience_years: number
  rating: number
  location: string
  hourly_rate: number
  description: string
  profile_image?: string
  is_available: boolean
  created_at: string
}

interface WorkerApplication {
  id: string
  title: string
  description: string
  location?: string
  budget?: number
  urgency: "low" | "medium" | "high"
  status: string
  created_at: string
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [applications, setApplications] = useState<WorkerApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("all")
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false)
  const [newApplication, setNewApplication] = useState({
    title: "",
    description: "",
    location: "",
    budget: "",
    urgency: "medium" as const,
    contact_phone: "",
    preferred_date: "",
  })

  const { user, isAuthenticated } = useAuthStore()
  const { toast } = useToast()

  useEffect(() => {
    loadWorkers()
    loadApplications()
  }, [])

  const loadWorkers = async () => {
    try {
      setIsLoading(true)
      // Mock data for workers
      const mockWorkers: Worker[] = [
        {
          id: "1",
          first_name: "Akmal",
          last_name: "Karimov",
          phone: "+998901234567",
          specialization: "Qurilish ustasi",
          experience_years: 8,
          rating: 4.8,
          location: "Toshkent",
          hourly_rate: 50000,
          description: "Yuqori sifatli qurilish ishlari. Uy va ofis ta'miri.",
          is_available: true,
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          first_name: "Bobur",
          last_name: "Aliyev",
          phone: "+998901234568",
          specialization: "Elektrik",
          experience_years: 5,
          rating: 4.6,
          location: "Samarqand",
          hourly_rate: 40000,
          description: "Elektr montaj ishlari va ta'mir.",
          is_available: true,
          created_at: new Date().toISOString(),
        },
        {
          id: "3",
          first_name: "Dilshod",
          last_name: "Rahimov",
          phone: "+998901234569",
          specialization: "Santexnik",
          experience_years: 6,
          rating: 4.7,
          location: "Buxoro",
          hourly_rate: 45000,
          description: "Suv va kanalizatsiya tizimlari montaji.",
          is_available: false,
          created_at: new Date().toISOString(),
        },
      ]
      setWorkers(mockWorkers)
    } catch (error) {
      console.error("Error loading workers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadApplications = async () => {
    try {
      // Mock data for applications
      const mockApplications: WorkerApplication[] = [
        {
          id: "1",
          title: "Oshxona ta'miri",
          description: "Oshxonani to'liq ta'mirlash kerak",
          location: "Toshkent, Yunusobod",
          budget: 5000000,
          urgency: "medium",
          status: "pending",
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Elektr simlarini almashtirish",
          description: "Uyda elektr simlarini yangilash",
          location: "Toshkent, Mirzo Ulug'bek",
          budget: 2000000,
          urgency: "high",
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ]
      setApplications(mockApplications)
    } catch (error) {
      console.error("Error loading applications:", error)
    }
  }

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast({
        title: "Xatolik",
        description: "Ariza berish uchun tizimga kiring",
        variant: "destructive",
      })
      return
    }

    try {
      // Mock application creation
      const application: WorkerApplication = {
        id: Date.now().toString(),
        ...newApplication,
        budget: newApplication.budget ? Number.parseInt(newApplication.budget) : undefined,
        status: "pending",
        created_at: new Date().toISOString(),
      }

      setApplications([application, ...applications])
      setIsApplicationModalOpen(false)
      setNewApplication({
        title: "",
        description: "",
        location: "",
        budget: "",
        urgency: "medium",
        contact_phone: "",
        preferred_date: "",
      })

      toast({
        title: "Muvaffaqiyat",
        description: "Arizangiz muvaffaqiyatli yuborildi",
      })
    } catch (error) {
      console.error("Error creating application:", error)
      toast({
        title: "Xatolik",
        description: "Ariza yuborishda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch =
      worker.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSpecialization = selectedSpecialization === "all" || worker.specialization === selectedSpecialization

    return matchesSearch && matchesSpecialization
  })

  const specializations = Array.from(new Set(workers.map((w) => w.specialization)))

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "Shoshilinch"
      case "medium":
        return "O'rtacha"
      case "low":
        return "Oddiy"
      default:
        return "Noma'lum"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ishchilar</h1>
            <p className="text-gray-600">Malakali ishchilar va ularning xizmatlari</p>
          </div>

          <Dialog open={isApplicationModalOpen} onOpenChange={setIsApplicationModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Ariza berish</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Yangi ariza</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateApplication} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Ish nomi</Label>
                  <Input
                    id="title"
                    value={newApplication.title}
                    onChange={(e) => setNewApplication({ ...newApplication, title: e.target.value })}
                    placeholder="Masalan: Oshxona ta'miri"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Tavsif</Label>
                  <Textarea
                    id="description"
                    value={newApplication.description}
                    onChange={(e) => setNewApplication({ ...newApplication, description: e.target.value })}
                    placeholder="Ish haqida batafsil ma'lumot..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Manzil</Label>
                    <Input
                      id="location"
                      value={newApplication.location}
                      onChange={(e) => setNewApplication({ ...newApplication, location: e.target.value })}
                      placeholder="Toshkent, Yunusobod"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Byudjet (so'm)</Label>
                    <Input
                      id="budget"
                      type="number"
                      value={newApplication.budget}
                      onChange={(e) => setNewApplication({ ...newApplication, budget: e.target.value })}
                      placeholder="1000000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency">Muhimlik darajasi</Label>
                  <Select
                    value={newApplication.urgency}
                    onValueChange={(value: "low" | "medium" | "high") =>
                      setNewApplication({ ...newApplication, urgency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Oddiy</SelectItem>
                      <SelectItem value="medium">O'rtacha</SelectItem>
                      <SelectItem value="high">Shoshilinch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Telefon raqam</Label>
                  <Input
                    id="contact_phone"
                    type="tel"
                    value={newApplication.contact_phone}
                    onChange={(e) => setNewApplication({ ...newApplication, contact_phone: e.target.value })}
                    placeholder="+998 90 123 45 67"
                  />
                </div>

                <Button type="submit" className="w-full">
                  Ariza yuborish
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex-1">
              <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Mutaxassislik" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barchasi</SelectItem>
                  {specializations.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(selectedSpecialization !== "all" || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedSpecialization("all")
                  setSearchQuery("")
                }}
              >
                Tozalash
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Workers List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Mavjud ishchilar</h2>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-6 w-1/2" />
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-4 w-full" />
                          <div className="flex space-x-2">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-16" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredWorkers.map((worker) => (
                  <Card key={worker.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {worker.first_name} {worker.last_name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">{worker.specialization}</p>
                              <p className="text-sm text-gray-700 mb-3">{worker.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{worker.location}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Star className="h-4 w-4 text-yellow-400" />
                                  <span>{worker.rating}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{worker.experience_years} yil tajriba</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-900">
                                {worker.hourly_rate.toLocaleString()} so'm/soat
                              </div>
                              <Badge variant={worker.is_available ? "default" : "secondary"} className="mt-2">
                                {worker.is_available ? "Mavjud" : "Band"}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{worker.phone}</span>
                            </div>
                            <Button size="sm" disabled={!worker.is_available}>
                              Bog'lanish
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Applications */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Mening arizalarim</h2>
            <div className="space-y-4">
              {applications.map((application) => (
                <Card key={application.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{application.title}</CardTitle>
                      <Badge className={getUrgencyColor(application.urgency)}>
                        {getUrgencyText(application.urgency)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 mb-3">{application.description}</p>
                    {application.location && (
                      <div className="flex items-center space-x-1 text-sm text-gray-500 mb-2">
                        <MapPin className="h-4 w-4" />
                        <span>{application.location}</span>
                      </div>
                    )}
                    {application.budget && (
                      <div className="text-sm font-medium text-gray-900 mb-2">
                        Byudjet: {application.budget.toLocaleString()} so'm
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{application.status}</Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(application.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <CartBar />
      <BottomNavigation />
    </div>
  )
}
