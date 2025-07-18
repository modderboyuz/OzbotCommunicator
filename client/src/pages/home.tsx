"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { Link, useLocation } from "wouter"
import { CategoryNav } from "@/components/layout/category-nav"
import { ProductGrid } from "@/components/product/product-grid"
import { Building2, Wrench, Truck, Zap, Package } from "lucide-react"

const categoryIcons = {
  building: Building2,
  wrench: Wrench,
  truck: Truck,
  zap: Zap,
}

interface Category {
  id: string
  name_uz: string
  icon: string
}

interface Product {
  id: string
  name_uz: string
  description_uz: string
  price: number
  unit: string
  image_url?: string
  is_rental: boolean
}

interface Ad {
  id: string
  title_uz: string
  description_uz: string
  link_url?: string
}

function Categories() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["/api/categories"],
  })

  if (isLoading) {
    return (
      <div className="px-4 py-2 mb-6">
        <div className="flex justify-center">
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="w-12 h-3 mt-2 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 mb-6">
      <div className="flex justify-center">
        <div className="flex space-x-6 overflow-x-auto pb-2 scrollbar-hide">
          {categories?.slice(0, 6).map((category: Category) => {
            const IconComponent = categoryIcons[category.icon as keyof typeof categoryIcons] || Package
            return (
              <Link key={category.id} href={`/catalog?category=${category.id}`}>
                <div className="flex-shrink-0 flex flex-col items-center space-y-2 cursor-pointer group">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <IconComponent className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="text-xs text-gray-700 text-center w-14 truncate">{category.name_uz}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function AdBanner() {
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const { data: ads } = useQuery({
    queryKey: ["/api/ads"],
  })

  // Auto-rotate ads every 3 seconds
  useEffect(() => {
    if (ads && ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [ads])

  if (!ads || ads.length === 0) {
    return null
  }

  const ad = ads[currentAdIndex]

  const handleAdClick = () => {
    if (ad.link_url) {
      window.open(ad.link_url, "_blank")
    }
  }

  return (
    <div className="px-4 mb-6">
      <div
        className="w-full h-20 bg-gradient-to-r from-gray-900 to-gray-700 cursor-pointer overflow-hidden rounded-xl relative"
        onClick={handleAdClick}
      >
        <div className="w-full h-full flex items-center justify-between p-4 text-white">
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">{ad.title_uz}</h3>
            <p className="text-sm text-gray-200">{ad.description_uz}</p>
          </div>
          <div className="ml-4">
            <div className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors">
              Ko'rish
            </div>
          </div>
        </div>

        {/* Dots indicator */}
        {ads.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {ads.map((_: Ad, index: number) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentAdIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [searchQuery, setSearchQuery] = useState("")
  const [location] = useLocation()

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
  }, [location])

  return (
    <div className="min-h-screen bg-gray-50">
      <CategoryNav selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdBanner />
        <Categories />

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {searchQuery ? `"${searchQuery}" qidiruv natijalari` : selectedCategory ? "Katalog" : "Barcha mahsulotlar"}
          </h1>
          <p className="text-gray-600">Qurilish materiallari va jihozlari</p>
        </div>

        <ProductGrid categoryId={selectedCategory} searchQuery={searchQuery} />
      </div>
    </div>
  )
}
