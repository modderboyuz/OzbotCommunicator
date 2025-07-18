import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token || !token.startsWith("tg_")) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    // Extract telegram_id from token
    const parts = token.split("_")
    if (parts.length !== 3) {
      return NextResponse.json({ error: "Invalid token format" }, { status: 400 })
    }

    const telegram_id = Number.parseInt(parts[1])
    const timestamp = Number.parseInt(parts[2])

    // Check if token is expired (10 minutes)
    if (Date.now() - timestamp > 10 * 60 * 1000) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 })
    }

    // Get user
    const { data: user, error } = await supabase.from("users").select("*").eq("telegram_id", telegram_id).single()

    if (error) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
