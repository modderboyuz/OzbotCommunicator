import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const telegram_id = request.headers.get("x-telegram-id")
    const { status } = await request.json()

    if (!telegram_id) {
      return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 })
    }

    if (!status || !["accepted", "rejected", "completed"].includes(status)) {
      return NextResponse.json({ error: "Noto'g'ri status" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Get user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("telegram_id", Number.parseInt(telegram_id))
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 })
    }

    // Update application status (only worker can update)
    const { data: application, error } = await supabase
      .from("worker_applications")
      .update({ status })
      .eq("id", params.id)
      .eq("worker_id", user.id) // Ensure only the worker can update
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
      console.error("Worker application update error:", error)
      return NextResponse.json({ error: "Arizani yangilashda xatolik" }, { status: 500 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error("Worker applications PUT error:", error)
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 })
  }
}
