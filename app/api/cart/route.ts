import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { data: cartItems, error } = await supabase
      .from("cart_items")
      .select(`
        *,
        products (
          id,
          name_uz,
          name_ru,
          price,
          image_url,
          unit,
          stock_quantity
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId, quantity } = body

    if (!userId || !productId || !quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .single()

    if (existingItem) {
      // Update quantity
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      // Add new item
      const { error } = await supabase.from("cart_items").insert({
        user_id: userId,
        product_id: productId,
        quantity,
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Add to cart API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { cartItemId, quantity } = body

    if (!cartItemId || quantity === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    if (quantity <= 0) {
      // Remove item
      const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      // Update quantity
      const { error } = await supabase.from("cart_items").update({ quantity }).eq("id", cartItemId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update cart API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cartItemId = searchParams.get("cartItemId")

    if (!cartItemId) {
      return NextResponse.json({ error: "Cart item ID is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Remove from cart API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
