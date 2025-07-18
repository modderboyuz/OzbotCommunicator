import { pgTable, text, serial, integer, boolean, decimal, timestamp, uuid, bigint, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Work types table for worker specializations
export const workTypes = pgTable("work_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  name_uz: text("name_uz").notNull(),
  name_ru: text("name_ru").notNull(),
  description: text("description"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
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
  switched_to: text("switched_to", { enum: ["client", "admin"] }), // For admin role switching
  
  // Optional fields for workers
  birth_date: date("birth_date"),
  passport: text("passport"),
  passport_image: text("passport_image"),
  profile_image: text("profile_image"),
  work_type: uuid("work_type").references(() => workTypes.id),
  description: text("description"),
  average_pay: integer("average_pay"),
  address: text("address"),
  delivery_address: text("delivery_address"),
  delivery_latitude: decimal("delivery_latitude", { precision: 10, scale: 8 }),
  delivery_longitude: decimal("delivery_longitude", { precision: 11, scale: 8 }),
  email: text("email"),
  
  // Legacy fields - keeping for compatibility
  passport_series: text("passport_series"),
  passport_number: text("passport_number"),
  passport_issued_by: text("passport_issued_by"),
  passport_issued_date: timestamp("passport_issued_date"),
  specialization: text("specialization"), // For workers: what kind of work they do
  experience_years: integer("experience_years"), // Work experience
  hourly_rate: decimal("hourly_rate", { precision: 10, scale: 2 }), // Price per hour
  
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name_uz: text("name_uz").notNull(),
  name_ru: text("name_ru"),
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
  image_url: text("image_url"),
  is_available: boolean("is_available").default(true),
  is_rental: boolean("is_rental").default(false),
  unit: text("unit").default("dona"),
  delivery_price: decimal("delivery_price", { precision: 12, scale: 2 }).default("0").notNull(),
  free_delivery_threshold: decimal("free_delivery_threshold", { precision: 12, scale: 2 }).default("0").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id),
  total_amount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  delivery_amount: decimal("delivery_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  status: text("status", { enum: ["pending", "confirmed", "processing", "completed", "cancelled"] }).default("pending").notNull(),
  delivery_address: text("delivery_address"),
  delivery_latitude: decimal("delivery_latitude", { precision: 10, scale: 8 }),
  delivery_longitude: decimal("delivery_longitude", { precision: 11, scale: 8 }),
  delivery_date: timestamp("delivery_date"),
  notes: text("notes"),
  is_delivery: boolean("is_delivery").default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const order_items = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  order_id: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }),
  product_id: uuid("product_id").references(() => products.id),
  quantity: integer("quantity").default(1).notNull(),
  price_per_unit: decimal("price_per_unit", { precision: 12, scale: 2 }).notNull(),
  total_price: decimal("total_price", { precision: 12, scale: 2 }).notNull(),
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
  start_date: timestamp("start_date"),
  end_date: timestamp("end_date"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const cart_items = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  product_id: uuid("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const company_settings = pgTable("company_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  is_delivery: boolean("is_delivery").default(false).notNull(),
  company_name: text("company_name").default("MetalBaza").notNull(),
  company_address: text("company_address"),
  company_phone: text("company_phone"),
  company_email: text("company_email"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const worker_applications = pgTable("worker_applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  client_id: uuid("client_id").references(() => users.id).notNull(),
  worker_id: uuid("worker_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location"),
  location_latitude: decimal("location_latitude", { precision: 10, scale: 8 }),
  location_longitude: decimal("location_longitude", { precision: 11, scale: 8 }),
  budget: decimal("budget", { precision: 12, scale: 2 }),
  status: text("status", { enum: ["pending", "accepted", "rejected", "completed", "cancelled"] }).default("pending").notNull(),
  urgency: text("urgency", { enum: ["low", "medium", "high"] }).default("medium").notNull(),
  contact_phone: text("contact_phone"),
  preferred_date: timestamp("preferred_date"),
  notes: text("notes"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Insert schemas
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

export const insertOrderItemSchema = createInsertSchema(order_items).omit({
  id: true,
  created_at: true,
});

export const insertAdSchema = createInsertSchema(ads).omit({
  id: true,
  created_at: true,
});

export const insertWorkTypeSchema = createInsertSchema(workTypes).omit({
  id: true,
  created_at: true,
});

export const insertCartItemSchema = createInsertSchema(cart_items).omit({
  id: true,
  created_at: true,
});

export const insertCompanySettingsSchema = createInsertSchema(company_settings).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertWorkerApplicationSchema = createInsertSchema(worker_applications).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Types
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof order_items.$inferSelect;
export type Ad = typeof ads.$inferSelect;
export type WorkType = typeof workTypes.$inferSelect;
export type CartItem = typeof cart_items.$inferSelect;
export type CompanySettings = typeof company_settings.$inferSelect;
export type WorkerApplication = typeof worker_applications.$inferSelect;

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof order_items.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Ad = typeof ads.$inferSelect;
export type InsertAd = z.infer<typeof insertAdSchema>;
export type CompanySettings = typeof company_settings.$inferSelect;
export type InsertCompanySettings = z.infer<typeof insertCompanySettingsSchema>;
export type WorkerApplication = typeof worker_applications.$inferSelect;
export type InsertWorkerApplication = z.infer<typeof insertWorkerApplicationSchema>;
