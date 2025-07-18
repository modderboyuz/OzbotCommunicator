import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    const { data: cartItems, error } = await supabase
      .from("cart_items")
      .select(`
        *,
        products (
          id,
          name,
          price,
          image_url,
          is_active
        )
      `)
      .eq("user_id", userId)

    if (error) {
      console.error("Cart fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(cartItems || [])
  } catch (error) {
    console.error("Cart API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, productId, quantity } = body

    if (!userId || !productId || !quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single()

    if (existingItem) {
      // Update quantity
      const { data: updatedItem, error } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id)
        .select()
        .single()

      if (error) {
        console.error("Cart update error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(updatedItem)
    } else {
      // Create new cart item
      const { data: newItem, error } = await supabase
        .from("cart_items")
        .insert({
          user_id: userId,
          product_id: productId,
          quantity,
        })
        .select()
        .single()

      if (error) {
        console.error("Cart creation error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(newItem)
    }
  } catch (error) {
    console.error("Cart API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const productId = searchParams.get("productId")

    if (!userId || !productId) {
      return NextResponse.json({ error: "User ID and Product ID are required" }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    const { error } = await supabase.from("cart_items").delete().eq("user_id", userId).eq("product_id", productId)

    if (error) {
      console.error("Cart deletion error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Cart deletion API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
