import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { client_id } = await request.json()

    if (!client_id) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 })
    }

    // Generate temporary token
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36)

    // Store token in database
    const { error } = await supabase.from("temp_login_tokens").insert({
      token,
      client_id,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    })

    if (error) {
      console.error("Error storing token:", error)
      return NextResponse.json({ error: "Failed to create login token" }, { status: 500 })
    }

    // Create Telegram bot URL
    const botUsername = process.env.TELEGRAM_BOT_USERNAME
    const telegramUrl = `https://t.me/${botUsername}?start=login_web_${token}_${Date.now()}_${client_id}`

    return NextResponse.json({
      telegram_url: telegramUrl,
      token,
    })
  } catch (error) {
    console.error("Telegram init error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
