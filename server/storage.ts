import { db } from './db.js';
import { eq, and, desc, ilike, or, isNull, sql } from "drizzle-orm";
import { 
  users, 
  categories, 
  products, 
  orders, 
  orderItems, 
  ads,
  cartItems,
  workerApplications,
  workerReviews,
  tempTokens,
  workTypes,
  type User, 
  type InsertUser, 
  type Category, 
  type InsertCategory,
  type Product, 
  type InsertProduct,
  type Order, 
  type InsertOrder,
  type OrderItem, 
  type InsertOrderItem,
  type Ad, 
  type InsertAd,
  type CartItem,
  type WorkerApplication,
  type InsertWorkerApplication,
  type WorkerReview,
  type InsertWorkerReview,
  type TempToken,
  type InsertTempToken,
  type WorkType
} from "../shared/schema.js";

export class DrizzleStorage {
  // Temp tokens for Telegram login
  async createTempToken(token: InsertTempToken): Promise<TempToken> {
    const result = await db.insert(tempTokens).values(token).returning();
    return result[0];
  }

  async getTempToken(token: string): Promise<TempToken | undefined> {
    const result = await db.select().from(tempTokens)
      .where(and(
        eq(tempTokens.token, token),
        eq(tempTokens.used, false),
        sql`${tempTokens.expires_at} > NOW()`
      ))
      .limit(1);
    return result[0];
  }

  async useTempToken(token: string): Promise<void> {
    await db.update(tempTokens)
      .set({ used: true })
      .where(eq(tempTokens.token, token));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByTelegramId(telegramId: number | undefined): Promise<User | undefined> {
    if (!telegramId) return undefined;
    const result = await db.select().from(users).where(eq(users.telegram_id, telegramId)).limit(1);
    return result[0];
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User> {
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getWorkers(search?: string): Promise<User[]> {
    try {
      let query = db.select().from(users).where(eq(users.role, 'worker'));
      
      if (search) {
        query = query.where(
          or(
            ilike(users.first_name, `%${search}%`),
            ilike(users.last_name, `%${search}%`),
            ilike(users.telegram_username, `%${search}%`)
          )!
        );
      }
      
      return await query.orderBy(desc(users.created_at));
    } catch (error) {
      console.error('Error getting workers:', error);
      return [];
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.is_active, true)).orderBy(categories.order_index);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const result = await db.insert(categories).values(category).returning();
    return result[0];
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category> {
    const result = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return result[0];
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // Products
  async getProducts(categoryId?: string, search?: string): Promise<Product[]> {
    let conditions = [eq(products.is_available, true)];

    if (categoryId) {
      conditions.push(eq(products.category_id, categoryId));
    }

    if (search) {
      conditions.push(
        or(
          ilike(products.name_uz, `%${search}%`),
          ilike(products.description_uz, `%${search}%`)
        )!
      );
    }

    if (conditions.length === 1) {
      return await db.select().from(products)
        .where(conditions[0])
        .orderBy(desc(products.created_at));
    }

    return await db.select().from(products)
      .where(and(...conditions))
      .orderBy(desc(products.created_at));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0];
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const result = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return result[0];
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Orders
  async getOrders(userId?: string): Promise<Order[]> {
    if (userId) {
      return await db.select().from(orders)
        .where(eq(orders.user_id, userId))
        .orderBy(desc(orders.created_at));
    }

    return await db.select().from(orders)
      .orderBy(desc(orders.created_at));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }

  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order> {
    const result = await db.update(orders).set(order).where(eq(orders.id, id)).returning();
    return result[0];
  }

  // Order Items
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.order_id, orderId));
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const result = await db.insert(orderItems).values(orderItem).returning();
    return result[0];
  }

  async createOrderWithItems(orderData: InsertOrder, items: { product_id: string; quantity: number; price_per_unit: number }[]): Promise<Order> {
    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0);
    
    // Create order
    const order = await this.createOrder({
      ...orderData,
      total_amount: total.toString()
    });

    // Create order items
    for (const item of items) {
      await this.createOrderItem({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_per_unit: item.price_per_unit.toString(),
        total_price: (item.quantity * item.price_per_unit).toString()
      });
    }

    return order;
  }

