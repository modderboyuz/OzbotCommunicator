-- MetalBaza database ni to'liq reset qilish
-- Barcha jadvallarni o'chirish
DROP TABLE IF EXISTS worker_reviews CASCADE;
DROP TABLE IF EXISTS worker_applications CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS ads CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS company_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS work_types CASCADE;
DROP TABLE IF EXISTS temp_tokens CASCADE;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Temp tokens table for Telegram login
CREATE TABLE temp_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT UNIQUE NOT NULL,
  telegram_id BIGINT NOT NULL,
  client_id TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Work types table
CREATE TABLE work_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_uz TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
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
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_uz TEXT NOT NULL,
  name_ru TEXT,
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  total_amount DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'completed', 'cancelled')),
  delivery_address TEXT,
  delivery_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER DEFAULT 1 NOT NULL,
  price_per_unit DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart items table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Ads table
CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_uz TEXT NOT NULL,
  title_ru TEXT,
  description_uz TEXT,
  description_ru TEXT,
  image_url TEXT,
  link_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Worker applications table
CREATE TABLE worker_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES users(id) NOT NULL,
  worker_id UUID REFERENCES users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  budget DECIMAL(12,2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
  contact_phone TEXT,
  preferred_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Worker reviews table
CREATE TABLE worker_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES users(id) NOT NULL,
  client_id UUID REFERENCES users(id) NOT NULL,
  application_id UUID REFERENCES worker_applications(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_available ON products(is_available);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_worker_applications_client_id ON worker_applications(client_id);
CREATE INDEX idx_worker_applications_worker_id ON worker_applications(worker_id);
CREATE INDEX idx_worker_applications_status ON worker_applications(status);
CREATE INDEX idx_worker_reviews_worker_id ON worker_reviews(worker_id);
CREATE INDEX idx_temp_tokens_token ON temp_tokens(token);
CREATE INDEX idx_temp_tokens_expires ON temp_tokens(expires_at);

-- Sample data
INSERT INTO work_types (name_uz, name_ru, description) VALUES
('Payvandchi', 'Сварщик', 'Metall payvandlash ishlari'),
('Qurilishchi', 'Строитель', 'Qurilish ishlari'),
('Elektrik', 'Электрик', 'Elektr ishlari'),
('Santexnik', 'Сантехник', 'Santexnik ishlari'),
('Usta', 'Мастер', 'Umumiy qurilish ishlari');

INSERT INTO categories (name_uz, name_ru, icon, order_index) VALUES
('Armatura', 'Арматура', 'grid-3x3', 1),
('Trubalar', 'Трубы', 'pipe', 2),
('Profil', 'Профиль', 'square', 3),
('Plastinka', 'Листы', 'layers', 4),
('Asboblar', 'Инструменты', 'wrench', 5),
('Elektr', 'Электрика', 'zap', 6);

INSERT INTO products (name_uz, name_ru, description_uz, price, category_id, unit) VALUES
('Armatura 12mm', 'Арматура 12мм', 'Qurilish armaturasi 12mm diametr', 8500.00, (SELECT id FROM categories WHERE name_uz = 'Armatura'), 'metr'),
('Armatura 14mm', 'Арматура 14мм', 'Qurilish armaturasi 14mm diametr', 11200.00, (SELECT id FROM categories WHERE name_uz = 'Armatura'), 'metr'),
('Metall truba 20mm', 'Металлическая труба 20мм', 'Yumaloq metall truba 20mm', 25000.00, (SELECT id FROM categories WHERE name_uz = 'Trubalar'), 'metr'),
('Kvadrat profil 20x20', 'Квадратный профиль 20x20', 'Kvadrat metall profil', 18000.00, (SELECT id FROM categories WHERE name_uz = 'Profil'), 'metr'),
('Metall plastinka 2mm', 'Металлический лист 2мм', 'Metall plastinka 2mm qalinlik', 45000.00, (SELECT id FROM categories WHERE name_uz = 'Plastinka'), 'metr²'),
('Elektrod 3mm', 'Электрод 3мм', 'Payvandlash elektrodlari', 15000.00, (SELECT id FROM categories WHERE name_uz = 'Asboblar'), 'kg');

INSERT INTO ads (title_uz, title_ru, description_uz, is_active) VALUES
('Yangi armatura keldi!', 'Новая арматура поступила!', 'Sifatli armatura 12-16mm', TRUE),
('Chegirmalar mavsumi', 'Сезон скидок', '25% chegirma barcha mahsulotlarga', TRUE);

-- Sample users
INSERT INTO users (telegram_id, phone, first_name, last_name, telegram_username, role) VALUES
(123456789, '+998901111111', 'Admin', 'User', 'admin', 'admin'),
(987654321, '+998901234567', 'Karim', 'Ustakov', 'karim_usta', 'worker'),
(555666777, '+998909876543', 'Olim', 'Alimov', 'olim_client', 'client');

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
