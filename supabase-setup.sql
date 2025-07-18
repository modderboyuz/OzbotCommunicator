-- MetalBaza Database Schema for Supabase
-- Execute this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_uz TEXT NOT NULL,
  name_ru TEXT,
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
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  is_rental BOOLEAN DEFAULT FALSE,
  unit TEXT DEFAULT 'dona',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  total_amount DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'completed', 'cancelled')),
  delivery_address TEXT,
  delivery_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price_per_unit DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Categories are publicly readable
CREATE POLICY "Categories are publicly readable" ON categories FOR SELECT USING (is_active = TRUE);

-- Products are publicly readable
CREATE POLICY "Products are publicly readable" ON products FOR SELECT USING (is_available = TRUE);

-- Orders policies
CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Order items policies
CREATE POLICY "Users can read own order items" ON order_items 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id::text = auth.uid()::text
  )
);

-- Ads are publicly readable
CREATE POLICY "Active ads are publicly readable" ON ads FOR SELECT USING (is_active = TRUE);

-- Insert sample data
INSERT INTO categories (name_uz, name_ru, icon, order_index) VALUES
  ('Metall konstruksiyalar', 'Металлические конструкции', 'building', 1),
  ('Armatula', 'Арматура', 'grid-3x3', 2),
  ('Trubalar', 'Трубы', 'pipe', 3),
  ('Profil metallari', 'Профильные металлы', 'square', 4),
  ('Santexnika', 'Сантехника', 'droplets', 5),
  ('Elektr materiallari', 'Электрические материалы', 'zap', 6);

INSERT INTO products (name_uz, name_ru, description_uz, price, category_id, is_rental, unit) VALUES
  ('Armatula 12mm', 'Арматура 12мм', 'Qurilish uchun armatula 12mm', 25000, (SELECT id FROM categories WHERE name_uz = 'Armatula'), false, 'metr'),
  ('Profil truba 40x40', 'Профильная труба 40x40', 'Kvadrat profil truba', 45000, (SELECT id FROM categories WHERE name_uz = 'Trubalar'), false, 'metr'),
  ('Beton aralashtirgich', 'Бетономешалка', 'Kichik hajmli beton aralashtirgich', 150000, (SELECT id FROM categories WHERE name_uz = 'Metall konstruksiyalar'), true, 'dona'),
  ('Elektr kabeli 2.5mm', 'Электрический кабель 2.5мм', 'Uy uchun elektr kabeli', 8500, (SELECT id FROM categories WHERE name_uz = 'Elektr materiallari'), false, 'metr');

INSERT INTO ads (title_uz, title_ru, description_uz, is_active) VALUES
  ('Yangi mahsulotlar!', 'Новые товары!', 'Eng so''ngi qurilish materiallari', true),
  ('20% chegirma', 'Скидка 20%', 'Barcha metallarga katta chegirma', true);
