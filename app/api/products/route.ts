import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category_id = searchParams.get("category_id")
    const search = searchParams.get("search")

    const supabase = createServerSupabaseClient()

    let query = supabase
      .from("products")
      .select(`
        *,
        categories:category_id (
          id,
          name_uz,
          name_ru,
          color
        )
      `)
      .eq("is_available", true)
      .order("created_at", { ascending: false })

    if (category_id) {
      query = query.eq("category_id", category_id)
    }

    if (search) {
      query = query.or(
        `name_uz.ilike.%${search}%,name_ru.ilike.%${search}%,description_uz.ilike.%${search}%,description_ru.ilike.%${search}%`,
      )
    }

    const { data: products, error } = await query

    if (error) {
      console.error("Products fetch error:", error)
      return NextResponse.json({ error: "Mahsulotlarni olishda xatolik" }, { status: 500 })
    }

    return NextResponse.json(products || [])
  } catch (error) {
    console.error("Products API error:", error)
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 })
  }
}
