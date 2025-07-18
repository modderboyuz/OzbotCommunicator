"use client"

import { useState } from "react"
import { Navigation } from "@/components/layout/navigation"
import { CategoryNav } from "@/components/layout/category-nav"
import { ProductGrid } from "@/components/product/product-grid"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { CartBar } from "@/components/layout/cart-bar"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function CatalogPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000])
  const [sortBy, setSortBy] = useState<string>("newest")
  const [showFilters, setShowFilters] = useState(false)

  const sortOptions = [
    { value: "newest", label: "Yangi mahsulotlar" },
    { value: "price_low", label: "Arzon narxdan" },
    { value: "price_high", label: "Qimmat narxdan" },
    { value: "popular", label: "Mashhur" },
  ]

  const clearFilters = () => {
    setSelectedCategory(undefined)
    setPriceRange([0, 1000000])
    setSortBy("newest")
    setSearchQuery("")
  }

  const hasActiveFilters = selectedCategory || searchQuery || sortBy !== "newest"

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <CategoryNav selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-32 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filtrlar</span>
              </Button>

              {hasActiveFilters && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Faol filtrlar:</span>
                  {selectedCategory && (
                    <Badge variant="secondary" className="text-xs">
                      Kategoriya
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="secondary" className="text-xs">
                      Qidiruv: {searchQuery}
                    </Badge>
                  )}
                  {sortBy !== "newest" && (
                    <Badge variant="secondary" className="text-xs">
                      Saralash
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Tozalash
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Saralash:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Narx oralig'i (so'm)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Dan"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number.parseInt(e.target.value) || 0, priceRange[1]])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Gacha"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value) || 1000000])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mahsulot turi</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 mr-2" />
                      <span className="text-sm">Sotuvda</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 mr-2" />
                      <span className="text-sm">Arendada</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mavjudlik</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 mr-2" defaultChecked />
                      <span className="text-sm">Mavjud</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 mr-2" />
                      <span className="text-sm">Tugagan</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Katalog</h1>
          <p className="text-gray-600">Barcha qurilish materiallari va jihozlari</p>
        </div>

        <ProductGrid categoryId={selectedCategory} searchQuery={searchQuery} />
      </main>

      <CartBar />
      <BottomNavigation />
    </div>
  )
}
