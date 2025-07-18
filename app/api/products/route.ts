import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category_id = searchParams.get("category_id")
    const search = searchParams.get("search")

    let query = supabase.from("products").select("*").eq("is_available", true)

    if (category_id) {
      query = query.eq("category_id", category_id)
    }

    if (search) {
      query = query.or(`name_uz.ilike.%${search}%,name_ru.ilike.%${search}%`)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Products fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Products API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