  // Cart functionality
  async getCartItems(userId: string): Promise<(CartItem & { product: Product })[]> {
    const result = await db
      .select({
        id: cartItems.id,
        user_id: cartItems.user_id,
        product_id: cartItems.product_id,
        quantity: cartItems.quantity,
        created_at: cartItems.created_at,
        product: products
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.product_id, products.id))
      .where(eq(cartItems.user_id, userId))
      .orderBy(desc(cartItems.created_at));
    
    return result;
  }

  async addToCart(userId: string, productId: string, quantity: number): Promise<CartItem> {
    // Check if item already exists in cart
    const existing = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.user_id, userId), eq(cartItems.product_id, productId)))
      .limit(1);

    if (existing.length > 0) {
      // Update existing item
      const result = await db
        .update(cartItems)
        .set({ quantity: existing[0].quantity + quantity })
        .where(eq(cartItems.id, existing[0].id))
        .returning();
      return result[0];
    } else {
      // Create new item
      const result = await db
        .insert(cartItems)
        .values({ user_id: userId, product_id: productId, quantity })
        .returning();
      return result[0];
    }
  }

  async updateCartItem(userId: string, productId: string, quantity: number): Promise<CartItem> {
    const result = await db
      .update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.user_id, userId), eq(cartItems.product_id, productId)))
      .returning();
    return result[0];
  }

  async removeFromCart(userId: string, productId: string): Promise<void> {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.user_id, userId), eq(cartItems.product_id, productId)));
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.user_id, userId));
  }

  // Ads
  async getActiveAds(): Promise<Ad[]> {
    return await db.select().from(ads)
      .where(eq(ads.is_active, true))
      .orderBy(desc(ads.created_at));
  }

  async getAds(): Promise<Ad[]> {
    return await db.select().from(ads).orderBy(desc(ads.created_at));
  }

  async createAd(ad: InsertAd): Promise<Ad> {
    const result = await db.insert(ads).values(ad).returning();
    return result[0];
  }

  async updateAd(id: string, ad: Partial<InsertAd>): Promise<Ad> {
    const result = await db.update(ads).set(ad).where(eq(ads.id, id)).returning();
    return result[0];
  }

  async deleteAd(id: string): Promise<void> {
    await db.delete(ads).where(eq(ads.id, id));
  }

  // Worker Applications
  async getWorkerApplications(workerId: string): Promise<WorkerApplication[]> {
    return await db.select().from(workerApplications)
      .where(eq(workerApplications.worker_id, workerId))
      .orderBy(desc(workerApplications.created_at));
  }

  async getClientApplications(clientId: string): Promise<WorkerApplication[]> {
    return await db.select().from(workerApplications)
      .where(eq(workerApplications.client_id, clientId))
      .orderBy(desc(workerApplications.created_at));
  }

  async createWorkerApplication(application: InsertWorkerApplication): Promise<WorkerApplication> {
    const result = await db.insert(workerApplications).values(application).returning();
    return result[0];
  }

  async updateWorkerApplication(id: string, application: Partial<InsertWorkerApplication>): Promise<WorkerApplication> {
    const result = await db.update(workerApplications)
      .set(application)
      .where(eq(workerApplications.id, id))
      .returning();
    return result[0];
  }

  async deleteWorkerApplication(id: string): Promise<void> {
    await db.delete(workerApplications).where(eq(workerApplications.id, id));
  }

  // Worker Reviews
  async getWorkerReviews(workerId: string): Promise<WorkerReview[]> {
    return await db.select().from(workerReviews)
      .where(eq(workerReviews.worker_id, workerId))
      .orderBy(desc(workerReviews.created_at));
  }

  async createWorkerReview(review: InsertWorkerReview): Promise<WorkerReview> {
    const result = await db.insert(workerReviews).values(review).returning();
    return result[0];
  }

  async getWorkerAverageRating(workerId: string): Promise<number> {
    const result = await db
      .select({ avg: sql<number>`AVG(${workerReviews.rating})` })
      .from(workerReviews)
      .where(eq(workerReviews.worker_id, workerId));
    
    return result[0]?.avg || 0;
  }

  // Work Types
  async getWorkTypes(): Promise<WorkType[]> {
    return await db.select().from(workTypes).orderBy(workTypes.name_uz);
  }
}

export const storage = new DrizzleStorage();