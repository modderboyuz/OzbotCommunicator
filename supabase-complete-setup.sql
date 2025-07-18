-- Drop existing tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS worker_applications CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing functions and triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id BIGINT UNIQUE,
    username VARCHAR(255),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('client', 'worker', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_uz VARCHAR(255) NOT NULL,
    name_ru VARCHAR(255) NOT NULL,
    icon_name VARCHAR(100),
    color VARCHAR(7) DEFAULT '#000000',
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_uz VARCHAR(255) NOT NULL,
    name_ru VARCHAR(255) NOT NULL,
    description_uz TEXT,
    description_ru TEXT,
    price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    unit VARCHAR(50) NOT NULL DEFAULT 'dona',
    is_available BOOLEAN DEFAULT true,
    type VARCHAR(20) DEFAULT 'sale' CHECK (type IN ('sale', 'rent')),
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create cart_items table
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    delivery_address TEXT,
    phone VARCHAR(20),
    customer_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
    product_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create worker_applications table
CREATE TABLE worker_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    budget DECIMAL(12,2) CHECK (budget >= 0),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    urgency VARCHAR(10) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
    contact_phone VARCHAR(20),
    preferred_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_applications_updated_at BEFORE UPDATE ON worker_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_available ON products(is_available);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_worker_applications_worker_id ON worker_applications(worker_id);
CREATE INDEX idx_worker_applications_client_id ON worker_applications(client_id);
CREATE INDEX idx_worker_applications_status ON worker_applications(status);

-- Insert sample categories
INSERT INTO categories (name_uz, name_ru, icon_name, color, order_index) VALUES
('Temir-beton', 'Железобетон', '🏗️', '#FF6B35', 1),
('Metalloprokat', 'Металлопрокат', '🔧', '#004E89', 2),
('Polimerlar', 'Полимеры', '🧪', '#009639', 3),
('Asbest-sement', 'Асбест-цемент', '🏠', '#7209B7', 4),
('Jihozlar', 'Оборудование', '⚙️', '#F18F01', 5),
('Arenda', 'Аренда', '📅', '#C73E1D', 6);

-- Insert sample products
INSERT INTO products (name_uz, name_ru, description_uz, description_ru, price, unit, category_id, stock_quantity, type) VALUES
('Armaturniy prutok 12mm', 'Арматурный пруток 12мм', 'Yuqori sifatli po''lat armatura', 'Высококачественная стальная арматура', 15000, 'metr', (SELECT id FROM categories WHERE name_uz = 'Temir-beton'), 1000, 'sale'),
('Sement M400', 'Цемент М400', 'Qurilish uchun sement', 'Цемент для строительства', 45000, 'qop', (SELECT id FROM categories WHERE name_uz = 'Temir-beton'), 500, 'sale'),
('Metalloprokat truba', 'Металлопрокат труба', 'Galvanizlangan truba', 'Оцинкованная труба', 25000, 'metr', (SELECT id FROM categories WHERE name_uz = 'Metalloprokat'), 200, 'sale'),
('Polietilen quvur', 'Полиэтиленовая труба', 'Suv uchun polietilen quvur', 'Полиэтиленовая труба для воды', 12000, 'metr', (SELECT id FROM categories WHERE name_uz = 'Polimerlar'), 300, 'sale'),
('Asbest plita', 'Асбестовая плита', 'Qurilish uchun asbest plita', 'Асбестовая плита для строительства', 35000, 'dona', (SELECT id FROM categories WHERE name_uz = 'Asbest-sement'), 150, 'sale'),
('Beton aralashtirgich', 'Бетономешалка', 'Kichik beton aralashtirgich', 'Малая бетономешалка', 150000, 'dona', (SELECT id FROM categories WHERE name_uz = 'Jihozlar'), 10, 'rent');

-- Insert sample admin user
INSERT INTO users (telegram_id, username, first_name, last_name, role) VALUES
(123456789, 'admin', 'Admin', 'User', 'admin');

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Public read access for categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for products" ON products FOR SELECT USING (is_available = true);

-- Create RLS policies for authenticated users
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can manage their own cart" ON cart_items FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage their own orders" ON orders FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can view their own order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id::text = auth.uid()::text)
);

CREATE POLICY "Users can manage their worker applications" ON worker_applications FOR ALL USING (
    auth.uid()::text = worker_id::text OR auth.uid()::text = client_id::text
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
