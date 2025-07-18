-- Drop all tables in correct order (reverse of creation order)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS worker_applications CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop all functions and triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create function for updating updated_at column
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
    email VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'worker', 'admin')),
    profile_image TEXT,
    address TEXT,
    date_of_birth DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_uz VARCHAR(255) NOT NULL,
    name_ru VARCHAR(255) NOT NULL,
    description_uz TEXT,
    description_ru TEXT,
    icon_name VARCHAR(100),
    color VARCHAR(7) DEFAULT '#3B82F6',
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
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    unit VARCHAR(50) NOT NULL DEFAULT 'dona',
    is_available BOOLEAN DEFAULT true,
    type VARCHAR(20) NOT NULL DEFAULT 'sale' CHECK (type IN ('sale', 'rent')),
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
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
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
    worker_id UUID REFERENCES users(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    budget DECIMAL(12,2) CHECK (budget >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    urgency VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
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

-- Create indexes for performance
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_order_index ON categories(order_index);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_available ON products(is_available);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_worker_applications_worker_id ON worker_applications(worker_id);
CREATE INDEX idx_worker_applications_client_id ON worker_applications(client_id);
CREATE INDEX idx_worker_applications_status ON worker_applications(status);

-- Insert sample categories
INSERT INTO categories (name_uz, name_ru, description_uz, description_ru, icon_name, color, order_index) VALUES
('Temir-beton', 'Железобетон', 'Qurilish uchun temir-beton mahsulotlari', 'Железобетонные изделия для строительства', '🏗️', '#FF6B35', 1),
('Metalloprokat', 'Металлопрокат', 'Har xil metall mahsulotlar', 'Различные металлические изделия', '🔧', '#004E89', 2),
('Polimerlar', 'Полимеры', 'Plastik va polimer mahsulotlar', 'Пластиковые и полимерные изделия', '🧪', '#009639', 3),
('Asbest-sement', 'Асбест-цемент', 'Asbest-sement mahsulotlari', 'Асбестоцементные изделия', '🏠', '#7209B7', 4),
('Jihozlar', 'Оборудование', 'Qurilish jihozlari va asboblar', 'Строительное оборудование и инструменты', '⚙️', '#F18F01', 5),
('Arenda', 'Аренда', 'Ijaraga beriladigan jihozlar', 'Оборудование в аренду', '📅', '#C73E1D', 6);

-- Insert sample products
INSERT INTO products (name_uz, name_ru, description_uz, description_ru, price, category_id, unit, type, stock_quantity) 
SELECT 
    'Armaturniy prutok 12mm', 'Арматурный пруток 12мм', 'Yuqori sifatli po''lat armatura', 'Высококачественная стальная арматура', 15000, c.id, 'metr', 'sale', 1000
FROM categories c WHERE c.name_uz = 'Temir-beton';

INSERT INTO products (name_uz, name_ru, description_uz, description_ru, price, category_id, unit, type, stock_quantity) 
SELECT 
    'Sement M400', 'Цемент М400', 'Qurilish uchun sement', 'Цемент для строительства', 45000, c.id, 'qop', 'sale', 500
FROM categories c WHERE c.name_uz = 'Temir-beton';

INSERT INTO products (name_uz, name_ru, description_uz, description_ru, price, category_id, unit, type, stock_quantity) 
SELECT 
    'Metalloprokat truba', 'Металлопрокат труба', 'Galvanizlangan truba', 'Оцинкованная труба', 25000, c.id, 'metr', 'sale', 200
FROM categories c WHERE c.name_uz = 'Metalloprokat';

INSERT INTO products (name_uz, name_ru, description_uz, description_ru, price, category_id, unit, type, stock_quantity) 
SELECT 
    'Polietilen quvur', 'Полиэтиленовая труба', 'Suv uchun polietilen quvur', 'Полиэтиленовая труба для воды', 12000, c.id, 'metr', 'sale', 300
FROM categories c WHERE c.name_uz = 'Polimerlar';

INSERT INTO products (name_uz, name_ru, description_uz, description_ru, price, category_id, unit, type, stock_quantity) 
SELECT 
    'Asbest plita', 'Асбестовая плита', 'Qurilish uchun asbest plita', 'Асбестовая плита для строительства', 35000, c.id, 'dona', 'sale', 150
FROM categories c WHERE c.name_uz = 'Asbest-sement';

INSERT INTO products (name_uz, name_ru, description_uz, description_ru, price, category_id, unit, type, stock_quantity) 
SELECT 
    'Beton aralashtirgich', 'Бетономешалка', 'Kichik beton aralashtirgich', 'Малая бетономешалка', 150000, c.id, 'dona', 'rent', 10
FROM categories c WHERE c.name_uz = 'Arenda';

-- Insert sample users
INSERT INTO users (telegram_id, first_name, last_name, phone, role) VALUES
(123456789, 'Test', 'User', '+998901234567', 'client'),
(987654321, 'Admin', 'User', '+998901234568', 'admin'),
(555666777, 'Worker', 'User', '+998901234569', 'worker');

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Categories are public
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

-- Products are public
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);

-- Cart items are private to user
CREATE POLICY "Users can view own cart" ON cart_items FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can insert own cart items" ON cart_items FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can update own cart items" ON cart_items FOR UPDATE USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can delete own cart items" ON cart_items FOR DELETE USING (auth.uid()::text = user_id::text);

-- Orders are private to user
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Order items are viewable by order owner
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND auth.uid()::text = orders.user_id::text)
);

-- Worker applications
CREATE POLICY "Users can view applications they created or are assigned to" ON worker_applications FOR SELECT USING (
    auth.uid()::text = client_id::text OR auth.uid()::text = worker_id::text
);
CREATE POLICY "Users can create applications" ON worker_applications FOR INSERT WITH CHECK (auth.uid()::text = client_id::text);
CREATE POLICY "Users can update applications they created" ON worker_applications FOR UPDATE USING (auth.uid()::text = client_id::text);
