import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("category")
    const search = searchParams.get("search")

    const supabase = createServerSupabaseClient()

    let query = supabase
      .from("products")
      .select(`
        *,
        categories (
          id,
          name_uz,
          name_ru
        )
      `)
      .eq("is_available", true)

    if (categoryId) {
      query = query.eq("category_id", categoryId)
    }

    if (search) {
      query = query.or(
        `name_uz.ilike.%${search}%,name_ru.ilike.%${search}%,description_uz.ilike.%${search}%,description_ru.ilike.%${search}%`,
      )
    }

    const { data: products, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Products fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(products || [])
  } catch (error) {
    console.error("Products API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
