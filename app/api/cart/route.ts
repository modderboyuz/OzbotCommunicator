import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const telegramId = request.headers.get("x-telegram-id")
    if (!telegramId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user by telegram ID
    const { data: user } = await supabase.from("users").select("id").eq("telegram_id", Number(telegramId)).single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get cart items with product details
    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        *,
        products (*)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const telegramId = request.headers.get("x-telegram-id")
    if (!telegramId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId, quantity } = await request.json()

    // Get user by telegram ID
    const { data: user } = await supabase.from("users").select("id").eq("telegram_id", Number(telegramId)).single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Add or update cart item
    const { data, error } = await supabase
      .from("cart_items")
      .upsert(
        {
          user_id: user.id,
          product_id: productId,
          quantity: quantity,
        },
        {
          onConflict: "user_id,product_id",
        },
      )
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
