"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Eye, Package } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name_uz: string
  name_ru: string
  description_uz: string
  price: number
  unit: string
  image_url?: string
  is_rental: boolean
  stock_quantity: number
}

interface ProductCardProps {
  product: Product
  onViewDetails?: () => void
}

export function ProductCard({ product, onViewDetails }: ProductCardProps) {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("uz-UZ").format(price) + " so'm"
  }

  const addToCart = async () => {
    if (!user) {
      toast({
        title: "Kirish talab qilinadi",
        description: "Savatga qo'shish uchun tizimga kiring",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .single()

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id)

        if (error) throw error
      } else {
        // Add new item
        const { error } = await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: product.id,
          quantity: 1,
        })

        if (error) throw error
      }

      toast({
        title: "Savatga qo'shildi",
        description: `${product.name_uz} savatga qo'shildi`,
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Xatolik",
        description: "Savatga qo'shishda xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
      <CardContent className="p-0">
        <div className="aspect-square bg-muted relative overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.name_uz}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          {product.is_rental && <Badge className="absolute top-2 left-2 bg-orange-500">Ijara</Badge>}

          {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Kam qoldi
            </Badge>
          )}

          {product.stock_quantity === 0 && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Tugagan
            </Badge>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button
              variant="secondary"
              size="sm"
              onClick={onViewDetails}
              className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ko'rish
            </Button>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name_uz}
          </h3>
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description_uz}</p>

          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
              <span className="text-sm text-muted-foreground ml-1">/ {product.unit}</span>
            </div>
            {product.stock_quantity > 0 && <Badge variant="secondary">{product.stock_quantity} ta</Badge>}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button onClick={addToCart} disabled={loading || product.stock_quantity === 0} className="w-full" size="sm">
          <ShoppingCart className="h-4 w-4 mr-2" />
          {loading ? "Qo'shilmoqda..." : product.stock_quantity === 0 ? "Tugagan" : "Savatga qo'shish"}
        </Button>
      </CardFooter>
    </Card>
  )
}
