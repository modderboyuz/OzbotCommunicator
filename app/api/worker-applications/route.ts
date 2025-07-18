import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: applications, error } = await supabase
      .from("worker_applications")
      .select(`
        *,
        users (
          id,
          full_name,
          phone,
          telegram_username
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Worker applications fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(applications || [])
  } catch (error) {
    console.error("Worker applications API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, specialization, experience, description, portfolio } = body

    if (!userId || !specialization) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()

    const { data: application, error } = await supabase
      .from("worker_applications")
      .insert({
        user_id: userId,
        specialization,
        experience: experience || 0,
        description: description || "",
        portfolio: portfolio || "",
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Worker application creation error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, applicationId: application.id })
  } catch (error) {
    console.error("Worker application creation API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
