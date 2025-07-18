"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  name_uz: string
  name_ru: string
  icon: string
  color: string
}

interface CategoryNavProps {
  selectedCategory?: string
  onCategoryChange?: (categoryId: string | undefined) => void
}

export function CategoryNav({ selectedCategory, onCategoryChange }: CategoryNavProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*").eq("is_active", true).order("order_index")

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Error loading categories:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="border-b bg-background">
        <div className="container mx-auto px-4">
          <div className="flex space-x-2 py-4 overflow-x-auto">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 w-20 bg-muted rounded-md animate-pulse flex-shrink-0" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-b bg-background sticky top-16 z-40">
      <div className="container mx-auto px-4">
        <div className="flex space-x-2 py-4 overflow-x-auto scrollbar-hide">
          <Button
            variant={selectedCategory === undefined ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange?.(undefined)}
            className="flex-shrink-0"
          >
            Barchasi
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange?.(category.id)}
              className={cn("flex-shrink-0", selectedCategory === category.id && "shadow-md")}
              style={{
                backgroundColor: selectedCategory === category.id ? category.color : undefined,
                borderColor: category.color,
                color: selectedCategory === category.id ? "white" : category.color,
              }}
            >
              {category.name_uz}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
