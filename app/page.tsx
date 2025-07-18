"use client"

import { useState } from "react"
import { Navigation } from "@/components/layout/navigation"
import { CategoryNav } from "@/components/layout/category-nav"
import { ProductGrid } from "@/components/product/product-grid"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { CartBar } from "@/components/layout/cart-bar"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <CategoryNav selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <ProductGrid categoryId={selectedCategory} searchQuery={searchQuery} />
      </main>

      <CartBar />
      <BottomNavigation />
    </div>
  )
}
