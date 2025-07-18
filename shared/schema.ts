import { pgTable, text, integer, boolean, decimal, timestamp, uuid, bigint, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Temp tokens for Telegram login
export const tempTokens = pgTable("temp_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  token: text("token").unique().notNull(),
  telegram_id: bigint("telegram_id", { mode: "number" }).notNull(),
  client_id: text("client_id").notNull(),
  expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
  used: boolean("used").default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// Work types table
export const workTypes = pgTable("work_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name_uz: text("name_uz").notNull(),
  name_ru: text("name_ru").notNull(),
  description: text("description"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: text("phone").unique().notNull(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  telegram_username: text("telegram_username"),
  telegram_id: bigint("telegram_id", { mode: "number" }).unique(),
  role: text("role", { enum: ["client", "worker", "admin"] }).default("client").notNull(),
  type: text("type", { enum: ["telegram", "google"] }).default("telegram").notNull(),
  
  // Worker fields
  work_type_id: uuid("work_type_id").references(() => workTypes.id),
  description: text("description"),
  experience_years: integer("experience_years"),
  hourly_rate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  address: text("address"),
  
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name_uz: text("name_uz").notNull(),
  name_ru: text("name_ru"),
  parent_id: uuid("parent_id").references(() => categories.id),
  icon: text("icon"),
  order_index: integer("order_index").default(0),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name_uz: text("name_uz").notNull(),
  name_ru: text("name_ru"),
  description_uz: text("description_uz"),
  description_ru: text("description_ru"),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  category_id: uuid("category_id").references(() => categories.id),
  subcategory_id: uuid("subcategory_id").references(() => categories.id),
  image_url: text("image_url"),
  images: text("images").array(),
  is_available: boolean("is_available").default(true),
  is_rental: boolean("is_rental").default(false),
  unit: text("unit").default("dona"),
  stock_quantity: integer("stock_quantity").default(0),
  order_count: integer("order_count").default(0),
  delivery_available: boolean("delivery_available").default(true),
  delivery_price: decimal("delivery_price", { precision: 12, scale: 2 }).default("0"),
  free_delivery_threshold: decimal("free_delivery_threshold", { precision: 12, scale: 2 }).default("0"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id),
  total_amount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status", { enum: ["pending", "confirmed", "processing", "completed", "cancelled"] }).default("pending").notNull(),
  delivery_address: text("delivery_address"),
  delivery_date: timestamp("delivery_date"),
  notes: text("notes"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  order_id: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }),
  product_id: uuid("product_id").references(() => products.id),
  quantity: integer("quantity").default(1).notNull(),
  price_per_unit: decimal("price_per_unit", { precision: 12, scale: 2 }).notNull(),
  total_price: decimal("total_price", { precision: 12, scale: 2 }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  product_id: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const ads = pgTable("ads", {
  id: uuid("id").primaryKey().defaultRandom(),
  title_uz: text("title_uz").notNull(),
  title_ru: text("title_ru"),
  description_uz: text("description_uz"),
  description_ru: text("description_ru"),
  image_url: text("image_url"),
  link_url: text("link_url"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const workerApplications = pgTable("worker_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  client_id: uuid("client_id").references(() => users.id).notNull(),
  worker_id: uuid("worker_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location"),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  status: text("status", { enum: ["pending", "accepted", "rejected", "completed"] }).default("pending").notNull(),
  urgency: text("urgency", { enum: ["low", "medium", "high"] }).default("medium").notNull(),
  contact_phone: text("contact_phone"),
  preferred_date: timestamp("preferred_date"),
  notes: text("notes"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const workerReviews = pgTable("worker_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  worker_id: uuid("worker_id").references(() => users.id).notNull(),
  client_id: uuid("client_id").references(() => users.id).notNull(),
  application_id: uuid("application_id").references(() => workerApplications.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// Insert schemas
export const insertTempTokenSchema = createInsertSchema(tempTokens).omit({
  id: true,
  created_at: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  created_at: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  created_at: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  created_at: true,
});

export const insertAdSchema = createInsertSchema(ads).omit({
  id: true,
  created_at: true,
});

export const insertWorkerApplicationSchema = createInsertSchema(workerApplications).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertWorkerReviewSchema = createInsertSchema(workerReviews).omit({
  id: true,
  created_at: true,
});

// Types
export type TempToken = typeof tempTokens.$inferSelect;
export type WorkType = typeof workTypes.$inferSelect;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type Ad = typeof ads.$inferSelect;
export type WorkerApplication = typeof workerApplications.$inferSelect;
export type WorkerReview = typeof workerReviews.$inferSelect;

export type InsertTempToken = typeof tempTokens.$inferInsert;
export type InsertUser = typeof users.$inferInsert;
export type InsertCategory = typeof categories.$inferInsert;
export type InsertProduct = typeof products.$inferInsert;
export type InsertOrder = typeof orders.$inferInsert;
export type InsertOrderItem = typeof orderItems.$inferInsert;
export type InsertCartItem = typeof cartItems.$inferInsert;
export type InsertAd = typeof ads.$inferInsert;
export type InsertWorkerApplication = typeof workerApplications.$inferInsert;
export type InsertWorkerReview = typeof workerReviews.$inferInsert;