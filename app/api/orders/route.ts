import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const telegram_id = request.headers.get("x-telegram-id")

    if (!telegram_id) {
      return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Get user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("telegram_id", Number.parseInt(telegram_id))
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 })
    }

    // Get orders with order items
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products:product_id (
            id,
            name_uz,
            name_ru,
            image_url
          )
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Orders fetch error:", error)
      return NextResponse.json({ error: "Buyurtmalarni olishda xatolik" }, { status: 500 })
    }

    return NextResponse.json(orders || [])
  } catch (error) {
    console.error("Orders API error:", error)
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const telegram_id = request.headers.get("x-telegram-id")
    const { customer_name, phone, delivery_address, notes, cart_items } = await request.json()

    if (!telegram_id) {
      return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 })
    }

    if (!customer_name || !phone || !cart_items || cart_items.length === 0) {
      return NextResponse.json({ error: "Majburiy maydonlarni to'ldiring" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Get user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("telegram_id", Number.parseInt(telegram_id))
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 })
    }

    // Calculate total amount
    const total_amount = cart_items.reduce((sum: number, item: any) => {
      return sum + item.products.price * item.quantity
    }, 0)

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        customer_name,
        phone,
        delivery_address,
        notes,
        total_amount,
        status: "pending",
      })
      .select()
      .single()

    if (orderError) {
      console.error("Order creation error:", orderError)
      return NextResponse.json({ error: "Buyurtma yaratishda xatolik" }, { status: 500 })
    }

    // Create order items
    const orderItems = cart_items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products.price,
      product_name: item.products.name_uz,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("Order items creation error:", itemsError)
      return NextResponse.json({ error: "Buyurtma elementlarini yaratishda xatolik" }, { status: 500 })
    }

    // Clear cart
    await supabase.from("cart_items").delete().eq("user_id", user.id)

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error("Orders POST error:", error)
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 })
  }
}
