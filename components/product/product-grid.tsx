"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "./product-card"
import { ProductDetailModal } from "./product-detail-modal"
import { supabase } from "@/lib/supabase"
import { Package } from "lucide-react"

interface Product {
  id: string
  name_uz: string
  name_ru: string
  description_uz: string
  description_ru: string
  price: number
  unit: string
  image_url?: string
  category_id: string
  is_rental: boolean
  stock_quantity: number
}

interface ProductGridProps {
  categoryId?: string
  searchQuery?: string
}

export function ProductGrid({ categoryId, searchQuery }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  useEffect(() => {
    loadProducts()
  }, [categoryId, searchQuery])

  const loadProducts = async () => {
    try {
      setLoading(true)
      let query = supabase.from("products").select("*").eq("is_available", true)

      if (categoryId) {
        query = query.eq("category_id", categoryId)
      }

      if (searchQuery) {
        query = query.or(
          `name_uz.ilike.%${searchQuery}%,name_ru.ilike.%${searchQuery}%,description_uz.ilike.%${searchQuery}%`,
        )
      }

      const { data, error } = await query.order("created_at", { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-card rounded-lg border p-4 animate-pulse">
            <div className="aspect-square bg-muted rounded-lg mb-4" />
            <div className="h-4 bg-muted rounded mb-2" />
            <div className="h-3 bg-muted rounded mb-4 w-3/4" />
            <div className="h-8 bg-muted rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Mahsulotlar topilmadi</h3>
        <p className="text-muted-foreground">
          {searchQuery
            ? `"${searchQuery}" so'rovi bo'yicha natija topilmadi`
            : "Bu kategoriyada hozircha mahsulotlar yo'q"}
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onViewDetails={() => setSelectedProduct(product)} />
        ))}
      </div>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  )
}
