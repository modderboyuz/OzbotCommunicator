import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
<<<<<<< HEAD
<<<<<<< HEAD
import { storage } from "./supabase-storage";
import { supabase } from "./db";
import crypto from "crypto";
import { 
  insertOrderSchema, 
  insertAdSchema, 
  insertWorkerApplicationSchema,
  insertWorkerReviewSchema,
  insertCategorySchema,
  insertProductSchema,
  insertOrderItemSchema
} from "@shared/schema";
=======
=======
>>>>>>> parent of d5f8a26 (Saved your changes before starting work)
import { storage } from "./storage";
import { insertOrderSchema, insertAdSchema, insertWorkerApplicationSchema } from "@shared/schema";
>>>>>>> parent of d5f8a26 (Saved your changes before starting work)

interface AuthRequest extends Request {
  telegramId?: string;
  user?: any;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Telegram webhook setup
  if (process.env.TELEGRAM_BOT_TOKEN) {
    try {
      const { telegramRouter, setWebhook } = await import("./telegram-webhook");
      app.use(telegramRouter);
      
      // Set webhook after server starts
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
  const requireAuth = (req: AuthRequest, res: Response, next: any) => {
    const telegramId = req.headers['x-telegram-id'];
    if (!telegramId) {
      return res.status(401).json({ error: "Avtorizatsiya talab qilinadi" });
    }
    req.telegramId = telegramId as string;
    next();
  };

  const requireAdmin = async (req: AuthRequest, res: Response, next: any) => {
    const user = await storage.getUserByTelegramId(Number(req.telegramId));
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Admin huquqlari talab qilinadi" });
    }
    req.user = user;
    next();
  };

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
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Kategoriyalarni olishda xatolik" });
    }
  });

  app.get("/api/categories/:parentId/subcategories", async (req, res) => {
    try {
      const { parentId } = req.params;
      const subcategories = await storage.getSubcategories(parentId);
      res.json(subcategories);
    } catch (error) {
      console.error("Error getting subcategories:", error);
      res.status(500).json({ error: "Subkategoriyalarni olishda xatolik" });
    }
  });

  app.post("/api/categories", requireAuth, requireAdmin, async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.json(category);
    } catch (error) {
      res.status(400).json({ error: "Noto'g'ri ma'lumotlar" });
    }
  });

  app.put("/api/categories/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      res.json(category);
    } catch (error) {
      res.status(400).json({ error: "Kategoriyani yangilashda xatolik" });
    }
  });

  app.delete("/api/categories/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCategory(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Kategoriyani o'chirishda xatolik" });
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

  app.post("/api/products", requireAuth, requireAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: "Noto'g'ri ma'lumotlar" });
    }
  });

  app.put("/api/products/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, productData);
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: "Mahsulotni yangilashda xatolik" });
    }
  });

  app.delete("/api/products/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProduct(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Mahsulotni o'chirishda xatolik" });
    }
  });

  // Orders
  app.get("/api/orders", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUserByTelegramId(Number(req.telegramId));
      if (!user) {
        return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
      }

      const orders = await storage.getOrders(user.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Buyurtmalarni olishda xatolik" });
    }
  });

  app.post("/api/orders", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUserByTelegramId(Number(req.telegramId));
      if (!user) {
        return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
      }

      // Validate required fields
      const { items, customer_name, customer_phone, ...orderData } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Buyurtmada mahsulotlar bo'lishi kerak" });
      }

      // Calculate total amount
      let totalAmount = 0;
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(400).json({ error: `Mahsulot topilmadi: ${item.productId}` });
        }
        totalAmount += Number(product.price) * item.quantity;
      }

      const completeOrderData = insertOrderSchema.parse({
        ...orderData,
        user_id: user.id,
        customer_name: customer_name || `${user.first_name} ${user.last_name}`,
        customer_phone: customer_phone || user.phone,
        total_amount: totalAmount.toString(),
      });

      const order = await storage.createOrder(completeOrderData);

      // Create order items
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (product) {
          await storage.createOrderItem({
            order_id: order.id,
            product_id: item.productId,
            quantity: item.quantity,
            price_per_unit: product.price,
            total_price: (Number(product.price) * item.quantity).toString(),
          });
        }
      }

      // Clear cart after successful order
      await storage.clearCart(user.id);
      
      res.json(order);
    } catch (error) {
      console.error("Order creation error:", error);
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

  app.post("/api/ads", requireAuth, requireAdmin, async (req, res) => {
    try {
      const adData = insertAdSchema.parse(req.body);
      const ad = await storage.createAd(adData);
      res.json(ad);
    } catch (error) {
      res.status(400).json({ error: "Reklama yaratishda xatolik" });
    }
  });

  // Workers
  app.get("/api/workers", async (req: AuthRequest, res: Response) => {
    try {
      const { search } = req.query;
      
      // Get workers with reviews from supabase directly
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          reviews:worker_reviews(rating, comment, created_at)
        `)
        .eq('role', 'worker')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      // Calculate average rating and total reviews for each worker
      const workersWithStats = data?.map(worker => {
        const reviews = worker.reviews || [];
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 
          ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews 
          : 0;

        // Check if user is admin to show sensitive data
        let isAdmin = false;
        // Hide sensitive data for non-admin users by default
        return {
          id: worker.id,
          first_name: worker.first_name,
          last_name: worker.last_name,
          telegram_username: worker.telegram_username,
          role: worker.role,
          specialization: worker.specialization,
          experience_years: worker.experience_years,
          hourly_rate: worker.hourly_rate,
          description: worker.description,
          is_available: worker.is_available,
          phone: worker.phone, // Show phone for contact
          created_at: worker.created_at,
          totalReviews,
          averageRating,
          reviews: reviews
        };
      }) || [];

      res.json(workersWithStats);
    } catch (error) {
      console.error("Workers API error:", error);
      res.status(500).json({ error: "Ustalarni olishda xatolik" });
    }
  });

  // Update user switched_to status for admin role switching
  app.post("/api/users/:id/switch-role", async (req, res) => {
    try {
      const { id } = req.params;
      const { switchedTo } = req.body;
      
      const updatedUser = await storage.updateUserSwitchedTo(id, switchedTo);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error switching user role:", error);
      res.status(500).json({ error: "Rol almashtirishda xatolik" });
    }
  });

  // Cart routes
  app.get("/api/cart", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUserByTelegramId(Number(req.telegramId));
      if (!user) {
        return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
      }
      const cartItems = await storage.getCartItems(user.id);
      res.json(cartItems);
    } catch (error) {
      console.error("Error getting cart items:", error);
      res.status(500).json({ error: "Savatni olishda xatolik" });
    }
  });

  app.post("/api/cart", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      console.log("Adding to cart - telegram ID:", req.telegramId);
      const user = await storage.getUserByTelegramId(Number(req.telegramId));
      console.log("Found user:", user ? user.id : 'null');
      
      if (!user) {
        return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
      }
      
      const { productId, quantity } = req.body;
      console.log("Cart data:", { productId, quantity });
      
      if (!productId || !quantity) {
        return res.status(400).json({ error: "Product ID va miqdor majburiy" });
      }
      
      const cartItem = await storage.addToCart(user.id, productId, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ error: "Savatga qo'shishda xatolik" });
    }
  });

  app.put("/api/cart/:productId", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUserByTelegramId(Number(req.telegramId));
      if (!user) {
        return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
      }
      
      const { productId } = req.params;
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ error: "Yaroqli miqdor kiriting" });
      }
      
      const cartItem = await storage.updateCartItem(user.id, productId, quantity);
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ error: "Savat elementini yangilashda xatolik" });
    }
  });

  app.delete("/api/cart/:productId", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUserByTelegramId(Number(req.telegramId));
      if (!user) {
        return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
      }
      
      const { productId } = req.params;
      await storage.removeFromCart(user.id, productId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ error: "Savatdan o'chirishda xatolik" });
    }
  });

  app.delete("/api/cart", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUserByTelegramId(Number(req.telegramId));
      if (!user) {
        return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
      }
      
      await storage.clearCart(user.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ error: "Savatni tozalashda xatolik" });
    }
  });

  // Company settings
  app.get("/api/company-settings", async (req, res) => {
    try {
      const settings = await storage.getCompanySettings();
      res.json(settings || { is_delivery: false });
    } catch (error) {
      console.error("Error getting company settings:", error);
      res.status(500).json({ error: "Kompaniya sozlamalarini olishda xatolik" });
    }
  });

  app.put("/api/company-settings", requireAuth, requireAdmin, async (req, res) => {
    try {
      const settings = await storage.updateCompanySettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating company settings:", error);
      res.status(500).json({ error: "Kompaniya sozlamalarini yangilashda xatolik" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data: usersData } = await supabase.from('users').select('id');
      const { data: productsData } = await supabase.from('products').select('id');
      const { data: ordersData } = await supabase.from('orders').select('total_amount');
      
      const totalRevenue = ordersData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      
      const stats = {
        totalUsers: usersData?.length || 0,
        totalProducts: productsData?.length || 0,
        totalOrders: ordersData?.length || 0,
        totalRevenue
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Error getting admin stats:", error);
      res.status(500).json({ error: "Statistikani olishda xatolik" });
    }
  });

  app.get("/api/admin/orders", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(product_id, quantity, price, products(name_uz))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const ordersWithItems = data?.map(order => ({
        ...order,
        items: order.order_items?.map((item: any) => ({
          product_name: item.products?.name_uz || 'Noma\'lum mahsulot',
          quantity: item.quantity,
          price: item.price
        })) || []
      })) || [];

      res.json(ordersWithItems);
    } catch (error) {
      console.error("Error getting admin orders:", error);
      res.status(500).json({ error: "Buyurtmalarni olishda xatolik" });
    }
  });

  app.get("/api/admin/users", requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      console.error("Error getting admin users:", error);
      res.status(500).json({ error: "Foydalanuvchilarni olishda xatolik" });
    }
  });

  // Worker Applications routes
  app.get("/api/worker-applications", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUserByTelegramId(Number(req.telegramId));
      if (!user) {
        return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
      }

      if (user.role !== 'worker') {
        return res.status(403).json({ error: "Faqat ustalar uchun" });
      }

      const applications = await storage.getWorkerApplications(user.id);
      res.json(applications);
    } catch (error) {
      console.error("Error getting worker applications:", error);
      res.status(500).json({ error: "Arizalarni olishda xatolik" });
    }
  });

  app.post("/api/worker-applications", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUserByTelegramId(Number(req.telegramId));
      if (!user) {
        return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
      }

      const applicationData = insertWorkerApplicationSchema.parse({
        ...req.body,
        client_id: user.id,
      });
      
      const application = await storage.createWorkerApplication(applicationData);
      res.json(application);
    } catch (error) {
      console.error("Error creating worker application:", error);
      res.status(400).json({ error: "Ariza yaratishda xatolik" });
    }
  });

  // Worker reviews routes
  app.get("/api/workers/:workerId/reviews", async (req: Request, res: Response) => {
    try {
      const { workerId } = req.params;
      const reviews = await storage.getWorkerReviews(workerId);
      res.json(reviews);
    } catch (error) {
      console.error("Error getting worker reviews:", error);
      res.status(500).json({ error: "Usta sharhlarini olishda xatolik" });
    }
  });

  app.post("/api/workers/:workerId/reviews", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUserByTelegramId(Number(req.telegramId));
      if (!user) {
        return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
      }

      const { workerId } = req.params;
      const reviewData = insertWorkerReviewSchema.parse({
        ...req.body,
        worker_id: workerId,
        client_id: user.id,
      });

      const review = await storage.createWorkerReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error("Error creating worker review:", error);
      res.status(400).json({ error: "Sharh yaratishda xatolik" });
    }
  });

  // Admin routes for full data management
  app.get("/api/admin/categories", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('order_index');
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Kategoriyalarni olishda xatolik" });
    }
  });

  app.get("/api/admin/products", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`*, category:categories(name_uz)`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Mahsulotlarni olishda xatolik" });
    }
  });

  app.get("/api/admin/orders", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:users(first_name, last_name, phone),
          order_items(*, product:products(name_uz, price))
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Buyurtmalarni olishda xatolik" });
    }
  });

  app.get("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Foydalanuvchilarni olishda xatolik" });
    }
  });

  app.get("/api/admin/ads", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Reklamalarni olishda xatolik" });
    }
  });

  // ModderSheets - separate order management system
  app.get("/api/moddersheets", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          customer_name,
          customer_phone,
          total_amount,
          delivery_amount,
          status,
          delivery_address,
          delivery_date,
          notes,
          is_delivery,
          created_at,
          updated_at,
          user:users(first_name, last_name, phone, telegram_username),
          order_items(
            id,
            quantity,
            price_per_unit,
            total_price,
            product:products(id, name_uz, name_ru, unit)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error("ModderSheets error:", error);
      res.status(500).json({ error: "ModderSheets ma'lumotlarini olishda xatolik" });
    }
  });

  // Update order status in ModderSheets
  app.patch("/api/moddersheets/:orderId", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status, notes } = req.body;
      
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status, 
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error) {
      console.error("ModderSheets update error:", error);
      res.status(500).json({ error: "Buyurtmani yangilashda xatolik" });
    }
  });

  // Temporary login tokens for admin web access
  app.post("/api/admin/generate-login-token", async (req, res) => {
    try {
      const { telegram_id } = req.body;
      
      if (!telegram_id) {
        return res.status(400).json({ error: "Telegram ID kerak" });
      }

      // Check if user is admin
      const user = await storage.getUserByTelegramId(Number(telegram_id));
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: "Admin huquqlari kerak" });
      }

      // Generate temporary token
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      const { data, error } = await supabase
        .from('temp_login_tokens')
        .insert({
          token,
          telegram_id: Number(telegram_id),
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      res.json({ 
        token,
        login_url: `/admin/login?token=${token}`,
        expires_at: expiresAt.toISOString()
      });
    } catch (error) {
      console.error("Token generation error:", error);
      res.status(500).json({ error: "Token yaratishda xatolik" });
    }
  });

  // Verify login token
  app.post("/api/admin/verify-token", async (req, res) => {
    try {
      const { token } = req.body;
      
      const { data, error } = await supabase
        .from('temp_login_tokens')
        .select('*, user:users(*)')
        .eq('token', token)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        return res.status(401).json({ error: "Yaroqsiz yoki muddati o'tgan token" });
      }

      // Mark token as used
      await supabase
        .from('temp_login_tokens')
        .update({ used: true })
        .eq('id', data.id);

      // Get user data
      const user = await storage.getUserByTelegramId(data.telegram_id);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: "Admin huquqlari kerak" });
      }

      res.json({ user });
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(500).json({ error: "Token tekshirishda xatolik" });
    }
  });

  app.put("/api/worker-applications/:id", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = await storage.getUserByTelegramId(Number(req.telegramId));
      if (!user) {
        return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
      }

      const { id } = req.params;
      const application = await storage.updateWorkerApplication(id, req.body);
      res.json(application);
    } catch (error) {
      console.error("Error updating worker application:", error);
      res.status(400).json({ error: "Arizani yangilashda xatolik" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      // This would need implementation for getting all users
      res.json({ message: "Admin panel - foydalanuvchilar" });
    } catch (error) {
      res.status(500).json({ error: "Admin ma'lumotlarini olishda xatolik" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
