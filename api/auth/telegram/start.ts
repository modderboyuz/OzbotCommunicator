import type { NextApiRequest, NextApiResponse } from "next"
import crypto from "crypto"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // Generate a unique token for this login attempt
    const token = crypto.randomBytes(32).toString("hex")
    const clientId = crypto.randomUUID()

    // Store the token temporarily (you might want to use Redis or database)
    // For now, we'll use a simple in-memory store
    const loginAttempts = new Map()
    loginAttempts.set(token, {
      clientId,
      createdAt: new Date(),
      verified: false,
    })

    const botUsername = process.env.TELEGRAM_BOT_USERNAME
    const botUrl = `https://t.me/${botUsername}?start=${token}`

    res.status(200).json({
      token,
      client_id: clientId,
      bot_url: botUrl,
    })
  } catch (error) {
    console.error("Error starting Telegram login:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
