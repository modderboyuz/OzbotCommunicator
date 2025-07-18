"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/layout/navigation"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, MapPin, Phone, User, Wrench } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"

interface Worker {
  id: string
  first_name: string
  last_name?: string
  username?: string
  phone?: string
  profile_image?: string
  work_type?: string
  description?: string
  average_pay?: number
  address?: string
  rating?: number
  reviews_count?: number
  is_active: boolean
}

export default function WorkersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [workers, setWorkers] = useState<Worker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedWorkType, setSelectedWorkType] = useState<string>("")
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    loadWorkers()
  }, [])

  const loadWorkers = async () => {
    try {
      setIsLoading(true)
      // Mock data for now
      const mockWorkers: Worker[] = [
        {
          id: "1",
          first_name: "Karim",
          last_name: "Ustakov",
          username: "karim_usta",
          phone: "+998901111111",
          work_type: "Payvandchi",
          description:
            "10 yillik tajribaga ega professional payvandchi. Har qanday metall konstruksiyalar bilan ishlayman.",
          average_pay: 150000,
          address: "Toshkent, Chilonzor",
          rating: 4.8,
          reviews_count: 24,
          is_active: true,
        },
        {
          id: "2",
          first_name: "Bobur",
          last_name: "Qurilishchi",
          username: "bobur_builder",
          phone: "+998902222222",
          work_type: "Qurilishchi",
          description: "Uy qurilishi, ta'mirlash ishlari. Sifatli va tez bajaraman.",
          average_pay: 120000,
          address: "Toshkent, Yunusobod",
          rating: 4.6,
          reviews_count: 18,
          is_active: true,
        },
        {
          id: "3",
          first_name: "Sardor",
          last_name: "Elektrik",
          username: "sardor_electric",
          phone: "+998903333333",
          work_type: "Elektrik",
          description: "Elektr montaj ishlari, avtomatika, signalizatsiya tizimlari.",
          average_pay: 100000,
          address: "Toshkent, Mirzo Ulug'bek",
          rating: 4.9,
          reviews_count: 31,
          is_active: true,
        },
        {
          id: "4",
          first_name: "Jasur",
          last_name: "Santexnik",
          username: "jasur_plumber",
          phone: "+998904444444",
          work_type: "Santexnik",
          description: "Santexnik ishlari, quvur o'tkazish, vannaxona ta'mirlash.",
          average_pay: 80000,
          address: "Toshkent, Sergeli",
          rating: 4.5,
          reviews_count: 15,
          is_active: true,
        },
      ]
      setWorkers(mockWorkers)
    } catch (error) {
      console.error("Error loading workers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const workTypes = ["Payvandchi", "Qurilishchi", "Elektrik", "Santexnik", "Usta"]

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch =
      worker.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.work_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesWorkType = !selectedWorkType || worker.work_type === selectedWorkType

    return matchesSearch && matchesWorkType && worker.is_active
  })

  const handleContactWorker = (worker: Worker) => {
    if (!isAuthenticated) {
      alert("Usta bilan bog'lanish uchun tizimga kiring")
      return
    }

    // Navigate to worker application page
    router.push(`/worker-applications?worker_id=${worker.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ustalar</h1>
          <p className="text-gray-600">Professional ustalar bilan tanishing va ish buyurtma bering</p>
        </div>

        {/* Work Type Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedWorkType === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedWorkType("")}
            >
              Barchasi
            </Button>
            {workTypes.map((type) => (
              <Button
                key={type}
                variant={selectedWorkType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedWorkType(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ustalar topilmadi</h3>
            <p className="text-gray-600">
              {searchQuery || selectedWorkType
                ? "Qidiruv shartlariga mos ustalar topilmadi"
                : "Hozircha ustalar ro'yxati bo'sh"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkers.map((worker) => (
              <Card key={worker.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={worker.profile_image || "/placeholder.svg"} alt={worker.first_name} />
                      <AvatarFallback>
                        {worker.first_name.charAt(0)}
                        {worker.last_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {worker.first_name} {worker.last_name}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          <Wrench className="w-3 h-3 mr-1" />
                          {worker.work_type}
                        </Badge>
                        {worker.rating && (
                          <div className="flex items-center text-sm text-yellow-600">
                            <Star className="w-4 h-4 fill-current mr-1" />
                            <span>{worker.rating}</span>
                            <span className="text-gray-500 ml-1">({worker.reviews_count})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{worker.description}</p>

                  <div className="space-y-2 mb-4">
                    {worker.address && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-2" />
                        {worker.address}
                      </div>
                    )}
                    {worker.phone && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="w-4 h-4 mr-2" />
                        {worker.phone}
                      </div>
                    )}
                    {worker.average_pay && (
                      <div className="text-sm font-medium text-green-600">
                        O'rtacha narx: {worker.average_pay.toLocaleString()} so'm/kun
                      </div>
                    )}
                  </div>

                  <Button className="w-full" onClick={() => handleContactWorker(worker)}>
                    Bog'lanish
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}
