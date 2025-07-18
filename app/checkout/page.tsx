"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { MapPin, User, ShoppingCart, Minus, Plus, Trash2, ArrowLeft, Edit2, Save, X } from "lucide-react"
import { supabase, type User as UserType, type CartItem, type Product } from "@/lib/supabase"

interface CartItemWithProduct extends CartItem {
  product: Product
}

export default function CheckoutPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [user, setUser] = useState<UserType | null>(null)
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Editable user info
  const [isEditingInfo, setIsEditingInfo] = useState(false)
  const [editableInfo, setEditableInfo] = useState({
    first_name: "",
    last_name: "",
    phone: "",
  })

  // Order details
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    loadUserAndCart()
  }, [])

  const loadUserAndCart = async () => {
    try {
      // Get user from localStorage (telegram_id)
      const telegramId = localStorage.getItem("telegram_id")
      if (!telegramId) {
        router.push("/")
        return
      }

      // Fetch user data
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", Number.parseInt(telegramId))
        .single()

      if (userError || !userData) {
        toast({
          title: "Xatolik",
          description: "Foydalanuvchi ma'lumotlari topilmadi",
          variant: "destructive",
        })
        router.push("/")
        return
      }

      setUser(userData)
      setEditableInfo({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        phone: userData.phone || "",
      })

      // Fetch cart items
      const { data: cartData, error: cartError } = await supabase
        .from("cart_items")
        .select(`
          *,
          product:products(*)
        `)
        .eq("user_id", userData.id)

      if (cartError) {
        console.error("Cart fetch error:", cartError)
        toast({
          title: "Xatolik",
          description: "Savatni yuklashda xatolik",
          variant: "destructive",
        })
      } else {
        setCartItems(cartData || [])
      }
    } catch (error) {
      console.error("Load error:", error)
      toast({
        title: "Xatolik",
        description: "Ma'lumotlarni yuklashda xatolik",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateCartItemQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      const { error } = await supabase.from("cart_items").update({ quantity: newQuantity }).eq("id", itemId)

      if (error) {
        toast({
          title: "Xatolik",
          description: "Miqdorni yangilashda xatolik",
          variant: "destructive",
        })
        return
      }

      setCartItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))
    } catch (error) {
      console.error("Update quantity error:", error)
    }
  }

  const removeCartItem = async (itemId: string) => {
    try {
      const { error } = await supabase.from("cart_items").delete().eq("id", itemId)

      if (error) {
        toast({
          title: "Xatolik",
          description: "Mahsulotni o'chirishda xatolik",
          variant: "destructive",
        })
        return
      }

      setCartItems((prev) => prev.filter((item) => item.id !== itemId))

      toast({
        title: "Muvaffaqiyat",
        description: "Mahsulot savatdan o'chirildi",
      })
    } catch (error) {
      console.error("Remove item error:", error)
    }
  }

  const saveUserInfo = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("users")
        .update({
          first_name: editableInfo.first_name,
          last_name: editableInfo.last_name,
          phone: editableInfo.phone,
        })
        .eq("id", user.id)

      if (error) {
        toast({
          title: "Xatolik",
          description: "Ma'lumotlarni saqlashda xatolik",
          variant: "destructive",
        })
        return
      }

      setUser((prev) =>
        prev
          ? {
              ...prev,
              first_name: editableInfo.first_name,
              last_name: editableInfo.last_name,
              phone: editableInfo.phone,
            }
          : null,
      )

      setIsEditingInfo(false)

      toast({
        title: "Muvaffaqiyat",
        description: "Ma'lumotlar saqlandi",
      })
    } catch (error) {
      console.error("Save user info error:", error)
    }
  }

  const placeOrder = async () => {
    if (!user || cartItems.length === 0) return

    if (!editableInfo.first_name || !editableInfo.phone) {
      toast({
        title: "Xatolik",
        description: "Ism va telefon raqam majburiy",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const totalAmount = getTotalAmount()

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: totalAmount,
          delivery_address: deliveryAddress || null,
          phone: editableInfo.phone,
          notes: notes || null,
          status: "pending",
        })
        .select()
        .single()

      if (orderError) {
        toast({
          title: "Xatolik",
          description: "Buyurtma yaratishda xatolik",
          variant: "destructive",
        })
        return
      }

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: Number.parseFloat(item.product.price.toString()),
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) {
        toast({
          title: "Xatolik",
          description: "Buyurtma elementlarini yaratishda xatolik",
          variant: "destructive",
        })
        return
      }

      // Clear cart
      const { error: clearError } = await supabase.from("cart_items").delete().eq("user_id", user.id)

      if (clearError) {
        console.error("Clear cart error:", clearError)
      }

      toast({
        title: "Muvaffaqiyat",
        description: "Buyurtma muvaffaqiyatli berildi!",
      })

      router.push("/orders")
    } catch (error) {
      console.error("Place order error:", error)
      toast({
        title: "Xatolik",
        description: "Buyurtma berishda xatolik",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("uz-UZ").format(price) + " so'm"
  }

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => {
      return total + Number.parseFloat(item.product.price.toString()) * item.quantity
    }, 0)
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

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Savat bo'sh</h2>
          <p className="text-gray-600 mb-4">Hozircha savatda mahsulotlar yo'q</p>
          <Button onClick={() => router.push("/catalog")}>Katalogga o'tish</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Buyurtma berish</h1>
      </div>

      {/* Cart Items */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Savat ({cartItems.length} mahsulot)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
              <img
                src={item.product.image_url || "/placeholder.svg?height=64&width=64"}
                alt={item.product.name_uz}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-medium">{item.product.name_uz}</h3>
                <p className="text-sm text-gray-600">
                  {formatPrice(Number.parseFloat(item.product.price.toString()))} / {item.product.unit}
                </p>
                {item.product.type === "rent" && (
                  <Badge variant="secondary" className="mt-1">
                    Ijara
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="w-8 h-8 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeCartItem(item.id)}
                  className="w-8 h-8 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* User Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Shaxsiy ma'lumotlar
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (isEditingInfo) {
                  setEditableInfo({
                    first_name: user?.first_name || "",
                    last_name: user?.last_name || "",
                    phone: user?.phone || "",
                  })
                }
                setIsEditingInfo(!isEditingInfo)
              }}
            >
              {isEditingInfo ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditingInfo ? (
            <>
              <div>
                <Label htmlFor="firstName">Ism *</Label>
                <Input
                  id="firstName"
                  value={editableInfo.first_name}
                  onChange={(e) => setEditableInfo((prev) => ({ ...prev, first_name: e.target.value }))}
                  placeholder="Ismingizni kiriting"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Familiya</Label>
                <Input
                  id="lastName"
                  value={editableInfo.last_name}
                  onChange={(e) => setEditableInfo((prev) => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Familiyangizni kiriting"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon raqam *</Label>
                <Input
                  id="phone"
                  value={editableInfo.phone}
                  onChange={(e) => setEditableInfo((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+998901234567"
                />
              </div>
              <Button onClick={saveUserInfo} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Saqlash
              </Button>
            </>
          ) : (
            <>
              <div>
                <Label>Ism va familiya</Label>
                <div className="text-lg font-medium">
                  {editableInfo.first_name} {editableInfo.last_name}
                </div>
              </div>
              <div>
                <Label>Telefon raqam</Label>
                <div className="text-lg font-medium">{editableInfo.phone || "Kiritilmagan"}</div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Delivery Address */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Yetkazib berish manzili
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Yetkazib berish manzilini kiriting (ixtiyoriy)"
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Qo'shimcha izoh</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Buyurtma haqida qo'shimcha ma'lumot (ixtiyoriy)"
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Buyurtma jami</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Mahsulotlar jami:</span>
              <span>{formatPrice(getTotalAmount())}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Jami:</span>
              <span>{formatPrice(getTotalAmount())}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Place Order Button */}
      <Button
        onClick={placeOrder}
        disabled={submitting || !editableInfo.first_name || !editableInfo.phone}
        className="w-full bg-black text-white hover:bg-gray-800 py-3 text-lg font-semibold"
      >
        {submitting ? "Yuklanmoqda..." : "Buyurtma berish"}
      </Button>
    </div>
  )
}
