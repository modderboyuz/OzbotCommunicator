import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const userRole = searchParams.get("userRole")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    let query = supabase.from("worker_applications").select(`
        *,
        worker:users!worker_applications_worker_id_fkey (
          id,
          first_name,
          last_name,
          phone,
          profile_image
        ),
        client:users!worker_applications_client_id_fkey (
          id,
          first_name,
          last_name,
          phone
        )
      `)

    // Filter based on user role
    if (userRole === "worker") {
      query = query.eq("worker_id", userId)
    } else {
      query = query.eq("client_id", userId)
    }

    const { data: applications, error } = await query.order("created_at", { ascending: false })

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
    const { workerId, clientId, title, description, location, budget, urgency, contactPhone, preferredDate, notes } =
      body

    if (!workerId || !clientId || !title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { data: application, error } = await supabase
      .from("worker_applications")
      .insert({
        worker_id: workerId,
        client_id: clientId,
        title,
        description,
        location,
        budget,
        urgency: urgency || "medium",
        contact_phone: contactPhone,
        preferred_date: preferredDate,
        notes,
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
