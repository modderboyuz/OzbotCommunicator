"use client"

import { useState } from "react"
import { X, Plus, Minus, Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name_uz: string
  description_uz: string
  price: string
  unit: string
  image_url?: string
  category_id: string
  is_rental?: boolean
}

interface ProductDetailModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (productId: string, quantity: number) => void
  onProductClick: (product: Product) => void
}

export function ProductDetailModal({ product, isOpen, onClose, onAddToCart, onProductClick }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [isLiked, setIsLiked] = useState(false)
  const [imageError, setImageError] = useState(false)

  if (!isOpen || !product) return null

  const formatPrice = (price: string) => {
    const numPrice = Number.parseFloat(price)
    return new Intl.NumberFormat("uz-UZ").format(numPrice) + " so'm"
  }

  const getTotalPrice = () => {
    const numPrice = Number.parseFloat(product.price)
    return new Intl.NumberFormat("uz-UZ").format(numPrice * quantity) + " so'm"
  }

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta
    if (newQuantity >= 1) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    onAddToCart(product.id, quantity)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center md:justify-center">
      <div className="bg-white w-full max-w-lg mx-auto rounded-t-2xl md:rounded-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Mahsulot haqida</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Image */}
          <div className="relative aspect-square bg-gray-100">
            {!imageError && product.image_url ? (
              <img
                src={product.image_url || "/placeholder.svg"}
                alt={product.name_uz}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-6xl text-gray-400">📦</div>
              </div>
            )}

            {/* Rental Badge */}
            {product.is_rental && <Badge className="absolute top-4 left-4 bg-orange-500 text-white">Arenda</Badge>}

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className={cn("p-2 bg-white/80 hover:bg-white", isLiked && "text-red-500")}
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 bg-white/80 hover:bg-white">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4 space-y-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">{product.name_uz}</h1>
              <p className="text-gray-600 text-sm leading-relaxed">{product.description_uz}</p>
            </div>

            {/* Price */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                  <span className="text-gray-500 ml-2">/{product.unit}</span>
                </div>
                {product.is_rental && (
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    Kunlik narx
                  </Badge>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Miqdor</label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 h-10 w-10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleQuantityChange(1)} className="p-2 h-10 w-10">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-gray-500">{product.unit}</span>
              </div>
            </div>

            {/* Total Price */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Jami summa:</span>
                <span className="text-xl font-bold text-blue-600">{getTotalPrice()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white">
          <Button
            onClick={handleAddToCart}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl font-medium"
          >
            Savatga qo'shish
          </Button>
        </div>
      </div>
    </div>
  )
}
