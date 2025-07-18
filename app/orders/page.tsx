"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react"
import { supabase, type User as UserType, type Order, type OrderItem, type Product } from "@/lib/supabase"

interface OrderWithItems extends Order {
  order_items: (OrderItem & { product: Product })[]
}

export default function OrdersPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserAndOrders()
  }, [])

  const loadUserAndOrders = async () => {
    try {
      const telegramId = localStorage.getItem("telegram_id")
      if (!telegramId) {
        router.push("/")
        return
      }

      // Get user
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", Number.parseInt(telegramId))
        .single()

      if (userError || !userData) {
        router.push("/")
        return
      }

      setUser(userData)

      // Get orders with items
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          *,
          order_items(
            *,
            product:products(*)
          )
        `)
        .eq("user_id", userData.id)
        .order("created_at", { ascending: false })

      if (ordersError) {
        console.error("Orders fetch error:", ordersError)
      } else {
        setOrders(ordersData || [])
      }
    } catch (error) {
      console.error("Load error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "processing":
        return <Package className="h-4 w-4" />
      case "shipped":
        return <Truck className="h-4 w-4" />
      case "delivered":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-orange-100 text-orange-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
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
        return "Yo'lda"
      case "delivered":
        return "Yetkazilgan"
      case "cancelled":
        return "Bekor qilingan"
      default:
        return status
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("uz-UZ").format(price) + " so'm"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Buyurtmalarim</h1>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Buyurtmalar yo'q</h2>
            <p className="text-gray-600 mb-4">Hozircha buyurtmalaringiz yo'q</p>
            <Button onClick={() => router.push("/catalog")}>Katalogga o'tish</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-2">Buyurtma #{order.id.slice(-8)}</CardTitle>
                    <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                  </div>
                  <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                    {getStatusIcon(order.status)}
                    {getStatusText(order.status)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  <h4 className="font-medium">Mahsulotlar:</h4>
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={item.product.image_url || "/placeholder.svg?height=48&width=48"}
                        alt={item.product.name_uz}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{item.product.name_uz}</h5>
                        <p className="text-xs text-gray-600">
                          {item.quantity} x {formatPrice(Number.parseFloat(item.price.toString()))}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          {formatPrice(Number.parseFloat(item.price.toString()) * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Telefon:</span>
                    <p className="font-medium">{order.phone}</p>
                  </div>

                  {order.delivery_address && (
                    <div>
                      <span className="text-gray-600">Manzil:</span>
                      <p className="font-medium">{order.delivery_address}</p>
                    </div>
                  )}

                  {order.notes && (
                    <div className="md:col-span-2">
                      <span className="text-gray-600">Izoh:</span>
                      <p className="font-medium">{order.notes}</p>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-medium">Jami summa:</span>
                  <span className="text-lg font-bold">
                    {formatPrice(Number.parseFloat(order.total_amount.toString()))}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
