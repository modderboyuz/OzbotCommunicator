import { Bot, webhookCallback } from "grammy";
import { conversations, createConversation } from "@grammyjs/conversations";
import { Router } from "express";
import { storage } from "./supabase-storage";
import type { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || "");

bot.use(conversations());

// Registration conversation
async function registration(conversation: any, ctx: any) {
  await ctx.reply("MetalBaza ga xush kelibsiz! 📱");
  
  // Get phone number
  await ctx.reply("Iltimos, telefon raqamingizni kiriting:", {
    reply_markup: {
      keyboard: [[{ text: "📱 Telefon raqamini yuborish", request_contact: true }]],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  });

  const phoneCtx = await conversation.wait();
  let phone = "";
  
  if (phoneCtx.message?.contact?.phone_number) {
    phone = phoneCtx.message.contact.phone_number;
  } else if (phoneCtx.message?.text) {
    phone = phoneCtx.message.text;
  }

  if (!phone) {
    await ctx.reply("Telefon raqam kiritilmadi. Qaytadan urinib ko'ring.");
    return;
  }

  // Get first name
  await ctx.reply("Ismingizni kiriting:", {
    reply_markup: { remove_keyboard: true }
  });
  const firstNameCtx = await conversation.wait();
  const firstName = firstNameCtx.message?.text;

  if (!firstName) {
    await ctx.reply("Ism kiritilmadi. Qaytadan urinib ko'ring.");
    return;
  }

  // Get last name
  await ctx.reply("Familiyangizni kiriting:");
  const lastNameCtx = await conversation.wait();
  const lastName = lastNameCtx.message?.text;

  if (!lastName) {
    await ctx.reply("Familiya kiritilmadi. Qaytadan urinib ko'ring.");
    return;
  }

  try {
    // Save user to database
    const userData = {
      phone: phone.replace(/[^0-9+]/g, ''),
      first_name: firstName,
      last_name: lastName,
      telegram_username: ctx.from?.username,
      telegram_id: ctx.from?.id,
      role: 'client' as const,
      type: 'telegram' as const
    };

    await storage.createUser(userData);

    await ctx.reply(
      `Tabriklaymiz! Ro'yxatdan o'tdingiz ✅\n\n` +
      `👤 ${firstName} ${lastName}\n` +
      `📱 ${phone}\n\n` +
      `Endi siz MetalBaza web ilovasidan foydalanishingiz mumkin!`
    );

  } catch (error) {
    console.error('Registration error:', error);
    await ctx.reply("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
  }
}

bot.use(createConversation(registration));

// Commands
bot.command("start", async (ctx) => {
  let user = await storage.getUserByTelegramId(ctx.from?.id);
  
  if (!user) {
    // Auto-register new users
    try {
      const userData = {
        phone: `tg_${ctx.from?.id}`,
        first_name: ctx.from?.first_name || "User",
        last_name: ctx.from?.last_name || "",
        telegram_username: ctx.from?.username,
        telegram_id: ctx.from?.id,
        role: 'client' as const,
        type: 'telegram' as const
      };

      user = await storage.createUser(userData);
    } catch (error) {
      console.error('Auto-registration error:', error);
    }
  }

  await ctx.reply(
    `Salom ${user?.first_name || ctx.from?.first_name}! 👋\n\n` +
    `MetalBaza - qurilish materiallari va jihozlari\n\n` +
    `Katalogni ko'rish uchun pastdagi tugmani bosing.`,
    {
      reply_markup: {
        inline_keyboard: [[
          { 
            text: "🛒 Katalog", 
            web_app: { 
              url: `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}` || "https://localhost:5000" 
            }
          }
        ]]
      }
    }
  );
});

bot.command("help", async (ctx) => {
  await ctx.reply(
    "MetalBaza Bot Yordam 📋\n\n" +
    "/start - Katalogni ochish\n" +
    "/profile - Profil ma'lumotlari\n" +
    "/help - Yordam"
  );
});

bot.command("profile", async (ctx) => {
  const user = await storage.getUserByTelegramId(ctx.from?.id);
  
  if (!user) {
    await ctx.reply("Iltimos, avval /start ni bosing!");
    return;
  }

  await ctx.reply(
    `👤 Profil ma'lumotlari:\n\n` +
    `Ism: ${user.first_name} ${user.last_name}\n` +
    `Telefon: ${user.phone}\n` +
    `Rol: ${user.role}\n` +
    `Ro'yxatdan o'tgan: ${new Date(user.created_at).toLocaleDateString('uz-UZ')}`
  );
});

// Error handling
bot.catch((err) => {
  console.error("Bot error:", err);
});

// Create webhook router
export const telegramRouter = Router();

telegramRouter.post("/webhook/telegram", webhookCallback(bot, "express"));

// Set webhook (call this once to setup)
export async function setWebhook() {
  const webhookUrl = `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'https://localhost:5000'}/webhook/telegram`;
  
  try {
    await bot.api.setWebhook(webhookUrl);
    console.log(`Telegram webhook set to: ${webhookUrl}`);
  } catch (error) {
    console.error("Error setting webhook:", error);
  }
}

export { bot };
