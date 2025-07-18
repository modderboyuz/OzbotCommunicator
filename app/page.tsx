"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuthStore } from "@/lib/auth-store"
import { supabase } from "@/lib/supabase"
import { ShoppingCart, User, Search, Package, Users, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: string
  name_uz: string
  name_ru: string
  description_uz: string
  description_ru: string
  price: number
  image_url: string
  category_id: string
  unit: string
  stock_quantity: number
}

interface Category {
  id: string
  name_uz: string
  name_ru: string
  icon_name: string
  color: string
}

interface CartItem {
  id: string
  product_id: string
  quantity: number
  products: Product
}

export default function HomePage() {
  const { user, isAuthenticated, setUser } = useAuthStore()
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loginToken, setLoginToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
    fetchProducts()
    if (isAuthenticated) {
      fetchCartItems()
    }
  }, [isAuthenticated])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*").eq("is_active", true).order("order_index")

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchProducts = async () => {
    try {
      let query = supabase.from("products").select("*").eq("is_available", true)

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory)
      }

      if (searchQuery) {
        query = query.or(`name_uz.ilike.%${searchQuery}%,name_ru.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const fetchCartItems = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("cart_items")
        .select(`
          *,
          products (*)
        `)
        .eq("user_id", user.id)

      if (error) throw error
      setCartItems(data || [])
    } catch (error) {
      console.error("Error fetching cart items:", error)
    }
  }

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/telegram-init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: Math.random().toString(36).substring(7),
        }),
      })

      const data = await response.json()

      if (data.telegram_url) {
        setLoginToken(data.token)
        window.open(data.telegram_url, "_blank")

        // Start polling for authentication
        const pollInterval = setInterval(async () => {
          try {
            const checkResponse = await fetch("/api/auth/check-token", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ token: data.token }),
            })

            const checkData = await checkResponse.json()

            if (checkData.authenticated && checkData.user) {
              setUser(checkData.user)
              setShowLoginModal(false)
              clearInterval(pollInterval)
              toast({
                title: "Muvaffaqiyatli kirish",
                description: "Telegram orqali muvaffaqiyatli kirdingiz!",
              })
            }
          } catch (error) {
            console.error("Error checking token:", error)
          }
        }, 2000)

        // Stop polling after 10 minutes
        setTimeout(() => {
          clearInterval(pollInterval)
        }, 600000)
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Xatolik",
        description: "Kirish jarayonida xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = async (productId: string, quantity = 1) => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user?.id,
          product_id: productId,
          quantity,
        }),
      })

      if (response.ok) {
        fetchCartItems()
        toast({
          title: "Savatga qo'shildi",
          description: "Mahsulot savatga muvaffaqiyatli qo'shildi",
        })
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Xatolik",
        description: "Savatga qo'shishda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory
    const matchesSearch =
      !searchQuery ||
      product.name_uz.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.name_ru.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => (window.location.href = "/cart")}
                    className="relative"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Savat
                    {cartItems.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                        {cartItems.length}
                      </Badge>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => (window.location.href = "/profile")}>
                    <User className="h-4 w-4 mr-2" />
                    {user?.first_name}
                  </Button>
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

      {/* Navigation */}
      {isAuthenticated && (
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 py-4">
              <Button variant="ghost" onClick={() => (window.location.href = "/")} className="flex items-center">
                <Package className="h-4 w-4 mr-2" />
                Mahsulotlar
              </Button>
              <Button variant="ghost" onClick={() => (window.location.href = "/workers")} className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Ustalar
              </Button>
              <Button variant="ghost" onClick={() => (window.location.href = "/orders")} className="flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Buyurtmalar
              </Button>
            </div>
          </div>
        </nav>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Mahsulot qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button onClick={fetchProducts}>
              <Search className="h-4 w-4 mr-2" />
              Qidirish
            </Button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedCategory("")
                fetchProducts()
              }}
            >
              Barchasi
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedCategory(category.id)
                  fetchProducts()
                }}
              >
                {category.name_uz}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gray-100">
                <img
                  src={product.image_url || "/placeholder.svg?height=300&width=300"}
                  alt={product.name_uz}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{product.name_uz}</CardTitle>
                <p className="text-sm text-gray-600 line-clamp-2">{product.description_uz}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{product.price.toLocaleString()} so'm</p>
                    <p className="text-sm text-gray-500">/{product.unit}</p>
                  </div>
                  <Badge variant="secondary">{product.stock_quantity} ta</Badge>
                </div>
                <Button
                  onClick={() => addToCart(product.id)}
                  className="w-full"
                  disabled={product.stock_quantity === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.stock_quantity === 0 ? "Tugagan" : "Savatga qo'shish"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Mahsulot topilmadi</h3>
            <p className="text-gray-500">Qidiruv so'rovingizga mos mahsulot topilmadi</p>
          </div>
        )}
      </main>

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Telegram orqali kirish</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Tizimga kirish uchun Telegram botimiz orqali ro'yxatdan o'ting</p>
            <Button onClick={handleLogin} disabled={isLoading} className="w-full">
              {isLoading ? "Yuklanmoqda..." : "Telegram orqali kirish"}
            </Button>
            {loginToken && (
              <p className="text-xs text-gray-500 text-center">Telegram botini ochib, ko'rsatmalarga amal qiling</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
