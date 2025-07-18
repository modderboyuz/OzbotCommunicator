import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get("user_id")

    if (!user_id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        *,
        products (*)
      `)
      .eq("user_id", user_id)

    if (error) {
      console.error("Cart fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch cart items" }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Cart API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user_id, product_id, quantity } = await request.json()

    if (!user_id || !product_id || !quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user_id)
      .eq("product_id", product_id)
      .single()

    if (existingItem) {
      // Update quantity
      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id)
        .select()
        .single()

      if (error) {
        console.error("Cart update error:", error)
        return NextResponse.json({ error: "Failed to update cart item" }, { status: 500 })
      }

      return NextResponse.json(data)
    } else {
      // Add new item
      const { data, error } = await supabase
        .from("cart_items")
        .insert({ user_id, product_id, quantity })
        .select()
        .single()

      if (error) {
        console.error("Cart insert error:", error)
        return NextResponse.json({ error: "Failed to add cart item" }, { status: 500 })
      }

      return NextResponse.json(data)
    }
  } catch (error) {
    console.error("Cart POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
