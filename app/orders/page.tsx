"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/layout/navigation"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { CartBar } from "@/components/layout/cart-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Package, Calendar, MapPin, Phone, User, Eye } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  price: number
  unit: string
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
  updated_at: string
  order_items: OrderItem[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders()
    }
  }, [isAuthenticated])

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      // Mock data for orders
      const mockOrders: Order[] = [
        {
          id: "ORD-001",
          total_amount: 2500000,
          status: "delivered",
          delivery_address: "Toshkent, Yunusobod tumani, 15-uy",
          phone: "+998901234567",
          customer_name: "Akmal Karimov",
          notes: "Eshik oldiga qo'ying",
          created_at: "2024-01-15T10:30:00Z",
          updated_at: "2024-01-18T14:20:00Z",
          order_items: [
            {
              id: "1",
              product_name: "Armaturniy prutok 12mm",
              quantity: 50,
              price: 15000,
              unit: "metr",
            },
            {
              id: "2",
              product_name: "Sement M400",
              quantity: 20,
              price: 45000,
              unit: "qop",
            },
          ],
        },
        {
          id: "ORD-002",
          total_amount: 1800000,
          status: "processing",
          delivery_address: "Samarqand, Registon ko'chasi, 25-uy",
          phone: "+998901234568",
          customer_name: "Bobur Aliyev",
          created_at: "2024-01-20T09:15:00Z",
          updated_at: "2024-01-20T16:45:00Z",
          order_items: [
            {
              id: "3",
              product_name: "Metalloprokat truba",
              quantity: 30,
              price: 25000,
              unit: "metr",
            },
            {
              id: "4",
              product_name: "Polietilen quvur",
              quantity: 100,
              price: 12000,
              unit: "metr",
            },
          ],
        },
        {
          id: "ORD-003",
          total_amount: 850000,
          status: "pending",
          delivery_address: "Buxoro, Mustaqillik ko'chasi, 8-uy",
          phone: "+998901234569",
          customer_name: "Dilshod Rahimov",
          created_at: "2024-01-22T11:00:00Z",
          updated_at: "2024-01-22T11:00:00Z",
          order_items: [
            {
              id: "5",
              product_name: "Asbest plita",
              quantity: 15,
              price: 35000,
              unit: "dona",
            },
            {
              id: "6",
              product_name: "Sement M400",
              quantity: 5,
              price: 45000,
              unit: "qop",
            },
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-purple-100 text-purple-800"
      case "shipped":
        return "bg-indigo-100 text-indigo-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Kutilmoqda"
      case "confirmed":
        return "Tasdiqlangan"
      case "processing":
        return "Tayyorlanmoqda"
      case "shipped":
        return "Yetkazilmoqda"
      case "delivered":
        return "Yetkazilgan"
      case "cancelled":
        return "Bekor qilingan"
      default:
        return "Noma'lum"
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.order_items.some((item) => item.product_name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Buyurtmalarni ko'rish uchun kiring</h3>
            <p className="text-gray-600">Buyurtmalar tarixini ko'rish uchun tizimga kirishingiz kerak</p>
          </div>
        </main>
        <BottomNavigation />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Buyurtmalar</h1>
          <p className="text-gray-600">Sizning barcha buyurtmalaringiz tarixi</p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-6 w-24" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Buyurtmalar topilmadi</h3>
            <p className="text-gray-600">
              {searchQuery ? `"${searchQuery}" so'rovi bo'yicha buyurtma topilmadi` : "Hali buyurtma bermagansiz"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Buyurtma #{order.id}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{order.customer_name}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items Summary */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Mahsulotlar:</h4>
                      <div className="space-y-1">
                        {order.order_items.slice(0, 2).map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.product_name} × {item.quantity} {item.unit}
                            </span>
                            <span className="font-medium">{(item.price * item.quantity).toLocaleString()} so'm</span>
                          </div>
                        ))}
                        {order.order_items.length > 2 && (
                          <div className="text-sm text-gray-500">
                            va yana {order.order_items.length - 2} ta mahsulot...
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {order.delivery_address && (
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <span className="text-gray-500">Yetkazish manzili:</span>
                            <p className="text-gray-900">{order.delivery_address}</p>
                          </div>
                        </div>
                      )}
                      {order.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <div>
                            <span className="text-gray-500">Telefon:</span>
                            <span className="text-gray-900 ml-1">{order.phone}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {order.notes && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-sm text-gray-500">Izoh:</span>
                        <p className="text-sm text-gray-900 mt-1">{order.notes}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="text-lg font-semibold text-gray-900">
                        Jami: {order.total_amount.toLocaleString()} so'm
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Batafsil
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Buyurtma #{order.id}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Status:</span>
                              <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="font-medium mb-3">Mahsulotlar:</h4>
                              <div className="space-y-3">
                                {order.order_items.map((item) => (
                                  <div key={item.id} className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">{item.product_name}</p>
                                      <p className="text-xs text-gray-500">
                                        {item.quantity} {item.unit} × {item.price.toLocaleString()} so'm
                                      </p>
                                    </div>
                                    <div className="text-sm font-medium">
                                      {(item.price * item.quantity).toLocaleString()} so'm
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <Separator />

                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Buyurtma sanasi:</span>
                                <span>{new Date(order.created_at).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Oxirgi yangilanish:</span>
                                <span>{new Date(order.updated_at).toLocaleString()}</span>
                              </div>
                              {order.delivery_address && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Yetkazish manzili:</span>
                                  <span className="text-right max-w-48">{order.delivery_address}</span>
                                </div>
                              )}
                              {order.phone && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Telefon:</span>
                                  <span>{order.phone}</span>
                                </div>
                              )}
                            </div>

                            <Separator />

                            <div className="flex justify-between items-center text-lg font-semibold">
                              <span>Jami:</span>
                              <span>{order.total_amount.toLocaleString()} so'm</span>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <CartBar />
      <BottomNavigation />
    </div>
  )
}
