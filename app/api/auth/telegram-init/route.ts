import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { nanoid } from "nanoid"

export async function POST(request: NextRequest) {
  try {
    const { client_id } = await request.json()

    if (!client_id) {
      return NextResponse.json({ error: "Client ID majburiy" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Generate unique token
    const token = nanoid(32)

    // Clean up expired tokens first
    await supabase.from("temp_login_tokens").delete().lt("expires_at", new Date().toISOString())

    // Insert new token
    const { data, error } = await supabase
      .from("temp_login_tokens")
      .insert({
        token,
        client_id,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      })
      .select()
      .single()

    if (error) {
      console.error("Token yaratishda xatolik:", error)
      return NextResponse.json({ error: "Token yaratishda xatolik" }, { status: 500 })
    }

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || "jamolstroybot"
    const telegramUrl = `https://t.me/${botUsername}?start=login_web_${token}_${Date.now()}_${client_id}`

    return NextResponse.json({
      token,
      telegram_url: telegramUrl,
      expires_at: data.expires_at,
    })
  } catch (error) {
    console.error("Telegram OAuth init xatoligi:", error)
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 })
  }
}
