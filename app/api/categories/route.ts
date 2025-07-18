import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true })

    if (error) {
      console.error("Categories fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(categories || [])
  } catch (error) {
    console.error("Categories API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
