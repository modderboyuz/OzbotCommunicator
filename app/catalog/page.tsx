"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/layout/navigation"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { CartBar } from "@/components/layout/cart-bar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Package, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface Category {
  id: string
  name_uz: string
  name_ru: string
  description_uz?: string
  description_ru?: string
  icon_name?: string
  color?: string
  order_index: number
}

export default function CatalogPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/categories")
      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }
      const data = await response.json()
      setCategories(data || [])
    } catch (error) {
      console.error("Error loading categories:", error)
      // Fallback to mock data
      const mockCategories: Category[] = [
        {
          id: "1",
          name_uz: "Temir-beton",
          name_ru: "Железобетон",
          description_uz: "Qurilish uchun temir-beton mahsulotlari",
          description_ru: "Железобетонные изделия для строительства",
          icon_name: "🏗️",
          color: "#FF6B35",
          order_index: 1,
        },
        {
          id: "2",
          name_uz: "Metalloprokat",
          name_ru: "Металлопрокат",
          description_uz: "Har xil metall mahsulotlar",
          description_ru: "Различные металлические изделия",
          icon_name: "🔧",
          color: "#004E89",
          order_index: 2,
        },
        {
          id: "3",
          name_uz: "Polimerlar",
          name_ru: "Полимеры",
          description_uz: "Plastik va polimer mahsulotlar",
          description_ru: "Пластиковые и полимерные изделия",
          icon_name: "🧪",
          color: "#009639",
          order_index: 3,
        },
        {
          id: "4",
          name_uz: "Asbest-sement",
          name_ru: "Асбест-цемент",
          description_uz: "Asbest-sement mahsulotlari",
          description_ru: "Асбестоцементные изделия",
          icon_name: "🏠",
          color: "#7209B7",
          order_index: 4,
        },
        {
          id: "5",
          name_uz: "Jihozlar",
          name_ru: "Оборудование",
          description_uz: "Qurilish jihozlari va asboblar",
          description_ru: "Строительное оборудование и инструменты",
          icon_name: "⚙️",
          color: "#F18F01",
          order_index: 5,
        },
        {
          id: "6",
          name_uz: "Arenda",
          name_ru: "Аренда",
          description_uz: "Ijaraga beriladigan jihozlar",
          description_ru: "Оборудование в аренду",
          icon_name: "📅",
          color: "#C73E1D",
          order_index: 6,
        },
      ]
      setCategories(mockCategories)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCategories = categories.filter(
    (category) =>
      category.name_uz.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.name_ru.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description_uz?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/?category=${categoryId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Katalog</h1>
          <p className="text-gray-600">Barcha qurilish materiallari kategoriyalari</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Kategoriyalar topilmadi</h3>
            <p className="text-gray-600">
              {searchQuery
                ? `"${searchQuery}" so'rovi bo'yicha kategoriya topilmadi`
                : "Hozircha kategoriyalar mavjud emas"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <Card
                key={category.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleCategoryClick(category.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
                      style={{ backgroundColor: category.color || "#3B82F6" }}
                    >
                      {category.icon_name || "📦"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {category.name_uz}
                        </h3>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <p className="text-sm text-gray-500 mb-1">{category.name_ru}</p>
                      {category.description_uz && (
                        <p className="text-sm text-gray-600 line-clamp-2">{category.description_uz}</p>
                      )}
                      <div className="mt-3">
                        <Badge variant="secondary" className="text-xs">
                          Kategoriya
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <CartBar />
      <BottomNavigation />
    </div>
  )
}
