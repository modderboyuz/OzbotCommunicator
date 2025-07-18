"use client"

import { useState, useEffect } from "react"
import { CategoryNav } from "@/components/layout/category-nav"
import { ProductGrid } from "@/components/product/product-grid"
import { Navigation } from "@/components/layout/navigation"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { CartBar } from "@/components/layout/cart-bar"

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

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [searchQuery, setSearchQuery] = useState("")

  // Get search query from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const categoryParam = urlParams.get("category")
    const searchParam = urlParams.get("search")

    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }

    if (searchParam) {
      setSearchQuery(searchParam)
    }
  }, [])

  const handleCartOrder = () => {
    window.location.href = "/checkout"
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="pb-20 md:pb-0">
        <div className="min-h-screen bg-gray-50">
          <CategoryNav selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {searchQuery
                  ? `"${searchQuery}" qidiruv natijalari`
                  : selectedCategory
                    ? "Katalog"
                    : "Barcha mahsulotlar"}
              </h1>
              <p className="text-gray-600">Qurilish materiallari va jihozlari</p>
            </div>

            <ProductGrid categoryId={selectedCategory} searchQuery={searchQuery} />
          </div>
        </div>
      </main>
      <BottomNavigation />
      <CartBar onOrderClick={handleCartOrder} />
    </div>
  )
}
