import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { token, telegram_data } = await request.json()

    if (!token || !telegram_data) {
      return NextResponse.json({ error: "Token and telegram data are required" }, { status: 400 })
    }

    // Verify token exists and is not expired
    const { data: tokenData, error: tokenError } = await supabase
      .from("temp_login_tokens")
      .select("*")
      .eq("token", token)
      .eq("is_used", false)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    // Mark token as used
    await supabase
      .from("temp_login_tokens")
      .update({
        is_used: true,
        telegram_id: telegram_data.id,
      })
      .eq("token", token)

    // Check if user exists
    let { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", telegram_data.id)
      .single()

    if (userError && userError.code !== "PGRST116") {
      console.error("User lookup error:", userError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    // Create user if doesn't exist
    if (!user) {
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          telegram_id: telegram_data.id,
          username: telegram_data.username,
          first_name: telegram_data.first_name,
          last_name: telegram_data.last_name,
          role: "client",
        })
        .select()
        .single()

      if (createError) {
        console.error("User creation error:", createError)
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
      }

      user = newUser
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        telegram_id: user.telegram_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Telegram verify error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
