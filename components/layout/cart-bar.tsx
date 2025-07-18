"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface CartItem {
  id: string
  product_id: string
  quantity: number
  product: {
    name_uz: string
    price: number
    unit: string
  }
}

export function CartBar() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadCartItems()
  }, [])

  const loadCartItems = async () => {
    try {
      const telegramId = localStorage.getItem("telegram_id")
      if (!telegramId) return

      const response = await fetch(`/api/cart?telegram_id=${telegramId}`)
      if (response.ok) {
        const data = await response.json()
        setCartItems(data || [])
        setIsVisible(data && data.length > 0)
      }
    } catch (error) {
      console.error("Error loading cart:", error)
    }
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity
    }, 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("uz-UZ").format(price) + " so'm"
  }

  if (!isVisible || cartItems.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 z-40 md:bottom-4">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5 text-gray-700" />
            <span className="font-medium text-gray-900">Savatcha ({getTotalItems()} ta mahsulot)</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)} className="p-1 h-auto">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
          {cartItems.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div className="flex-1">
                <span className="text-gray-900">{item.product.name_uz}</span>
                <span className="text-gray-500 ml-2">
                  {item.quantity} {item.product.unit}
                </span>
              </div>
              <span className="font-medium text-gray-900">{formatPrice(item.product.price * item.quantity)}</span>
            </div>
          ))}
          {cartItems.length > 3 && (
            <div className="text-sm text-gray-500 text-center">va yana {cartItems.length - 3} ta mahsulot...</div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div>
            <span className="text-sm text-gray-600">Jami summa:</span>
            <div className="font-bold text-lg text-gray-900">{formatPrice(getTotalPrice())}</div>
          </div>
          <Button
            onClick={() => router.push("/checkout")}
            className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-lg"
          >
            Buyurtma berish
          </Button>
        </div>
      </div>
    </div>
  )
}
