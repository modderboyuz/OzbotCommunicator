import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { token, telegram_id } = await request.json()

    if (!token || !telegram_id) {
      return NextResponse.json({ error: "Token va Telegram ID majburiy" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Check if token is valid and not expired
    const { data: tokenData, error: tokenError } = await supabase
      .from("temp_login_tokens")
      .select("*")
      .eq("token", token)
      .eq("is_used", false)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: "Token yaroqsiz yoki muddati tugagan" }, { status: 400 })
    }

    // Mark token as used
    await supabase
      .from("temp_login_tokens")
      .update({
        is_used: true,
        telegram_id: Number.parseInt(telegram_id),
      })
      .eq("id", tokenData.id)

    // Get user by telegram_id
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", Number.parseInt(telegram_id))
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user,
      client_id: tokenData.client_id,
    })
  } catch (error) {
    console.error("Telegram verify xatoligi:", error)
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 })
  }
}
