import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    let query = supabase
      .from("products")
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .eq("is_active", true)

    if (category && category !== "all") {
      query = query.eq("category_id", category)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: products, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Products fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }

    return NextResponse.json(products || [])
  } catch (error) {
    console.error("Products API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
