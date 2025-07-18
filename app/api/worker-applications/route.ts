import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const telegram_id = request.headers.get("x-telegram-id")
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // 'sent' or 'received'

    if (!telegram_id) {
      return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Get user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", Number.parseInt(telegram_id))
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 })
    }

    let query = supabase
      .from("worker_applications")
      .select(`
        *,
        client:client_id (
          id,
          first_name,
          last_name,
          phone,
          username
        ),
        worker:worker_id (
          id,
          first_name,
          last_name,
          phone,
          username
        )
      `)
      .order("created_at", { ascending: false })

    if (type === "sent") {
      // Applications sent by this user (client)
      query = query.eq("client_id", user.id)
    } else if (type === "received") {
      // Applications received by this user (worker)
      query = query.eq("worker_id", user.id)
    } else {
      // All applications for this user
      query = query.or(`client_id.eq.${user.id},worker_id.eq.${user.id}`)
    }

    const { data: applications, error } = await query

    if (error) {
      console.error("Worker applications fetch error:", error)
      return NextResponse.json({ error: "Arizalarni olishda xatolik" }, { status: 500 })
    }

    return NextResponse.json(applications || [])
  } catch (error) {
    console.error("Worker applications API error:", error)
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const telegram_id = request.headers.get("x-telegram-id")
    const { worker_id, title, description, location, budget, urgency, contact_phone, preferred_date, notes } =
      await request.json()

    if (!telegram_id) {
      return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 })
    }

    if (!worker_id || !title || !description) {
      return NextResponse.json({ error: "Majburiy maydonlarni to'ldiring" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Get user (client)
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("telegram_id", Number.parseInt(telegram_id))
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 })
    }

    // Create application
    const { data: application, error } = await supabase
      .from("worker_applications")
      .insert({
        worker_id,
        client_id: user.id,
        title,
        description,
        location,
        budget: budget ? Number.parseFloat(budget) : null,
        urgency: urgency || "medium",
        contact_phone,
        preferred_date,
        notes,
        status: "pending",
      })
      .select(`
        *,
        client:client_id (
          id,
          first_name,
          last_name,
          phone,
          username
        ),
        worker:worker_id (
          id,
          first_name,
          last_name,
          phone,
          username
        )
      `)
      .single()

    if (error) {
      console.error("Worker application creation error:", error)
      return NextResponse.json({ error: "Ariza yaratishda xatolik" }, { status: 500 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error("Worker applications POST error:", error)
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 })
  }
}
