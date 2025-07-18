/*
  # MetalBaza - Complete Database Schema

  1. New Tables
    - `temp_tokens` - Telegram login tokens
    - `work_types` - Worker specializations
    - `users` - User accounts with roles
    - `categories` - Product categories
    - `products` - Product catalog
    - `orders` - Customer orders
    - `order_items` - Order line items
    - `cart_items` - Shopping cart
    - `ads` - Advertisement banners
    - `worker_applications` - Job applications
    - `worker_reviews` - Worker ratings

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure data access by user role

  3. Sample Data
    - Categories and products
    - Test users with different roles
    - Sample advertisements
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Temp tokens table for Telegram login
CREATE TABLE IF NOT EXISTS temp_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT UNIQUE NOT NULL,
  telegram_id BIGINT NOT NULL,
  client_id TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Work types table
CREATE TABLE IF NOT EXISTS work_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_uz TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  telegram_username TEXT,
  telegram_id BIGINT UNIQUE,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'worker', 'admin')),
  type TEXT NOT NULL DEFAULT 'telegram' CHECK (type IN ('telegram', 'google')),
  
  -- Worker fields
  work_type_id UUID REFERENCES work_types(id),
  description TEXT,
  experience_years INTEGER,
  hourly_rate DECIMAL(10,2),
  address TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_uz TEXT NOT NULL,
  name_ru TEXT,
  parent_id UUID REFERENCES categories(id),
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_uz TEXT NOT NULL,
  name_ru TEXT,
  description_uz TEXT,
  description_ru TEXT,
  price DECIMAL(12,2) NOT NULL,
  category_id UUID REFERENCES categories(id),
  subcategory_id UUID REFERENCES categories(id),
  image_url TEXT,
  images TEXT[],
  is_available BOOLEAN DEFAULT TRUE,
  is_rental BOOLEAN DEFAULT FALSE,
  unit TEXT DEFAULT 'dona',
  stock_quantity INTEGER DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  delivery_available BOOLEAN DEFAULT TRUE,
  delivery_price DECIMAL(12,2) DEFAULT 0,
  free_delivery_threshold DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  total_amount DECIMAL(12,2) NOT NULL,
  delivery_amount DECIMAL(12,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'completed', 'cancelled')),
  delivery_address TEXT,
  delivery_latitude DECIMAL(10,8),
  delivery_longitude DECIMAL(11,8),
  delivery_date TIMESTAMPTZ,
  notes TEXT,
  is_delivery BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER DEFAULT 1 NOT NULL,
  price_per_unit DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Ads table
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_uz TEXT NOT NULL,
  title_ru TEXT,
  description_uz TEXT,
  description_ru TEXT,
  image_url TEXT,
  link_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Worker applications table
CREATE TABLE IF NOT EXISTS worker_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES users(id) NOT NULL,
  worker_id UUID REFERENCES users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  location_latitude DECIMAL(10,8),
  location_longitude DECIMAL(11,8),
  budget DECIMAL(12,2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
  contact_phone TEXT,
  preferred_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Worker reviews table
CREATE TABLE IF NOT EXISTS worker_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES users(id) NOT NULL,
  client_id UUID REFERENCES users(id) NOT NULL,
  application_id UUID REFERENCES worker_applications(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_worker_applications_client_id ON worker_applications(client_id);
CREATE INDEX IF NOT EXISTS idx_worker_applications_worker_id ON worker_applications(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_applications_status ON worker_applications(status);
CREATE INDEX IF NOT EXISTS idx_worker_reviews_worker_id ON worker_reviews(worker_id);
CREATE INDEX IF NOT EXISTS idx_temp_tokens_token ON temp_tokens(token);
CREATE INDEX IF NOT EXISTS idx_temp_tokens_expires ON temp_tokens(expires_at);

-- Enable Row Level Security
ALTER TABLE temp_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Temp tokens - only accessible by system
CREATE POLICY "System access only" ON temp_tokens FOR ALL USING (false);

-- Work types - publicly readable
CREATE POLICY "Work types are publicly readable" ON work_types FOR SELECT USING (true);

-- Users - users can read their own data
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Categories - publicly readable
CREATE POLICY "Categories are publicly readable" ON categories FOR SELECT USING (is_active = true);

-- Products - publicly readable
CREATE POLICY "Products are publicly readable" ON products FOR SELECT USING (is_available = true);

-- Orders - users can access their own orders
CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Order items - accessible through orders
CREATE POLICY "Users can read own order items" ON order_items 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id::text = auth.uid()::text
  )
);

-- Cart items - users can access their own cart
CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (auth.uid()::text = user_id::text);

-- Ads - publicly readable
CREATE POLICY "Active ads are publicly readable" ON ads FOR SELECT USING (is_active = true);

-- Worker applications - clients and workers can access their applications
CREATE POLICY "Users can access their applications" ON worker_applications 
FOR SELECT USING (
  auth.uid()::text = client_id::text OR auth.uid()::text = worker_id::text
);

CREATE POLICY "Clients can create applications" ON worker_applications 
FOR INSERT WITH CHECK (auth.uid()::text = client_id::text);

CREATE POLICY "Workers can update applications" ON worker_applications 
FOR UPDATE USING (auth.uid()::text = worker_id::text);

-- Worker reviews - publicly readable, clients can create
CREATE POLICY "Reviews are publicly readable" ON worker_reviews FOR SELECT USING (true);
CREATE POLICY "Clients can create reviews" ON worker_reviews FOR INSERT WITH CHECK (auth.uid()::text = client_id::text);

-- Sample data

-- Work types
INSERT INTO work_types (name_uz, name_ru, description) VALUES
('Payvandchi', 'Сварщик', 'Metall payvandlash ishlari'),
('Qurilishchi', 'Строитель', 'Qurilish ishlari'),
('Elektrik', 'Электрик', 'Elektr ishlari'),
('Santexnik', 'Сантехник', 'Santexnik ishlari'),
('Usta', 'Мастер', 'Umumiy qurilish ishlari')
ON CONFLICT DO NOTHING;

-- Categories
INSERT INTO categories (name_uz, name_ru, icon, order_index) VALUES
('Armatura', 'Арматура', 'grid-3x3', 1),
('Trubalar', 'Трубы', 'pipe', 2),
('Profil', 'Профиль', 'square', 3),
('Plastinka', 'Листы', 'layers', 4),
('Asboblar', 'Инструменты', 'wrench', 5),
('Elektr', 'Электрика', 'zap', 6)
ON CONFLICT DO NOTHING;

-- Products
INSERT INTO products (name_uz, name_ru, description_uz, price, category_id, unit) VALUES
('Armatura 12mm', 'Арматура 12мм', 'Qurilish armaturasi 12mm diametr', 8500.00, (SELECT id FROM categories WHERE name_uz = 'Armatura' LIMIT 1), 'metr'),
('Armatura 14mm', 'Арматура 14мм', 'Qurilish armaturasi 14mm diametr', 11200.00, (SELECT id FROM categories WHERE name_uz = 'Armatura' LIMIT 1), 'metr'),
('Armatura 16mm', 'Арматура 16мм', 'Qurilish armaturasi 16mm diametr', 14500.00, (SELECT id FROM categories WHERE name_uz = 'Armatura' LIMIT 1), 'metr'),
('Metall truba 20mm', 'Металлическая труба 20мм', 'Yumaloq metall truba 20mm', 25000.00, (SELECT id FROM categories WHERE name_uz = 'Trubalar' LIMIT 1), 'metr'),
('Metall truba 25mm', 'Металлическая труба 25мм', 'Yumaloq metall truba 25mm', 32000.00, (SELECT id FROM categories WHERE name_uz = 'Trubalar' LIMIT 1), 'metr'),
('Kvadrat profil 20x20', 'Квадратный профиль 20x20', 'Kvadrat metall profil', 18000.00, (SELECT id FROM categories WHERE name_uz = 'Profil' LIMIT 1), 'metr'),
('Kvadrat profil 25x25', 'Квадратный профиль 25x25', 'Kvadrat metall profil', 22000.00, (SELECT id FROM categories WHERE name_uz = 'Profil' LIMIT 1), 'metr'),
('Metall plastinka 2mm', 'Металлический лист 2мм', 'Metall plastinka 2mm qalinlik', 45000.00, (SELECT id FROM categories WHERE name_uz = 'Plastinka' LIMIT 1), 'metr²'),
('Metall plastinka 3mm', 'Металлический лист 3мм', 'Metall plastinka 3mm qalinlik', 62000.00, (SELECT id FROM categories WHERE name_uz = 'Plastinka' LIMIT 1), 'metr²'),
('Elektrod 3mm', 'Электрод 3мм', 'Payvandlash elektrodlari', 15000.00, (SELECT id FROM categories WHERE name_uz = 'Asboblar' LIMIT 1), 'kg'),
('Elektrod 4mm', 'Электрод 4мм', 'Payvandlash elektrodlari', 16500.00, (SELECT id FROM categories WHERE name_uz = 'Asboblar' LIMIT 1), 'kg'),
('Bolg''a 500g', 'Молоток 500г', 'Metall bolg''a 500 gramm', 35000.00, (SELECT id FROM categories WHERE name_uz = 'Asboblar' LIMIT 1), 'dona')
ON CONFLICT DO NOTHING;

-- Ads
INSERT INTO ads (title_uz, title_ru, description_uz, is_active) VALUES
('Yangi armatura keldi!', 'Новая арматура поступила!', 'Sifatli armatura 12-16mm', TRUE),
('Chegirmalar mavsumi', 'Сезон скидок', '25% chegirma barcha mahsulotlarga', TRUE),
('Professional asboblar', 'Профессиональные инструменты', 'Yuqori sifatli asboblar', TRUE)
ON CONFLICT DO NOTHING;

-- Sample users (these will be created via Telegram bot in real usage)
INSERT INTO users (telegram_id, phone, first_name, last_name, telegram_username, role) VALUES
(123456789, '+998901111111', 'Admin', 'User', 'admin', 'admin'),
(987654321, '+998901234567', 'Karim', 'Ustakov', 'karim_usta', 'worker'),
(555666777, '+998909876543', 'Olim', 'Alimov', 'olim_client', 'client')
ON CONFLICT (telegram_id) DO NOTHING;

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_applications_updated_at BEFORE UPDATE ON worker_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
