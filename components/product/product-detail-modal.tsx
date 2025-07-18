"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Package, Minus, Plus } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name_uz: string
  name_ru: string
  description_uz: string
  description_ru: string
  price: number
  unit: string
  image_url?: string
  is_rental: boolean
  stock_quantity: number
}

interface ProductDetailModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
}

export function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)
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
          .update({ quantity: existingItem.quantity + quantity })
          .eq("id", existingItem.id)

        if (error) throw error
      } else {
        // Add new item
        const { error } = await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: product.id,
          quantity: quantity,
        })

        if (error) throw error
      }

      toast({
        title: "Savatga qo'shildi",
        description: `${quantity} ta ${product.name_uz} savatga qo'shildi`,
      })

      onClose()
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

  const incrementQuantity = () => {
    if (quantity < product.stock_quantity) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-left">{product.name_uz}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url || "/placeholder.svg"}
                alt={product.name_uz}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{product.name_uz}</h2>
              {product.name_ru && <p className="text-lg text-muted-foreground mb-4">{product.name_ru}</p>}
            </div>

            <div className="flex items-center gap-2">
              {product.is_rental && <Badge className="bg-orange-500">Ijara</Badge>}
              {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                <Badge variant="destructive">Kam qoldi</Badge>
              )}
              {product.stock_quantity === 0 && <Badge variant="destructive">Tugagan</Badge>}
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Tavsif</h3>
              <p className="text-muted-foreground leading-relaxed">{product.description_uz || "Tavsif mavjud emas"}</p>
              {product.description_ru && (
                <p className="text-muted-foreground leading-relaxed mt-2">{product.description_ru}</p>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Narx:</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
                  <span className="text-sm text-muted-foreground ml-1">/ {product.unit}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Mavjud:</span>
                <span className="font-medium">
                  {product.stock_quantity} {product.unit}
                </span>
              </div>

              {product.stock_quantity > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Miqdor:</span>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                        className="w-8 h-8 p-0 bg-transparent"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={incrementQuantity}
                        disabled={quantity >= product.stock_quantity}
                        className="w-8 h-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Jami:</span>
                    <span className="text-xl font-bold text-primary">{formatPrice(product.price * quantity)}</span>
                  </div>
                </>
              )}
            </div>

            <Separator />

            <Button onClick={addToCart} disabled={loading || product.stock_quantity === 0} className="w-full" size="lg">
              <ShoppingCart className="h-5 w-5 mr-2" />
              {loading
                ? "Qo'shilmoqda..."
                : product.stock_quantity === 0
                  ? "Tugagan"
                  : `Savatga qo'shish (${formatPrice(product.price * quantity)})`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
