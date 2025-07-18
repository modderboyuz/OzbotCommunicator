import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("category_id")
    const search = searchParams.get("search")

    let query = supabase.from("products").select("*").eq("is_available", true)

    if (categoryId) {
      query = query.eq("category_id", categoryId)
    }

    if (search) {
      query = query.or(`name_uz.ilike.%${search}%,description_uz.ilike.%${search}%`)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
