import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Check if token is used and get user data
    const { data: tokenData, error } = await supabase
      .from("temp_login_tokens")
      .select("*, users(*)")
      .eq("token", token)
      .eq("is_used", true)
      .single()

    if (error || !tokenData || !tokenData.telegram_id) {
      return NextResponse.json({ authenticated: false })
    }

    // Get user data
    const { data: user } = await supabase.from("users").select("*").eq("telegram_id", tokenData.telegram_id).single()

    if (!user) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({
      authenticated: true,
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
    console.error("Token check error:", error)
    return NextResponse.json({ authenticated: false })
  }
}
