-- Supabase uchun to'liq database setup
-- Barcha jadvallarni yaratish va sample data qo'shish

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id BIGINT UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  username VARCHAR(255),
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'client' CHECK (role IN ('client', 'worker', 'admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url VARCHAR(500),
  stock_quantity INTEGER DEFAULT 0,
  unit VARCHAR(50) DEFAULT 'dona',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  delivery_address TEXT,
  delivery_phone VARCHAR(20),
  delivery_type VARCHAR(50) DEFAULT 'delivery' CHECK (delivery_type IN ('delivery', 'pickup')),
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- Ads table
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  link_url VARCHAR(500),
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Worker applications table
CREATE TABLE IF NOT EXISTS worker_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255),
  budget DECIMAL(10,2),
  urgency VARCHAR(50) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  preferred_date TIMESTAMP,
  contact_phone VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Company settings table
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_worker_applications_client_id ON worker_applications(client_id);
CREATE INDEX IF NOT EXISTS idx_worker_applications_worker_id ON worker_applications(worker_id);

-- Sample data

-- Admin user
INSERT INTO users (telegram_id, first_name, last_name, username, role) VALUES
(123456789, 'Admin', 'User', 'admin', 'admin')
ON CONFLICT (telegram_id) DO NOTHING;

-- Worker user
INSERT INTO users (telegram_id, first_name, last_name, username, role) VALUES
(987654321, 'Usta', 'Karimov', 'usta_karim', 'worker')
ON CONFLICT (telegram_id) DO NOTHING;

-- Client user
INSERT INTO users (telegram_id, first_name, last_name, username, role) VALUES
(555666777, 'Olim', 'Alimov', 'olim_client', 'client')
ON CONFLICT (telegram_id) DO NOTHING;

-- Categories
INSERT INTO categories (name, description, sort_order) VALUES
('Metalloprokat', 'Turli xil metall mahsulotlari', 1),
('Trubalar', 'Metall va plastik trubalar', 2),
('Profil', 'Metall profil mahsulotlari', 3),
('Armatura', 'Qurilish armaturasi', 4),
('Plastinka', 'Metall plastinkalar', 5),
('Asbob-uskunalar', 'Qurilish asbob-uskunalari', 6)
ON CONFLICT DO NOTHING;

-- Products
WITH category_ids AS (
  SELECT id, name FROM categories
)
INSERT INTO products (name, description, price, category_id, image_url, stock_quantity, unit) VALUES
('Armatura 12mm', 'Qurilish armaturasi 12mm', 8500.00, (SELECT id FROM category_ids WHERE name = 'Armatura'), '/images/armatura-12mm.jpg', 1000, 'metr'),
('Armatura 14mm', 'Qurilish armaturasi 14mm', 11200.00, (SELECT id FROM category_ids WHERE name = 'Armatura'), '/images/armatura-14mm.jpg', 800, 'metr'),
('Armatura 16mm', 'Qurilish armaturasi 16mm', 14500.00, (SELECT id FROM category_ids WHERE name = 'Armatura'), '/images/armatura-16mm.jpg', 600, 'metr'),
('Metall truba 20mm', 'Yumaloq metall truba 20mm', 25000.00, (SELECT id FROM category_ids WHERE name = 'Trubalar'), '/images/truba-20mm.jpg', 200, 'metr'),
('Metall truba 25mm', 'Yumaloq metall truba 25mm', 32000.00, (SELECT id FROM category_ids WHERE name = 'Trubalar'), '/images/truba-25mm.jpg', 150, 'metr'),
('Kvadrat profil 20x20', 'Kvadrat metall profil 20x20mm', 18000.00, (SELECT id FROM category_ids WHERE name = 'Profil'), '/images/profil-20x20.jpg', 300, 'metr'),
('Kvadrat profil 25x25', 'Kvadrat metall profil 25x25mm', 22000.00, (SELECT id FROM category_ids WHERE name = 'Profil'), '/images/profil-25x25.jpg', 250, 'metr'),
('Metall plastinka 2mm', 'Metall plastinka 2mm qalinlikda', 45000.00, (SELECT id FROM category_ids WHERE name = 'Plastinka'), '/images/plastinka-2mm.jpg', 100, 'metr²'),
('Metall plastinka 3mm', 'Metall plastinka 3mm qalinlikda', 62000.00, (SELECT id FROM category_ids WHERE name = 'Plastinka'), '/images/plastinka-3mm.jpg', 80, 'metr²'),
('Payvandlash elektrod 3mm', 'Payvandlash elektrodlari 3mm', 15000.00, (SELECT id FROM category_ids WHERE name = 'Asbob-uskunalar'), '/images/elektrod-3mm.jpg', 500, 'kg'),
('Payvandlash elektrod 4mm', 'Payvandlash elektrodlari 4mm', 16500.00, (SELECT id FROM category_ids WHERE name = 'Asbob-uskunalar'), '/images/elektrod-4mm.jpg', 400, 'kg'),
('Bolg''a 500g', 'Metall bolg''a 500 gramm', 35000.00, (SELECT id FROM category_ids WHERE name = 'Asbob-uskunalar'), '/images/bolga-500g.jpg', 50, 'dona')
ON CONFLICT DO NOTHING;

-- Sample ads
INSERT INTO ads (title, description, image_url, link_url, position, is_active) VALUES
('Yangi armatura keldi!', 'Sifatli armatura 12-16mm gacha', '/images/ad-armatura.jpg', '/catalog?category=armatura', 1, true),
('Trubalar chegirmada', '25% chegirma barcha trubalarga', '/images/ad-trubalar.jpg', '/catalog?category=trubalar', 2, true),
('Professional asboblar', 'Yuqori sifatli asbob-uskunalar', '/images/ad-asboblar.jpg', '/catalog?category=asbob-uskunalar', 3, true)
ON CONFLICT DO NOTHING;

-- Company settings
INSERT INTO company_settings (key, value, description) VALUES
('company_name', 'MetalBaza LLC', 'Kompaniya nomi'),
('company_phone', '+998901234567', 'Kompaniya telefon raqami'),
('company_address', 'Toshkent shahar, Chilonzor tumani', 'Kompaniya manzili'),
('delivery_fee_tashkent', '25000', 'Toshkent shahri uchun yetkazib berish narxi'),
('delivery_fee_regions', '50000', 'Viloyatlar uchun yetkazib berish narxi'),
('min_order_amount', '100000', 'Minimal buyurtma summasi'),
('working_hours', '9:00-18:00', 'Ish vaqti')
ON CONFLICT (key) DO NOTHING;

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_updated_at BEFORE UPDATE ON cart FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_applications_updated_at BEFORE UPDATE ON worker_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON company_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample worker application
WITH client_user AS (
  SELECT id FROM users WHERE telegram_id = 555666777
),
worker_user AS (
  SELECT id FROM users WHERE telegram_id = 987654321
)
INSERT INTO worker_applications (client_id, worker_id, title, description, location, budget, urgency, status, contact_phone, notes)
VALUES
(
  (SELECT id FROM client_user),
  (SELECT id FROM worker_user),
  'Uyda payvandlash ishi',
  'Hovlida metall darvoza yasash kerak. Hajmi 2x1.5 metr. Sifatli payvandlash talab qilinadi.',
  'Toshkent, Chilonzor tumani',
  500000,
  'medium',
  'pending',
  '+998901234567',
  'Ish vaqti: ertalab 9:00dan'
)
ON CONFLICT DO NOTHING;
