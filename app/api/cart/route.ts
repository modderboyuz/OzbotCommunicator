import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Get user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: cartItems, error } = await supabase
      .from("cart")
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
      .eq("user_id", user.id)

    if (error) {
      console.error("Cart fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
    }

    return NextResponse.json(cartItems || [])
  } catch (error) {
    console.error("Cart API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Get user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { product_id, quantity } = body

    // Check if item already exists in cart
    const { data: existingItem, error: checkError } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", product_id)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Cart check error:", checkError)
      return NextResponse.json({ error: "Failed to check cart" }, { status: 500 })
    }

    let result
    if (existingItem) {
      // Update existing item
      const { data, error } = await supabase
        .from("cart")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id)
        .select()
        .single()

      result = data
      if (error) {
        console.error("Cart update error:", error)
        return NextResponse.json({ error: "Failed to update cart" }, { status: 500 })
      }
    } else {
      // Create new item
      const { data, error } = await supabase
        .from("cart")
        .insert({
          user_id: user.id,
          product_id,
          quantity,
        })
        .select()
        .single()

      result = data
      if (error) {
        console.error("Cart creation error:", error)
        return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 })
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Cart POST API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Get user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("id")

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("cart").delete().eq("id", itemId).eq("user_id", user.id)

    if (error) {
      console.error("Cart delete error:", error)
      return NextResponse.json({ error: "Failed to remove from cart" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Cart DELETE API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
