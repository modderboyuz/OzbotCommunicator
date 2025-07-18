import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

async function getUserFromTelegramId(telegramId: string) {
  const supabase = createServerSupabaseClient()
  const { data: user, error } = await supabase
    .from("users")
    .select("id")
    .eq("telegram_id", Number.parseInt(telegramId))
    .single()

  return { user, error }
}

export async function GET(request: NextRequest) {
  try {
    const telegramId = request.headers.get("x-telegram-id")

    if (!telegramId) {
      return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 })
    }

    const { user, error: userError } = await getUserFromTelegramId(telegramId)

    if (userError || !user) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 })
    }

    const supabase = createServerSupabaseClient()

    const { data: cartItems, error } = await supabase
      .from("cart_items")
      .select(`
        *,
        products:product_id (
          id,
          name_uz,
          name_ru,
          price,
          image_url,
          unit,
          stock_quantity
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Cart fetch error:", error)
      return NextResponse.json({ error: "Savatni olishda xatolik" }, { status: 500 })
    }

    return NextResponse.json(cartItems || [])
  } catch (error) {
    console.error("Cart API error:", error)
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const telegramId = request.headers.get("x-telegram-id")
    const { productId, quantity } = await request.json()

    if (!telegramId) {
      return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 })
    }

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json({ error: "Product ID va miqdor majburiy" }, { status: 400 })
    }

    const { user, error: userError } = await getUserFromTelegramId(telegramId)

    if (userError || !user) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 })
    }

    const supabase = createServerSupabaseClient()

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .single()

    let result
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
        return NextResponse.json({ error: "Savatni yangilashda xatolik" }, { status: 500 })
      }
      result = data
    } else {
      // Add new item
      const { data, error } = await supabase
        .from("cart_items")
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity,
        })
        .select()
        .single()

      if (error) {
        console.error("Cart insert error:", error)
        return NextResponse.json({ error: "Savatga qo'shishda xatolik" }, { status: 500 })
      }
      result = data
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Cart POST error:", error)
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const telegramId = request.headers.get("x-telegram-id")

    if (!telegramId) {
      return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 })
    }

    const { user, error: userError } = await getUserFromTelegramId(telegramId)

    if (userError || !user) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 })
    }

    const supabase = createServerSupabaseClient()

    // Clear cart
    const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id)

    if (error) {
      console.error("Cart clear error:", error)
      return NextResponse.json({ error: "Savatni tozalashda xatolik" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Cart DELETE error:", error)
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 })
  }
}
