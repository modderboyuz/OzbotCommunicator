import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { insertOrderSchema, insertAdSchema, insertWorkerApplicationSchema, insertCategorySchema, insertProductSchema, insertUserSchema } from "../shared/schema.js";
import crypto from "crypto";

interface AuthRequest extends Request {
  telegramId?: string;
  user?: any;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Telegram webhook setup
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN !== "dummy_token") {
    try {
      const { telegramRouter, setWebhook } = await import("./telegram-webhook.js");
      app.use(telegramRouter);
      
      setTimeout(async () => {
        try {
          await setWebhook();
          console.log("Telegram webhook configured successfully");
        } catch (error) {
          console.error("Failed to set Telegram webhook:", error);
        }
      }, 5000);
    } catch (error) {
      console.log("Telegram bot not configured:", error);
    }
  }

  // Authentication middleware
  const requireAuth = async (req: AuthRequest, res: Response, next: any) => {
    const telegramId = req.headers['x-telegram-id'];
    if (!telegramId) {
      return res.status(401).json({ error: "Avtorizatsiya talab qilinadi" });
    }
    
    const user = await storage.getUserByTelegramId(Number(telegramId));
    if (!user) {
      return res.status(401).json({ error: "Foydalanuvchi topilmadi" });
    }
    
    req.telegramId = telegramId as string;
    req.user = user;
    next();
  };

  // Telegram login flow
  app.get("/api/auth/telegram-login", async (req, res) => {
    try {
      const { telegram_id } = req.query;
      
      if (!telegram_id) {
        return res.status(400).json({ error: "Telegram ID talab qilinadi" });
      }

      // Generate temp token
      const token = crypto.randomBytes(32).toString('hex');
      const clientId = crypto.randomBytes(16).toString('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await storage.createTempToken({
        token,
        telegram_id: Number(telegram_id),
        client_id: clientId,
        expires_at: expiresAt
      });

      const botUrl = `https://t.me/jamolstroybot?start=login_web_${token}_${Date.now()}_${clientId}`;
      
      res.json({ 
        bot_url: botUrl,
        token,
        client_id: clientId
      });
    } catch (error) {
      console.error('Telegram login error:', error);
      res.status(500).json({ error: "Server xatoligi" });
    }
  });

  app.post("/api/auth/verify-token", async (req, res) => {
    try {
      const { token } = req.body;
      
      const tempToken = await storage.getTempToken(token);
      if (!tempToken) {
        return res.status(400).json({ error: "Yaroqsiz yoki muddati tugagan token" });
      }

      const user = await storage.getUserByTelegramId(tempToken.telegram_id);
      if (!user) {
        // Create new user if not found
        const newUser = await storage.createUser({
          phone: `+${tempToken.telegram_id}`,
          first_name: "Telegram",
          last_name: "User",
          telegram_id: tempToken.telegram_id,
          role: "client",
          type: "telegram"
        });
        
        // Mark token as used
        await storage.useTempToken(token);
        
        return res.json({ user: newUser });
      }

      // Mark token as used
      await storage.useTempToken(token);

      res.json({ user });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(500).json({ error: "Server xatoligi" });
    }
  });

  // Auth routes
  app.post("/api/auth/telegram", async (req, res) => {
    try {
      const { telegram_id } = req.body;
      const user = await storage.getUserByTelegramId(Number(telegram_id));
      
      if (!user) {
        return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
      }

      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: "Server xatoligi" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const { parent_id } = req.query;
      const categories = await storage.getCategoriesByParent(parent_id as string);
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Kategoriyalarni olishda xatolik" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const { category_id, search } = req.query;
      const products = await storage.getProducts(
        category_id as string,
        search as string
      );
      res.json(products);
    } catch (error) {
      console.error('Products API error:', error);
      res.status(500).json({ error: "Mahsulotlarni olishda xatolik" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ error: "Mahsulot topilmadi" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Mahsulotni olishda xatolik" });
    }
  });

  // Orders
  app.get("/api/orders", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const orders = await storage.getOrders(req.user.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Buyurtmalarni olishda xatolik" });
    }
  });

  app.post("/api/orders", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { items, ...orderData } = req.body;
      
      if (!items || items.length === 0) {
        return res.status(400).json({ error: "Buyurtmada mahsulotlar bo'lishi kerak" });
      }

      // Get cart items to create order
      const cartItems = await storage.getCartItems(req.user.id);
      if (cartItems.length === 0) {
        return res.status(400).json({ error: "Savat bo'sh" });
      }

      // Prepare order items
      const orderItems = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price_per_unit: Number(item.product.price)
      }));

      // Create order with items
      const order = await storage.createOrderWithItems({
        user_id: req.user.id,
        delivery_address: orderData.delivery_address,
        notes: orderData.notes,
        total_amount: "0" // Will be calculated in createOrderWithItems
      }, orderItems);

      // Clear cart after successful order
      await storage.clearCart(req.user.id);

      res.json(order);
    } catch (error) {
      console.error('Order creation error:', error);
      res.status(400).json({ error: "Buyurtma berishda xatolik" });
    }
  });

  // Ads
  app.get("/api/ads", async (req, res) => {
    try {
      const ads = await storage.getActiveAds();
      res.json(ads);
    } catch (error) {
      res.status(500).json({ error: "Reklamalarni olishda xatolik" });
    }
  });

  // Workers
  app.get("/api/workers", async (req: AuthRequest, res: Response) => {
    try {
      const { search } = req.query;
      const workers = await storage.getWorkers(search as string);
      
      // Add average rating for each worker
      const workersWithRating = await Promise.all(
        workers.map(async (worker) => {
          const avgRating = await storage.getWorkerAverageRating(worker.id);
          const reviews = await storage.getWorkerReviews(worker.id);
          return {
            ...worker,
            average_rating: avgRating,
            review_count: reviews.length
          };
        })
      );
      
      res.json(workersWithRating);
    } catch (error) {
      console.error("Workers API error:", error);
      res.status(500).json({ error: "Ustalarni olishda xatolik" });
    }
  });

  // Cart routes
  app.get("/api/cart", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const cartItems = await storage.getCartItems(req.user.id);
      res.json(cartItems);
    } catch (error) {
      console.error("Error getting cart items:", error);
      res.status(500).json({ error: "Savatni olishda xatolik" });
    }
  });

  app.post("/api/cart", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { productId, quantity } = req.body;
      
      if (!productId || !quantity) {
        return res.status(400).json({ error: "Product ID va miqdor majburiy" });
      }
      
      const cartItem = await storage.addToCart(req.user.id, productId, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ error: "Savatga qo'shishda xatolik" });
    }
  });

  app.put("/api/cart/:productId", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ error: "Yaroqli miqdor kiriting" });
      }
      
      const cartItem = await storage.updateCartItem(req.user.id, productId, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ error: "Savat elementini yangilashda xatolik" });
    }
  });

  app.delete("/api/cart/:productId", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { productId } = req.params;
      await storage.removeFromCart(req.user.id, productId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ error: "Savatdan o'chirishda xatolik" });
    }
  });

  app.delete("/api/cart", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      await storage.clearCart(req.user.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ error: "Savatni tozalashda xatolik" });
    }
  });

  // Worker Applications routes
  app.get("/api/worker-applications", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      if (req.user.role !== 'worker') {
        return res.status(403).json({ error: "Faqat ustalar uchun" });
      }

      const applications = await storage.getWorkerApplications(req.user.id);
      res.json(applications);
    } catch (error) {
      console.error("Error getting worker applications:", error);
      res.status(500).json({ error: "Arizalarni olishda xatolik" });
    }
  });

  app.post("/api/worker-applications", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { worker_id, ...applicationData } = req.body;
      
      const application = await storage.createWorkerApplication({
        ...applicationData,
        client_id: req.user.id,
        worker_id
      });
      
      res.json(application);
    } catch (error) {
      console.error("Error creating worker application:", error);
      res.status(400).json({ error: "Ariza yaratishda xatolik" });
    }
  });

  app.put("/api/worker-applications/:id", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const application = await storage.updateWorkerApplication(id, req.body);
      res.json(application);
    } catch (error) {
      console.error("Error updating worker application:", error);
      res.status(400).json({ error: "Arizani yangilashda xatolik" });
    }
  });

  // Worker Reviews routes
  app.get("/api/worker-reviews/:workerId", async (req, res) => {
    try {
      const { workerId } = req.params;
      const reviews = await storage.getWorkerReviews(workerId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Sharhlarni olishda xatolik" });
    }
  });

  app.post("/api/worker-reviews", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const reviewData = {
        ...req.body,
        client_id: req.user.id
      };
      
      const review = await storage.createWorkerReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(400).json({ error: "Sharh yaratishda xatolik" });
    }
  });

  // User profile update
  app.put("/api/users/profile", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const { first_name, last_name, phone } = req.body;
      
      const updatedUser = await storage.updateUser(req.user.id, {
        first_name,
        last_name,
        phone
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(400).json({ error: "Profilni yangilashda xatolik" });
    }
  });

  // Placeholder image endpoint
  app.get("/api/placeholder/:width/:height", (req, res) => {
    const { width, height } = req.params;
    const imageUrl = `https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=${width}&h=${height}`;
    res.redirect(imageUrl);
  });

  const httpServer = createServer(app);
  return httpServer;
}