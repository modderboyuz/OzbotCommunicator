"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/layout/navigation"
import { CategoryNav } from "@/components/layout/category-nav"
import { ProductGrid } from "@/components/product/product-grid"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { CartBar } from "@/components/layout/cart-bar"
import { useAuthStore } from "@/lib/auth-store"
import { supabase } from "@/lib/supabase"

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [searchQuery, setSearchQuery] = useState("")
  const [cartItemsCount, setCartItemsCount] = useState(0)
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      loadCartItemsCount()
    }
  }, [user])

  const loadCartItemsCount = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.from("cart_items").select("quantity").eq("user_id", user.id)

      if (error) throw error

      const totalItems = (data || []).reduce((sum, item) => sum + item.quantity, 0)
      setCartItemsCount(totalItems)
    } catch (error) {
      console.error("Error loading cart items count:", error)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setSelectedCategory(undefined) // Clear category when searching
  }

  const handleOrderClick = () => {
    window.location.href = "/checkout"
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation onSearch={handleSearch} cartItemsCount={cartItemsCount} />

      <main className="pb-20 md:pb-0">
        <CategoryNav selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />

        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">
              {searchQuery
                ? `"${searchQuery}" qidiruv natijalari`
                : selectedCategory
                  ? "Katalog"
                  : "Barcha mahsulotlar"}
            </h1>
            <p className="text-muted-foreground">Qurilish materiallari va jihozlari</p>
          </div>

          <ProductGrid categoryId={selectedCategory} searchQuery={searchQuery} />
        </div>
      </main>

      <BottomNavigation />
      <CartBar onOrderClick={handleOrderClick} />
    </div>
  )
}
