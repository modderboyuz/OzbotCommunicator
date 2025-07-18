-- Supabase uchun yangi schema (existing schema ga mos)
-- Avval mavjud tabllarni drop qilish
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

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Work types table
CREATE TABLE work_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_uz TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
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
  switched_to TEXT CHECK (switched_to IN ('client', 'admin')),
  
  -- Optional fields for workers
  birth_date DATE,
  passport TEXT,
  passport_image TEXT,
  profile_image TEXT,
  work_type UUID REFERENCES work_types(id),
  description TEXT,
  average_pay INTEGER,
  address TEXT,
  delivery_address TEXT,
  delivery_latitude DECIMAL(10,8),
  delivery_longitude DECIMAL(11,8),
  email TEXT,
  
  -- Legacy fields
  passport_series TEXT,
  passport_number TEXT,
  passport_issued_by TEXT,
  passport_issued_date TIMESTAMP,
  specialization TEXT,
  experience_years INTEGER,
  hourly_rate DECIMAL(10,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_uz TEXT NOT NULL,
  name_ru TEXT,
  icon TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
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
  is_available BOOLEAN DEFAULT true,
  is_rental BOOLEAN DEFAULT false,
  unit TEXT DEFAULT 'dona',
  delivery_price DECIMAL(12,2) DEFAULT 0 NOT NULL,
  free_delivery_threshold DECIMAL(12,2) DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  total_amount DECIMAL(12,2) NOT NULL,
  delivery_amount DECIMAL(12,2) DEFAULT 0 NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'completed', 'cancelled')),
  delivery_address TEXT,
  delivery_latitude DECIMAL(10,8),
  delivery_longitude DECIMAL(11,8),
  delivery_date TIMESTAMP,
  notes TEXT,
  is_delivery BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER DEFAULT 1 NOT NULL,
  price_per_unit DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
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
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Cart items table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Company settings table
CREATE TABLE company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_delivery BOOLEAN DEFAULT false NOT NULL,
  company_name TEXT DEFAULT 'MetalBaza' NOT NULL,
  company_address TEXT,
  company_phone TEXT,
  company_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Worker applications table
CREATE TABLE worker_applications (
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
  preferred_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_worker_applications_client_id ON worker_applications(client_id);
CREATE INDEX idx_worker_applications_worker_id ON worker_applications(worker_id);

-- Sample data
INSERT INTO work_types (name_uz, name_ru, description) VALUES
('Payvandchi', 'Сварщик', 'Metall payvandlash ishlari'),
('Qurilishchi', 'Строитель', 'Qurilish ishlari'),
('Elektrik', 'Электрик', 'Elektr ishlari'),
('Santexnik', 'Сантехник', 'Santexnik ishlari');

-- Sample users
INSERT INTO users (telegram_id, phone, first_name, last_name, telegram_username, role) VALUES
(123456789, '+998901111111', 'Admin', 'User', 'admin', 'admin'),
(987654321, '+998901234567', 'Karim', 'Ustakov', 'karim_usta', 'worker'),
(555666777, '+998909876543', 'Olim', 'Alimov', 'olim_client', 'client');

-- Sample categories
INSERT INTO categories (name_uz, name_ru, order_index) VALUES
('Armatura', 'Арматура', 1),
('Trubalar', 'Трубы', 2),
('Profil', 'Профиль', 3),
('Plastinka', 'Листы', 4),
('Asboblar', 'Инструменты', 5);

-- Sample products
WITH category_ids AS (
  SELECT id, name_uz FROM categories
)
INSERT INTO products (name_uz, name_ru, description_uz, price, category_id, image_url, unit) VALUES
('Armatura 12mm', 'Арматура 12мм', 'Qurilish armaturasi 12mm', 8500.00, (SELECT id FROM category_ids WHERE name_uz = 'Armatura'), '/images/armatura-12mm.jpg', 'metr'),
('Armatura 14mm', 'Арматура 14мм', 'Qurilish armaturasi 14mm', 11200.00, (SELECT id FROM category_ids WHERE name_uz = 'Armatura'), '/images/armatura-14mm.jpg', 'metr'),
('Metall truba 20mm', 'Металлическая труба 20мм', 'Yumaloq metall truba 20mm', 25000.00, (SELECT id FROM category_ids WHERE name_uz = 'Trubalar'), '/images/truba-20mm.jpg', 'metr'),
('Kvadrat profil 20x20', 'Квадратный профиль 20x20', 'Kvadrat metall profil 20x20mm', 18000.00, (SELECT id FROM category_ids WHERE name_uz = 'Profil'), '/images/profil-20x20.jpg', 'metr'),
('Metall plastinka 2mm', 'Металлический лист 2мм', 'Metall plastinka 2mm qalinlikda', 45000.00, (SELECT id FROM category_ids WHERE name_uz = 'Plastinka'), '/images/plastinka-2mm.jpg', 'metr²'),
('Payvandlash elektrod 3mm', 'Сварочный электрод 3мм', 'Payvandlash elektrodlari 3mm', 15000.00, (SELECT id FROM category_ids WHERE name_uz = 'Asboblar'), '/images/elektrod-3mm.jpg', 'kg');

-- Sample ads
INSERT INTO ads (title_uz, title_ru, description_uz, image_url, link_url, is_active) VALUES
('Yangi armatura keldi!', 'Новая арматура поступила!', 'Sifatli armatura 12-16mm gacha', '/images/ad-armatura.jpg', '/catalog', true),
('Trubalar chegirmada', 'Трубы со скидкой', '25% chegirma barcha trubalarga', '/images/ad-trubalar.jpg', '/catalog', true);

-- Company settings
INSERT INTO company_settings (company_name, company_address, company_phone, company_email) VALUES
('MetalBaza LLC', 'Toshkent shahar, Chilonzor tumani', '+998901234567', 'info@metalbaza.uz');

-- Sample worker application
WITH client_user AS (
  SELECT id FROM users WHERE telegram_id = 555666777
),
worker_user AS (
  SELECT id FROM users WHERE telegram_id = 987654321
)
INSERT INTO worker_applications (client_id, worker_id, title, description, location, budget, urgency, contact_phone, notes)
VALUES
(
  (SELECT id FROM client_user),
  (SELECT id FROM worker_user),
  'Uyda payvandlash ishi',
  'Hovlida metall darvoza yasash kerak. Hajmi 2x1.5 metr. Sifatli payvandlash talab qilinadi.',
  'Toshkent, Chilonzor tumani',
  500000,
  'medium',
  '+998901234567',
  'Ish vaqti: ertalab 9:00dan'
);

-- Update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON company_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_applications_updated_at BEFORE UPDATE ON worker_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
