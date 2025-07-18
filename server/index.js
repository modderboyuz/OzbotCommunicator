import express from "express"
import cors from "cors"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "https://your-project.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "your-service-role-key",
)

// API Routes
app.get("/api/categories", async (req, res) => {
  try {
    const { data, error } = await supabase.from("categories").select("*").eq("is_active", true).order("name_uz")

    if (error) throw error
    res.json(data)
  } catch (error) {
    console.error("Error fetching categories:", error)
    res.status(500).json({ error: "Failed to fetch categories" })
  }
})

app.get("/api/products", async (req, res) => {
  try {
    const { category, search } = req.query

    let query = supabase
      .from("products")
      .select(`
        *,
        categories (
          id,
          name_uz,
          name_ru,
          icon
        )
      `)
      .eq("is_active", true)

    if (category) {
      query = query.eq("category_id", category)
    }

    if (search) {
      query = query.or(`name_uz.ilike.%${search}%,name_ru.ilike.%${search}%,description_uz.ilike.%${search}%`)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (error) {
    console.error("Error fetching products:", error)
    res.status(500).json({ error: "Failed to fetch products" })
  }
})

app.get("/api/ads", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) throw error
    res.json(data)
  } catch (error) {
    console.error("Error fetching ads:", error)
    res.status(500).json({ error: "Failed to fetch ads" })
  }
})

// Cart endpoints
app.get("/api/cart/:userId", async (req, res) => {
  try {
    const { userId } = req.params

    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        *,
        products (
          id,
          name_uz,
          name_ru,
          price,
          image_url,
          unit
        )
      `)
      .eq("user_id", userId)

    if (error) throw error
    res.json(data)
  } catch (error) {
    console.error("Error fetching cart:", error)
    res.status(500).json({ error: "Failed to fetch cart" })
  }
})

app.post("/api/cart", async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body

    // Check if item already exists in cart
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", user_id)
      .eq("product_id", product_id)
      .single()

    if (existingItem) {
      // Update quantity
      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id)
        .select()
        .single()

      if (error) throw error
      res.json(data)
    } else {
      // Add new item
      const { data, error } = await supabase
        .from("cart_items")
        .insert([{ user_id, product_id, quantity }])
        .select()
        .single()

      if (error) throw error
      res.json(data)
    }
  } catch (error) {
    console.error("Error adding to cart:", error)
    res.status(500).json({ error: "Failed to add to cart" })
  }
})

// Telegram webhook
app.post("/api/telegram/webhook", async (req, res) => {
  try {
    const update = req.body

    if (update.message) {
      const message = update.message
      const chatId = message.chat.id
      const text = message.text

      if (text === "/start") {
        // Generate login token
        const token = crypto.randomBytes(32).toString("hex")
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

        // Save login attempt
        await supabase.from("telegram_login_attempts").insert([
          {
            telegram_id: chatId.toString(),
            token,
            expires_at: expiresAt.toISOString(),
          },
        ])

        // Send login link
        const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173"}/auth/telegram?token=${token}`

        await sendTelegramMessage(
          chatId,
          `Salom! Web saytga kirish uchun quyidagi havolani bosing:\n\n${loginUrl}\n\nHavola 5 daqiqa davomida amal qiladi.`,
        )
      }
    }

    res.json({ ok: true })
  } catch (error) {
    console.error("Telegram webhook error:", error)
    res.status(500).json({ error: "Webhook processing failed" })
  }
})

// Telegram auth verification
app.post("/api/auth/telegram/verify", async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ error: "Token is required" })
    }

    // Find login attempt
    const { data: loginAttempt, error: attemptError } = await supabase
      .from("telegram_login_attempts")
      .select("*")
      .eq("token", token)
      .eq("is_used", false)
      .single()

    if (attemptError || !loginAttempt) {
      return res.status(400).json({ error: "Invalid or expired token" })
    }

    // Check if token is expired
    if (new Date() > new Date(loginAttempt.expires_at)) {
      return res.status(400).json({ error: "Token has expired" })
    }

    // Mark token as used
    await supabase.from("telegram_login_attempts").update({ is_used: true }).eq("id", loginAttempt.id)

    // Get or create user
    let { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", loginAttempt.telegram_id)
      .single()

    if (userError && userError.code === "PGRST116") {
      // User doesn't exist, create new one
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([
          {
            telegram_id: loginAttempt.telegram_id,
            username: `user_${loginAttempt.telegram_id}`,
          },
        ])
        .select()
        .single()

      if (createError) throw createError
      user = newUser
    } else if (userError) {
      throw userError
    }

    res.json({ user })
  } catch (error) {
    console.error("Auth verification error:", error)
    res.status(500).json({ error: "Authentication failed" })
  }
})

// Helper function to send Telegram messages
async function sendTelegramMessage(chatId, text) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN

  if (!botToken) {
    console.error("TELEGRAM_BOT_TOKEN not set")
    return
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
      }),
    })

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.statusText}`)
    }

    return response.json()
  } catch (error) {
    console.error("Error sending Telegram message:", error)
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
