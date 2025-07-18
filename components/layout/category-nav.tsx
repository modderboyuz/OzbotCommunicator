"use client"

import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  name_uz: string
  icon?: string
  description_uz?: string
}

interface CategoryNavProps {
  selectedCategory?: string
  onCategoryChange: (categoryId: string | undefined) => void
}

export function CategoryNav({ selectedCategory, onCategoryChange }: CategoryNavProps) {
  const [categories, setCategories] = React.useState<Category[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setIsLoading(true)

      // Use API route instead of direct Supabase call
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
        { id: "1", name_uz: "Temir-beton", icon: "🏗️" },
        { id: "2", name_uz: "Metalloprokat", icon: "🔧" },
        { id: "3", name_uz: "Polimerlar", icon: "🧪" },
        { id: "4", name_uz: "Asbest-sement", icon: "🏠" },
        { id: "5", name_uz: "Jihozlar", icon: "⚙️" },
        { id: "6", name_uz: "Arenda", icon: "📅" },
      ]
      setCategories(mockCategories)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <nav className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 flex flex-col items-center space-y-2">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="w-16 h-4" />
              </div>
            ))}
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white border-b border-gray-200 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide pl-4">
          {/* All categories button */}
          <button
            onClick={() => onCategoryChange(undefined)}
            className={cn(
              "flex-shrink-0 flex flex-col items-center space-y-1 group",
              !selectedCategory && "text-gray-900",
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                selectedCategory ? "bg-gray-100 group-hover:bg-gray-200" : "bg-gray-900",
              )}
            >
              <span className={cn("text-lg", selectedCategory ? "text-gray-700" : "text-white")}>🏪</span>
            </div>
            <span className="text-xs font-medium">Hammasi</span>
          </button>

          {categories?.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "flex-shrink-0 flex flex-col items-center space-y-1 group",
                selectedCategory === category.id && "text-gray-900",
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                  selectedCategory === category.id ? "bg-gray-900" : "bg-gray-100 group-hover:bg-gray-200",
                )}
              >
                <span className={cn("text-lg", selectedCategory === category.id ? "text-white" : "text-gray-700")}>
                  {category.icon || "📦"}
                </span>
              </div>
              <span className="text-xs font-medium text-center max-w-16 truncate">{category.name_uz}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
