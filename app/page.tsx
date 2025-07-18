"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { LoginModal } from "@/components/auth/login-modal"
import { ShoppingCart, Search, User, Package, Users, FileText } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import Link from "next/link"

interface Product {
  id: string
  name_uz: string
  name_ru: string
  price: number
  image_url?: string
  unit: string
  categories?: {
    name_uz: string
    color: string
  }
}

interface Category {
  id: string
  name_uz: string
  name_ru: string
  color: string
  icon_name?: string
}

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { user, isAuthenticated } = useAuthStore()

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories")
      if (!response.ok) throw new Error("Failed to fetch categories")
      return response.json()
    },
  })

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products", selectedCategory, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (selectedCategory) params.append("category_id", selectedCategory)
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/products?${params}`)
      if (!response.ok) throw new Error("Failed to fetch products")
      return response.json()
    },
  })

  const addToCart = async (productId: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-telegram-id": user?.telegram_id?.toString() || "",
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
        }),
      })

      if (response.ok) {
        // Show success message
        console.log("Mahsulot savatga qo'shildi")
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">MetalBaza</h1>
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link href="/cart">
                    <Button variant="outline" size="sm">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Savat
                    </Button>
                  </Link>
                  <Link href="/orders">
                    <Button variant="outline" size="sm">
                      <Package className="h-4 w-4 mr-2" />
                      Buyurtmalar
                    </Button>
                  </Link>
                  <Link href="/workers">
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      Ustalar
                    </Button>
                  </Link>
                  <Link href="/worker-applications">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Arizalar
                    </Button>
                  </Link>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{user?.first_name}</span>
                  </div>
                </>
              ) : (
                <Button onClick={() => setShowLoginModal(true)}>
                  <User className="h-4 w-4 mr-2" />
                  Kirish
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Mahsulotlarni qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Kategoriyalar</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              size="sm"
            >
              Barchasi
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                size="sm"
                style={{
                  backgroundColor: selectedCategory === category.id ? category.color : undefined,
                  borderColor: category.color,
                }}
              >
                {category.name_uz}
              </Button>
            ))}
          </div>
        </div>

        {/* Products */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gray-100">
                <img
                  src={product.image_url || "/placeholder.svg?height=300&width=300"}
                  alt={product.name_uz}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name_uz}</h3>
                {product.categories && (
                  <Badge
                    variant="secondary"
                    className="mb-2"
                    style={{ backgroundColor: product.categories.color + "20", color: product.categories.color }}
                  >
                    {product.categories.name_uz}
                  </Badge>
                )}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{product.price.toLocaleString()} so'm</p>
                    <p className="text-sm text-gray-500">/{product.unit}</p>
                  </div>
                  <Button onClick={() => addToCart(product.id)} size="sm">
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Qo'shish
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Mahsulotlar topilmadi</p>
          </div>
        )}
      </div>

      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  )
}
