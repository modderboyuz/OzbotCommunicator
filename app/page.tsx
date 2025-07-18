"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuthStore } from "@/lib/auth-store"
import { supabase } from "@/lib/supabase"
import { Search, ShoppingCart, User, Package } from "lucide-react"

interface Product {
  id: string
  name_uz: string
  description_uz: string
  price: number
  unit: string
  image_url?: string
  category_id: string
}

interface Category {
  id: string
  name_uz: string
  description_uz?: string
}

export default function HomePage() {
  const { user, loginWithTelegram } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for Telegram authentication
    const urlParams = new URLSearchParams(window.location.search)
    const telegramId = urlParams.get("telegram_id")

    if (telegramId && !user) {
      loginWithTelegram(Number(telegramId))
    }

    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load categories
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("order_index")

      if (categoriesData) {
        setCategories(categoriesData)
      }

      // Load products
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: false })

      if (productsData) {
        setProducts(productsData)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory
    const matchesSearch =
      !searchQuery ||
      product.name_uz.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description_uz.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  const addToCart = async (productId: string) => {
    if (!user) {
      alert("Iltimos, avval tizimga kiring!")
      return
    }

    try {
      const { error } = await supabase.from("cart_items").upsert(
        {
          user_id: user.id,
          product_id: productId,
          quantity: 1,
        },
        {
          onConflict: "user_id,product_id",
        },
      )

      if (error) throw error
      alert("Mahsulot savatga qo'shildi!")
    } catch (error) {
      console.error("Error adding to cart:", error)
      alert("Xatolik yuz berdi!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto mb-4 animate-spin" />
          <p>Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">MetalBaza</h1>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span className="text-sm">{user.first_name}</span>
                </div>
              ) : (
                <Button variant="outline" size="sm">
                  Kirish
                </Button>
              )}
              <Button variant="outline" size="sm">
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Mahsulotlarni qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("")}
            >
              Barchasi
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name_uz}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  {product.image_url ? (
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name_uz}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Package className="h-12 w-12 text-gray-400" />
                  )}
                </div>
                <CardTitle className="text-lg line-clamp-2">{product.name_uz}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description_uz}</p>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-lg font-bold text-blue-600">{product.price.toLocaleString()} so'm</span>
                    <span className="text-sm text-gray-500 ml-1">/ {product.unit}</span>
                  </div>
                </div>
                <Button className="w-full" size="sm" onClick={() => addToCart(product.id)}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Savatga qo'shish
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Mahsulotlar topilmadi</h3>
            <p className="text-gray-500">Qidiruv so'zini o'zgartiring yoki boshqa kategoriyani tanlang</p>
          </div>
        )}
      </div>
    </div>
  )
}
