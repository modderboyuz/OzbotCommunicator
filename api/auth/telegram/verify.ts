import type { NextApiRequest, NextApiResponse } from "next"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { token } = req.body

  if (!token) {
    return res.status(400).json({ error: "Token is required" })
  }

  try {
    // Check if token exists and is verified
    const { data: loginAttempt, error } = await supabase
      .from("telegram_login_attempts")
      .select("*")
      .eq("token", token)
      .eq("verified", true)
      .single()

    if (error || !loginAttempt) {
      return res.status(400).json({ error: "Invalid or unverified token" })
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", loginAttempt.telegram_id)
      .single()

    if (userError) {
      return res.status(400).json({ error: "User not found" })
    }

    // Clean up the login attempt
    await supabase.from("telegram_login_attempts").delete().eq("token", token)

    res.status(200).json({ user })
  } catch (error) {
    console.error("Error verifying token:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
