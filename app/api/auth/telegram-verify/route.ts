import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ success: false, error: "Token is required" }, { status: 400 })
    }

    // Check token in database
    const { data: tokenData, error: tokenError } = await supabase
      .from("temp_login_tokens")
      .select("*")
      .eq("token", token)
      .eq("is_used", false)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json({ success: false, error: "Invalid or expired token" }, { status: 400 })
    }

    // If no telegram_id yet, return waiting status
    if (!tokenData.telegram_id) {
      return NextResponse.json({ success: false, waiting: true })
    }

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", tokenData.telegram_id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    // Mark token as used
    await supabase.from("temp_login_tokens").update({ is_used: true }).eq("token", token)

    return NextResponse.json({
      success: true,
      user: userData,
    })
  } catch (error) {
    console.error("Telegram verify error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
