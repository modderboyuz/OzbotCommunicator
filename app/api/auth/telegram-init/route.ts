import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { telegram_id } = await request.json()

    if (!telegram_id) {
      return NextResponse.json({ error: "Telegram ID required" }, { status: 400 })
    }

    // Check if user exists
    const { data: user, error } = await supabase.from("users").select("*").eq("telegram_id", telegram_id).single()

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate a simple token (in production, use JWT)
    const token = `tg_${telegram_id}_${Date.now()}`

    return NextResponse.json({
      user,
      token,
      expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
