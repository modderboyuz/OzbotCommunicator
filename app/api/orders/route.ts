import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (
            id,
            name_uz,
            name_ru,
            image_url
          )
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Orders fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(orders || [])
  } catch (error) {
    console.error("Orders API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, items, totalAmount, deliveryAddress, phone, customerName, notes } = body

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        total_amount: totalAmount,
        status: "pending",
        delivery_address: deliveryAddress,
        phone: phone,
        customer_name: customerName,
        notes: notes,
      })
      .select()
      .single()

    if (orderError) {
      console.error("Order creation error:", orderError)
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      product_name: item.product_name,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("Order items creation error:", itemsError)
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    // Clear cart
    await supabase.from("cart_items").delete().eq("user_id", userId)

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (error) {
    console.error("Order creation API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
