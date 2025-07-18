"use client"

import type * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuthStore } from "@/lib/auth-store"

interface Product {
  id: string
  name_uz: string
  description_uz: string
  price: string
  unit: string
  image_url?: string
  is_rental?: boolean
}

interface ProductCardProps {
  product: Product
  onAddToCart?: (productId: string) => void
  onProductClick?: (product: Product) => void
}

export function ProductCard({ product, onAddToCart, onProductClick }: ProductCardProps) {
  const { user } = useAuthStore()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      alert("Iltimos, avval tizimga kiring!")
      return
    }
    onAddToCart?.(product.id)
  }

  const handleProductClick = () => {
    onProductClick?.(product)
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("uz-UZ").format(Number(price)) + " so'm"
  }

  const placeholderImage =
    "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"

  return (
    <Card
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200 group cursor-pointer"
      onClick={handleProductClick}
    >
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        <img
          src={product.image_url || placeholderImage}
          alt={product.name_uz}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = placeholderImage
          }}
        />
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{product.name_uz}</h3>

        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description_uz}</p>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>

          <Button
            size="sm"
            onClick={handleAddToCart}
            className="text-xs bg-black hover:bg-gray-800 text-white px-3 py-1 rounded-lg transition-colors"
          >
            {product.is_rental ? "Buyurtma" : "Savat"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
