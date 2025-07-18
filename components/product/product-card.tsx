"use client"

import { useState } from "react"
import { Plus, Heart } from "lucide-react"
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

interface ProductCardProps {
  product: Product
  onAddToCart: (productId: string) => void
  onProductClick: (product: Product) => void
}

export function ProductCard({ product, onAddToCart, onProductClick }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [imageError, setImageError] = useState(false)

  const formatPrice = (price: string) => {
    const numPrice = Number.parseFloat(price)
    return new Intl.NumberFormat("uz-UZ").format(numPrice) + " so'm"
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100 cursor-pointer" onClick={() => onProductClick(product)}>
        {!imageError && product.image_url ? (
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.name_uz}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-4xl text-gray-400">📦</div>
          </div>
        )}

        {/* Rental Badge */}
        {product.is_rental && <Badge className="absolute top-2 left-2 bg-orange-500 text-white">Arenda</Badge>}

        {/* Like Button */}
        <Button
          variant="ghost"
          size="sm"
          className={cn("absolute top-2 right-2 p-1 h-auto bg-white/80 hover:bg-white", isLiked && "text-red-500")}
          onClick={(e) => {
            e.stopPropagation()
            setIsLiked(!isLiked)
          }}
        >
          <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
        </Button>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div className="cursor-pointer" onClick={() => onProductClick(product)}>
          <h3 className="font-medium text-sm text-gray-900 line-clamp-2 leading-tight">{product.name_uz}</h3>
          <p className="text-xs text-gray-500 line-clamp-1 mt-1">{product.description_uz}</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-gray-900 text-sm">{formatPrice(product.price)}</span>
            <span className="text-xs text-gray-500 ml-1">/{product.unit}</span>
          </div>

          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart(product.id)
            }}
            className="h-8 w-8 p-0 bg-gray-900 hover:bg-gray-800 rounded-lg"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
