-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id TEXT UNIQUE,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_uz TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  icon TEXT DEFAULT 'package',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name_uz TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  description_uz TEXT,
  description_ru TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  unit TEXT DEFAULT 'dona',
  is_rental BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ads table
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_uz TEXT NOT NULL,
  title_ru TEXT NOT NULL,
  description_uz TEXT,
  description_ru TEXT,
  image_url TEXT,
  link_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  delivery_address TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create telegram_login_attempts table
CREATE TABLE IF NOT EXISTS telegram_login_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample categories
INSERT INTO categories (name_uz, name_ru, icon) VALUES
('Qurilish materiallari', 'Строительные материалы', 'building'),
('Asboblar', 'Инструменты', 'wrench'),
('Transport', 'Транспорт', 'truck'),
('Elektr jihozlari', 'Электрооборудование', 'zap')
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (category_id, name_uz, name_ru, description_uz, description_ru, price, unit) 
SELECT 
  c.id,
  'Tsement M400',
  'Цемент M400',
  'Yuqori sifatli qurilish tsementi',
  'Высококачественный строительный цемент',
  45000,
  'qop'
FROM categories c WHERE c.name_uz = 'Qurilish materiallari'
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name_uz, name_ru, description_uz, description_ru, price, unit) 
SELECT 
  c.id,
  'Elektr drel',
  'Электродрель',
  'Professional elektr drel',
  'Профессиональная электродрель',
  350000,
  'dona'
FROM categories c WHERE c.name_uz = 'Asboblar'
ON CONFLICT DO NOTHING;

-- Insert sample ads
INSERT INTO ads (title_uz, title_ru, description_uz, description_ru, link_url) VALUES
('Yangi mahsulotlar!', 'Новые товары!', 'Eng so''ngi qurilish materiallari', 'Новейшие строительные материалы', 'https://example.com'),
('Chegirmalar!', 'Скидки!', '50% gacha chegirma', 'Скидки до 50%', 'https://example.com')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_login_attempts_token ON telegram_login_attempts(token);
CREATE INDEX IF NOT EXISTS idx_telegram_login_attempts_telegram_id ON telegram_login_attempts(telegram_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_login_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can modify these based on your needs)
CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Allow public read access to ads" ON ads FOR SELECT USING (is_active = true);

-- Create policies for authenticated users
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (true);
CREATE POLICY "Allow insert for new users" ON users FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can manage their cart" ON cart_items FOR ALL USING (true);
CREATE POLICY "Users can manage their orders" ON orders FOR ALL USING (true);
CREATE POLICY "Users can view order items" ON order_items FOR SELECT USING (true);

CREATE POLICY "Allow telegram login attempts" ON telegram_login_attempts FOR ALL USING (true);
