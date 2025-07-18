"use client"

import * as React from "react"
import { ProductCard } from "./product-card"
import { ProductDetailModal } from "./product-detail-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

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

interface ProductGridProps {
  categoryId?: string
  searchQuery?: string
}

export function ProductGrid({ categoryId, searchQuery }: ProductGridProps) {
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [products, setProducts] = React.useState<Product[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    loadProducts()
  }, [categoryId, searchQuery])

  const loadProducts = async () => {
    setIsLoading(true)
    try {
      // Use API route instead of direct Supabase call
      const params = new URLSearchParams()
      if (categoryId) params.append("category_id", categoryId)
      if (searchQuery) params.append("search", searchQuery)

      const response = await fetch(`/api/products?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }

      const data = await response.json()

      // Convert to expected format
      const formattedProducts = (data || []).map((product: any) => ({
        ...product,
        price: product.price.toString(),
        is_rental: product.type === "rent",
      }))

      setProducts(formattedProducts)
    } catch (error) {
      console.error("Error loading products:", error)
      // Fallback to mock data
      const mockProducts: Product[] = [
        {
          id: "1",
          name_uz: "Armaturniy prutok 12mm",
          description_uz: "Yuqori sifatli po'lat armatura",
          price: "15000",
          unit: "metr",
          category_id: "1",
        },
        {
          id: "2",
          name_uz: "Sement M400",
          description_uz: "Qurilish uchun sement",
          price: "45000",
          unit: "qop",
          category_id: "1",
        },
        {
          id: "3",
          name_uz: "Metalloprokat truba",
          description_uz: "Galvanizlangan truba",
          price: "25000",
          unit: "metr",
          category_id: "2",
        },
      ]

      let filteredProducts = mockProducts

      if (categoryId) {
        filteredProducts = filteredProducts.filter((p) => p.category_id === categoryId)
      }

      if (searchQuery) {
        filteredProducts = filteredProducts.filter(
          (p) =>
            p.name_uz.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description_uz.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      }

      setProducts(filteredProducts)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = (productId: string, quantity = 1) => {
    console.log("Add to cart:", productId, quantity)
  }

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-8 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Mahsulotlar topilmadi</h3>
        <p className="text-gray-600">
          {searchQuery ? "Qidiruv bo'yicha natija yo'q" : "Ushbu kategoriyada mahsulotlar yo'q"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={(productId) => handleAddToCart(productId, 1)}
            onProductClick={handleProductClick}
          />
        ))}
      </div>

      {products.length >= 20 && (
        <div className="text-center">
          <Button variant="outline" size="lg" className="px-8 py-3 rounded-xl bg-transparent">
            Ko'proq mahsulotlar
          </Button>
        </div>
      )}

      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddToCart={handleAddToCart}
        onProductClick={handleProductClick}
      />
    </div>
  )
}
