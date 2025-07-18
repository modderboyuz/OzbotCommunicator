import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    const { data: applications, error } = await supabase
      .from("worker_applications")
      .select(`
        *,
        profiles (
          full_name,
          phone
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Worker applications fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch worker applications" }, { status: 500 })
    }

    return NextResponse.json(applications || [])
  } catch (error) {
    console.error("Worker applications API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()

    // Get user from session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { specialty, experience, description, phone } = body

    const { data: application, error } = await supabase
      .from("worker_applications")
      .insert({
        user_id: user.id,
        specialty,
        experience,
        description,
        phone,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      console.error("Worker application creation error:", error)
      return NextResponse.json({ error: "Failed to create worker application" }, { status: 500 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error("Worker applications POST API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
