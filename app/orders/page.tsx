"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/layout/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingBag } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  total_amount: number
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  delivery_address?: string
  phone?: string
  customer_name?: string
  notes?: string
  created_at: string
  order_items?: OrderItem[]
}

const statusLabels = {
  pending: "Kutilmoqda",
  confirmed: "Tasdiqlangan",
  processing: "Tayyorlanmoqda",
  shipped: "Yetkazilmoqda",
  delivered: "Yetkazilgan",
  cancelled: "Bekor qilingan",
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
      return
    }
    loadOrders()
  }, [isAuthenticated, router])

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      // Mock data for now
      const mockOrders: Order[] = [
        {
          id: "1",
          total_amount: 450000,
          status: "confirmed",
          delivery_address: "Toshkent shahar, Chilonzor tumani, 12-mavze",
          phone: "+998901234567",
          customer_name: "Karim Karimov",
          notes: "Erta yetkazib bering",
          created_at: "2024-01-15T10:30:00Z",
          order_items: [
            { id: "1", product_name: "Armaturniy prutok 12mm", quantity: 20, price: 15000 },
            { id: "2", product_name: "Sement M400", quantity: 4, price: 45000 },
          ],
        },
        {
          id: "2",
          total_amount: 250000,
          status: "processing",
          delivery_address: "Toshkent shahar, Yunusobod tumani, 5-mavze",
          phone: "+998901234567",
          customer_name: "Karim Karimov",
          created_at: "2024-01-14T14:20:00Z",
          order_items: [
            { id: "3", product_name: "Metalloprokat truba", quantity: 10, price: 25000 },
          ],
        },
        {
          id: "3",
          total_amount: 120000,
          status: "delivered",
          delivery_address: "Toshkent shahar, Mirzo Ulug'bek tumani, 8-mavze",
          phone: "+998901234567",
          customer_name: "Karim Karimov",
          created_at: "2024-01-10T09:15:00Z",
          order_items: [
            { id: "4", product_name: "Polietilen quvur", quantity: 10, price: 12000 },
          ],
        },
      ]
      setOrders(mockOrders)
    } catch (error) {
      console.error("Error loading orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const statusOptions = [
    { value: "", label: "Barchasi" },
    { value: "pending", label: "Kutilmoqda" },
    { value: "confirmed", label: "Tasdiqlangan" },
    { value: "processing", label: "Tayyorlanmoqda" },
    { value: "shipped", label: "Yetkazilmoqda" },
    { value: "delivered", label: "Yetkazilgan" },
    { value: "cancelled", label: "Bekor qilingan" },
  ]

  const filteredOrders = orders.filter((order) => 
    !selectedStatus || order.status === selectedStatus
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Buyurtmalar</h1>
          <p className="text-gray-600">Sizning barcha buyurtmalaringiz</p>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedStatus === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStatus(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-10 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Buyurtmalar topilmadi</h3>
            <p className="text-gray-600 mb-6">
              {selectedStatus
                ? `${statusLabels[selectedStatus as keyof typeof statusLabels]} holatidagi buyurtmalar yo'q`
                : "Siz hali hech qanday buyurtma bermagansiz"}
            </p>
            <Button onClick={() => router.push("/")}>
              Xarid qilishni boshlash
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-\
