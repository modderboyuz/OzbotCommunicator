import { Bot, webhookCallback } from "grammy";
import { conversations, createConversation } from "@grammyjs/conversations";
import { Router } from "express";
import { storage } from "./storage.js";
import type { InsertUser } from "../shared/schema.js";

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || "dummy_token");

if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN !== "dummy_token") {
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
      const userData: InsertUser = {
        phone: phone.replace(/[^0-9+]/g, ''),
        first_name: firstName,
        last_name: lastName,
        telegram_username: ctx.from?.username,
        telegram_id: ctx.from?.id,
        role: 'client',
        type: 'telegram'
      };

      await storage.createUser(userData);

      await ctx.reply(
        `Tabriklaymiz! Ro'yxatdan o'tdingiz ✅\n\n` +
        `👤 ${firstName} ${lastName}\n` +
        `📱 ${phone}\n\n` +
        `Endi siz MetalBaza web ilovasidan foydalanishingiz mumkin!`,
        {
          reply_markup: {
            inline_keyboard: [[
              { 
                text: "🌐 Web saytni ochish", 
                web_app: { 
                  url: process.env.WEB_APP_URL || "https://metalbaza.uz" 
                }
              }
            ]]
          }
        }
      );

    } catch (error) {
      console.error('Registration error:', error);
      await ctx.reply("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    }
  }

  bot.use(createConversation(registration));

  // Handle login web commands
  bot.command("start", async (ctx) => {
    const startPayload = ctx.match;
    
    // Check if this is a web login request
    if (startPayload && startPayload.startsWith('login_web_')) {
      const parts = startPayload.split('_');
      if (parts.length >= 5) {
        const token = parts[2];
        const timestamp = parts[3];
        const clientId = parts[4];
        
        try {
          // Verify token exists and not expired
          const tempToken = await storage.getTempToken(token);
          if (!tempToken) {
            await ctx.reply("❌ Login token yaroqsiz yoki muddati tugagan.");
            return;
          }

          const user = await storage.getUserByTelegramId(ctx.from?.id);
          if (!user) {
            // Auto-register user
            try {
              const userData = {
                phone: `+${ctx.from?.id}`,
                first_name: ctx.from?.first_name || "Telegram",
                last_name: ctx.from?.last_name || "User",
                telegram_username: ctx.from?.username,
                telegram_id: ctx.from?.id,
                role: 'client' as const,
                type: 'telegram' as const
              };
              
              await storage.createUser(userData);
              
              await ctx.reply(
                `✅ Avtomatik ro'yxatdan o'tdingiz va web saytga kirib oldingiz!\n\n` +
                `👤 ${userData.first_name} ${userData.last_name}\n` +
                `🌐 Endi web saytda foydalanishingiz mumkin.`
              );
            } catch (error) {
              console.error('Auto-registration error:', error);
              await ctx.reply("❌ Avtomatik ro'yxatdan o'tishda xatolik.");
              return;
            }
          } else {
            await ctx.reply(
              `✅ Web saytga kirish muvaffaqiyatli!\n\n` +
              `👤 ${user.first_name} ${user.last_name}\n` +
              `🌐 Endi web saytda avtomatik kirib olasiz.`
            );
          }

          // Mark token as used
          await storage.useTempToken(token);


        } catch (error) {
          console.error('Web login error:', error);
          await ctx.reply("❌ Login jarayonida xatolik yuz berdi.");
        }
        return;
      }
    }

    // Regular start command - auto register if needed
    let user = await storage.getUserByTelegramId(ctx.from?.id);
    
    if (!user) {
      // Auto-register new users
      try {
        const userData = {
          phone: `+${ctx.from?.id}`,
          first_name: ctx.from?.first_name || "Telegram",
          last_name: ctx.from?.last_name || "User",
          telegram_username: ctx.from?.username,
          telegram_id: ctx.from?.id,
          role: 'client' as const,
          type: 'telegram' as const
        };
        
        user = await storage.createUser(userData);
        
        await ctx.reply(
          `Salom! MetalBaza ga xush kelibsiz! 👋\n\n` +
          `🏗️ Qurilish materiallari va jihozlari\n\n` +
          `✅ Avtomatik ro'yxatdan o'tdingiz!\n` +
          `👤 ${user.first_name} ${user.last_name}\n\n` +
          `Web saytni ochish uchun pastdagi tugmani bosing.`,
          {
            reply_markup: {
              inline_keyboard: [[
                { 
                  text: "🛒 Web saytni ochish", 
                  web_app: { 
                    url: process.env.WEB_APP_URL || "https://metalbaza.uz" 
                  }
                }
              ]]
            }
          }
        );
      } catch (error) {
        console.error('Auto-registration error:', error);
        await ctx.reply(
          `Salom! MetalBaza ga xush kelibsiz! 👋\n\n` +
          `🏗️ Qurilish materiallari va jihozlari\n\n` +
          `Ro'yxatdan o'tish uchun /register buyrug'ini ishlatib boshlang.`
        );
      }
    } else {
      await ctx.reply(
        `Salom ${user.first_name}! 👋\n\n` +
        `MetalBaza - qurilish materiallari va jihozlari\n\n` +
        `Web saytni ochish uchun pastdagi tugmani bosing.`,
        {
          reply_markup: {
            inline_keyboard: [[
              { 
                text: "🛒 Web saytni ochish", 
                web_app: { 
                  url: process.env.WEB_APP_URL || "https://metalbaza.uz" 
                }
              }
            ]]
          }
        }
      );
    }
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(
      "MetalBaza Bot Yordam 📋\n\n" +
      "/start - Botni ishga tushirish\n" +
      "/profile - Profil ma'lumotlari\n" +
      "/help - Yordam"
    );
  });

  bot.command("profile", async (ctx) => {
    const user = await storage.getUserByTelegramId(ctx.from?.id);
    
    if (!user) {
      await ctx.reply("Iltimos, avval /register buyrug'i bilan ro'yxatdan o'ting!");
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
}

// Create webhook router
export const telegramRouter = Router();

telegramRouter.post("/webhook/telegram", webhookCallback(bot, "express"));

// Set webhook
export async function setWebhook() {
  if (!process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN === "dummy_token") {
    console.log("Telegram bot token not configured, skipping webhook setup");
    return;
  }

  const webhookUrl = `${process.env.WEB_APP_URL || 'https://localhost:5000'}/webhook/telegram`;
  
  try {
    await bot.api.setWebhook(webhookUrl);
    console.log(`Telegram webhook set to: ${webhookUrl}`);
  } catch (error) {
    console.error("Error setting webhook:", error);
  }
}

export { bot };