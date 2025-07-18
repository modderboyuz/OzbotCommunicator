-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id TEXT UNIQUE NOT NULL,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    is_worker BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_uz TEXT NOT NULL,
    name_ru TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'package',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name_uz TEXT NOT NULL,
    name_ru TEXT NOT NULL,
    description_uz TEXT,
    description_ru TEXT,
    price DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL DEFAULT 'dona',
    image_url TEXT,
    is_rental BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_address TEXT,
    phone TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ads table
CREATE TABLE IF NOT EXISTS ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_uz TEXT NOT NULL,
    title_ru TEXT NOT NULL,
    description_uz TEXT,
    description_ru TEXT,
    image_url TEXT,
    link_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Telegram login attempts table
CREATE TABLE IF NOT EXISTS telegram_login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
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
INSERT INTO products (category_id, name_uz, name_ru, description_uz, description_ru, price, unit, is_rental) 
SELECT 
    c.id,
    'Tsement M400',
    'Цемент M400',
    'Yuqori sifatli qurilish tsementi',
    'Высококачественный строительный цемент',
    45000,
    'qop',
    false
FROM categories c WHERE c.name_uz = 'Qurilish materiallari'
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name_uz, name_ru, description_uz, description_ru, price, unit, is_rental) 
SELECT 
    c.id,
    'Perforator',
    'Перфоратор',
    'Kuchli perforator ijara uchun',
    'Мощный перфоратор для аренды',
    25000,
    'kun',
    true
FROM categories c WHERE c.name_uz = 'Asboblar'
ON CONFLICT DO NOTHING;

-- Insert sample ad
INSERT INTO ads (title_uz, title_ru, description_uz, description_ru) VALUES
('Yangi mahsulotlar!', 'Новые товары!', 'Eng so''ngi qurilish materiallari', 'Новейшие строительные материалы')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_login_token ON telegram_login_attempts(token);
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_login_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public can read ads" ON ads FOR SELECT USING (true);

CREATE POLICY "Users can read own data" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (true);

CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL USING (true);
CREATE POLICY "Users can manage own orders" ON orders FOR ALL USING (true);
CREATE POLICY "Users can read own order items" ON order_items FOR SELECT USING (true);

CREATE POLICY "Public can create login attempts" ON telegram_login_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read login attempts" ON telegram_login_attempts FOR SELECT USING (true);
CREATE POLICY "Public can update login attempts" ON telegram_login_attempts FOR UPDATE USING (true);
