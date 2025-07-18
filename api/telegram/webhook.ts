import type { NextApiRequest, NextApiResponse } from "next"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!

interface TelegramUpdate {
  update_id: number
  message?: {
    message_id: number
    from: {
      id: number
      is_bot: boolean
      first_name: string
      last_name?: string
      username?: string
    }
    chat: {
      id: number
      type: string
    }
    date: number
    text?: string
  }
}

async function sendMessage(chatId: number, text: string, replyMarkup?: any) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`

  const payload = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    ...(replyMarkup && { reply_markup: replyMarkup }),
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error sending message:", error)
    throw error
  }
}

async function handleStart(message: any) {
  const chatId = message.chat.id
  const user = message.from
  const text = message.text

  // Extract token from /start command
  const startParam = text.split(" ")[1]

  if (startParam) {
    // This is a login attempt
    try {
      // Check if user exists, if not create them
      let { data: existingUser, error } = await supabase.from("users").select("*").eq("telegram_id", user.id).single()

      if (error && error.code === "PGRST116") {
        // User doesn't exist, create them
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert({
            telegram_id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            telegram_username: user.username,
            role: "user",
          })
          .select()
          .single()

        if (createError) {
          throw createError
        }

        existingUser = newUser
      } else if (error) {
        throw error
      }

      // Mark the login attempt as verified
      await supabase.from("telegram_login_attempts").insert({
        token: startParam,
        telegram_id: user.id,
        verified: true,
        created_at: new Date().toISOString(),
      })

      await sendMessage(
        chatId,
        `
🎉 <b>Xush kelibsiz, ${user.first_name}!</b>

Siz muvaffaqiyatli tizimga kirdingiz. Endi veb-saytda buyurtma bera olasiz.

🏗️ <b>Bizning xizmatlar:</b>
• Qurilish materiallari
• Jihozlar ijarasi
• Professional ishchilar

Savollaringiz bo'lsa, bizga yozing!
      `,
      )
    } catch (error) {
      console.error("Error handling login:", error)
      await sendMessage(chatId, "❌ Login jarayonida xatolik yuz berdi. Qaytadan urinib ko'ring.")
    }
  } else {
    // Regular start command
    const keyboard = {
      inline_keyboard: [
        [{ text: "🌐 Veb-saytga o'tish", url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173" }],
        [
          { text: "📞 Aloqa", callback_data: "contact" },
          { text: "❓ Yordam", callback_data: "help" },
        ],
      ],
    }

    await sendMessage(
      chatId,
      `
👋 <b>Salom, ${user.first_name}!</b>

Men OzBot - qurilish materiallari va xizmatlar bo'yicha yordamchingizman.

🏗️ <b>Nima qila olaman:</b>
• Mahsulotlar katalogini ko'rsatish
• Buyurtma berish
• Ishchilar bilan bog'lash
• Narxlar haqida ma'lumot berish

Boshlash uchun tugmalardan birini tanlang yoki veb-saytga o'ting.
    `,
      keyboard,
    )
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const update: TelegramUpdate = req.body

    if (update.message) {
      const message = update.message

      if (message.text?.startsWith("/start")) {
        await handleStart(message)
      } else if (message.text === "/help") {
        await sendMessage(
          message.chat.id,
          `
❓ <b>Yordam</b>

<b>Mavjud buyruqlar:</b>
/start - Botni ishga tushirish
/help - Yordam ma'lumotlari

<b>Qo'shimcha:</b>
• Veb-sayt orqali buyurtma bering
• Savollar uchun bizga yozing
• 24/7 qo'llab-quvvatlash
        `,
        )
      } else {
        // Handle other messages
        await sendMessage(
          message.chat.id,
          `
Xabaringiz uchun rahmat! 

Buyurtma berish uchun veb-saytimizga o'ting yoki /help buyrug'ini yuboring.
        `,
        )
      }
    }

    res.status(200).json({ ok: true })
  } catch (error) {
    console.error("Webhook error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}
