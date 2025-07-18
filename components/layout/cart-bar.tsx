"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/lib/auth-store"
import { supabase } from "@/lib/supabase"

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name_uz: string
    price: number
    unit: string
  }
}

interface CartBarProps {
  onOrderClick?: () => void
}

export function CartBar({ onOrderClick }: CartBarProps) {
  const { user } = useAuthStore()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadCartItems()
    }
  }, [user])

  const loadCartItems = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          id,
          quantity,
          product:products(
            id,
            name_uz,
            price,
            unit
          )
        `)
        .eq("user_id", user.id)

      if (error) throw error

      setCartItems(data || [])
      setIsVisible((data || []).length > 0)
    } catch (error) {
      console.error("Error loading cart items:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalAmount = () => {
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

  if (!user || !isVisible || cartItems.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 md:bottom-4">
      <div className="bg-primary text-primary-foreground rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />
              <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-background text-foreground">
                {getTotalItems()}
              </Badge>
            </div>
            <div>
              <p className="font-medium">{getTotalItems()} ta mahsulot</p>
              <p className="text-sm opacity-90">{formatPrice(getTotalAmount())}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onOrderClick}
              className="bg-background text-foreground hover:bg-background/90"
            >
              Buyurtma berish
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
