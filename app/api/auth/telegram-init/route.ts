import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { client_id } = await request.json()

    if (!client_id) {
      return NextResponse.json({ success: false, error: "Client ID is required" }, { status: 400 })
    }

    // Generate a unique token
    const token = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Store token in database
    const { error } = await supabase.from("temp_login_tokens").insert({
      token,
      client_id,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ success: false, error: "Failed to create token" }, { status: 500 })
    }

    // Create Telegram bot URL
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || "MetalBazaBot"
    const telegramUrl = `https://t.me/${botUsername}?start=${token}`

    return NextResponse.json({
      success: true,
      token,
      telegram_url: telegramUrl,
    })
  } catch (error) {
    console.error("Telegram init error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
