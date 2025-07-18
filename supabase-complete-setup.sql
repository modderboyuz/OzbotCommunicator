-- MetalBaza Complete Database Setup
-- Drop all existing tables and recreate everything

-- Drop all tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.worker_applications CASCADE;
DROP TABLE IF EXISTS public.worker_reviews CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.ads CASCADE;
DROP TABLE IF EXISTS public.company_settings CASCADE;
DROP TABLE IF EXISTS public.data_users CASCADE;
DROP TABLE IF EXISTS public.temp_login_tokens CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.work_types CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_tokens() CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create work_types table
CREATE TABLE public.work_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_uz TEXT NOT NULL,
    name_ru TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE,
    username TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'client' CHECK (role IN ('client', 'worker', 'admin')),
    type TEXT DEFAULT 'telegram' CHECK (type IN ('telegram', 'web')),
    is_active BOOLEAN DEFAULT true,
    
    -- Worker specific fields
    work_type_id UUID REFERENCES public.work_types(id),
    description TEXT,
    average_pay INTEGER,
    address TEXT,
    birth_date DATE,
    passport TEXT,
    passport_image TEXT,
    profile_image TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create categories table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_uz TEXT NOT NULL,
    name_ru TEXT NOT NULL,
    description_uz TEXT,
    description_ru TEXT,
    icon TEXT DEFAULT 'package',
    color TEXT DEFAULT '#3B82F6',
    parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_uz TEXT NOT NULL,
    name_ru TEXT NOT NULL,
    description_uz TEXT,
    description_ru TEXT,
    price DECIMAL(12,2) NOT NULL,
    image_url TEXT,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    unit TEXT DEFAULT 'dona',
    is_available BOOLEAN DEFAULT true,
    is_rental BOOLEAN DEFAULT false,
    stock_quantity INTEGER DEFAULT 0,
    min_order_quantity INTEGER DEFAULT 1,
    delivery_price DECIMAL(12,2) DEFAULT 0,
    free_delivery_threshold DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create cart_items table
CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    total_amount DECIMAL(12,2) NOT NULL,
    delivery_amount DECIMAL(12,2) DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    delivery_address TEXT,
    delivery_latitude DECIMAL(10,8),
    delivery_longitude DECIMAL(11,8),
    delivery_date TIMESTAMP WITH TIME ZONE,
    phone TEXT,
    customer_name TEXT,
    notes TEXT,
    is_delivery BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create order_items table
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_per_unit DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create ads table
CREATE TABLE public.ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_uz TEXT NOT NULL,
    title_ru TEXT NOT NULL,
    description_uz TEXT,
    description_ru TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create worker_applications table
CREATE TABLE public.worker_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT,
    location_latitude DECIMAL(10,8),
    location_longitude DECIMAL(11,8),
    budget DECIMAL(12,2),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
    urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
    contact_phone TEXT,
    preferred_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create worker_reviews table
CREATE TABLE public.worker_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create company_settings table
CREATE TABLE public.company_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT DEFAULT 'MetalBaza' NOT NULL,
    company_address TEXT,
    company_phone TEXT,
    company_email TEXT,
    is_delivery BOOLEAN DEFAULT false,
    delivery_fee_tashkent DECIMAL(12,2) DEFAULT 25000,
    delivery_fee_regions DECIMAL(12,2) DEFAULT 50000,
    min_order_amount DECIMAL(12,2) DEFAULT 100000,
    working_hours TEXT DEFAULT '9:00-18:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create temp_login_tokens table for Telegram OAuth
CREATE TABLE public.temp_login_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token TEXT NOT NULL UNIQUE,
    client_id TEXT NOT NULL,
    telegram_id BIGINT,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_users_telegram_id ON public.users(telegram_id);
CREATE INDEX idx_users_phone ON public.users(phone);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_is_available ON public.products(is_available);
CREATE INDEX idx_products_price ON public.products(price);
CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX idx_worker_applications_client_id ON public.worker_applications(client_id);
CREATE INDEX idx_worker_applications_worker_id ON public.worker_applications(worker_id);
CREATE INDEX idx_worker_applications_status ON public.worker_applications(status);
CREATE INDEX idx_worker_reviews_worker_id ON public.worker_reviews(worker_id);
CREATE INDEX idx_ads_is_active ON public.ads(is_active);
CREATE INDEX idx_temp_tokens_token ON public.temp_login_tokens(token);
CREATE INDEX idx_temp_tokens_expires ON public.temp_login_tokens(expires_at);

-- Create update_updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON public.ads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_applications_updated_at BEFORE UPDATE ON public.worker_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_worker_reviews_updated_at BEFORE UPDATE ON public.worker_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample work types
INSERT INTO public.work_types (name_uz, name_ru, description) VALUES
('Payvandchi', 'Сварщик', 'Metall payvandlash ishlari'),
('Qurilishchi', 'Строитель', 'Qurilish va ta''mirlash ishlari'),
('Elektrik', 'Электрик', 'Elektr montaj ishlari'),
('Santexnik', 'Сантехник', 'Santexnik ishlari'),
('Usta', 'Мастер', 'Umumiy ta''mirlash ishlari');

-- Insert sample categories
INSERT INTO public.categories (name_uz, name_ru, description_uz, description_ru, icon, color, order_index) VALUES
('Armatura', 'Арматура', 'Qurilish armaturasi', 'Строительная арматура', 'grid-3x3', '#FF6B35', 1),
('Trubalar', 'Трубы', 'Metall va plastik trubalar', 'Металлические и пластиковые трубы', 'pipe', '#4ECDC4', 2),
('Profil', 'Профиль', 'Metall profil mahsulotlari', 'Металлические профили', 'square', '#45B7D1', 3),
('Plastinka', 'Листы', 'Metall plastinkalar', 'Металлические листы', 'layers', '#96CEB4', 4),
('Asboblar', 'Инструменты', 'Qurilish asboblari', 'Строительные инструменты', 'wrench', '#FFEAA7', 5),
('Elektr', 'Электрика', 'Elektr materiallari', 'Электрические материалы', 'zap', '#DDA0DD', 6);

-- Insert sample products
INSERT INTO public.products (name_uz, name_ru, description_uz, description_ru, price, category_id, unit, stock_quantity, is_rental) VALUES
('Armatura 12mm', 'Арматура 12мм', 'Yuqori sifatli qurilish armaturasi 12mm', 'Высококачественная строительная арматура 12мм', 8500.00, (SELECT id FROM public.categories WHERE name_uz = 'Armatura'), 'metr', 1000, false),
('Armatura 14mm', 'Арматура 14мм', 'Yuqori sifatli qurilish armaturasi 14mm', 'Высококачественная строительная арматура 14мм', 11200.00, (SELECT id FROM public.categories WHERE name_uz = 'Armatura'), 'metr', 800, false),
('Armatura 16mm', 'Арматура 16мм', 'Yuqori sifatli qurilish armaturasi 16mm', 'Высококачественная строительная арматура 16мм', 14500.00, (SELECT id FROM public.categories WHERE name_uz = 'Armatura'), 'metr', 600, false),
('Metall truba 20mm', 'Металлическая труба 20мм', 'Yumaloq metall truba 20mm', 'Круглая металлическая труба 20мм', 25000.00, (SELECT id FROM public.categories WHERE name_uz = 'Trubalar'), 'metr', 200, false),
('Metall truba 25mm', 'Металлическая труба 25мм', 'Yumaloq metall truba 25mm', 'Круглая металлическая труба 25мм', 32000.00, (SELECT id FROM public.categories WHERE name_uz = 'Trubalar'), 'metr', 150, false),
('Kvadrat profil 20x20', 'Квадратный профиль 20x20', 'Kvadrat metall profil 20x20mm', 'Квадратный металлический профиль 20x20мм', 18000.00, (SELECT id FROM public.categories WHERE name_uz = 'Profil'), 'metr', 300, false),
('Kvadrat profil 25x25', 'Квадратный профиль 25x25', 'Kvadrat metall profil 25x25mm', 'Квадратный металлический профиль 25x25мм', 22000.00, (SELECT id FROM public.categories WHERE name_uz = 'Profil'), 'metr', 250, false),
('Metall plastinka 2mm', 'Металлический лист 2мм', 'Metall plastinka 2mm qalinlikda', 'Металлический лист толщиной 2мм', 45000.00, (SELECT id FROM public.categories WHERE name_uz = 'Plastinka'), 'metr²', 100, false),
('Metall plastinka 3mm', 'Металлический лист 3мм', 'Metall plastinka 3mm qalinlikda', 'Металлический лист толщиной 3мм', 62000.00, (SELECT id FROM public.categories WHERE name_uz = 'Plastinka'), 'metr²', 80, false),
('Payvandlash elektrod 3mm', 'Сварочный электрод 3мм', 'Payvandlash elektrodlari 3mm', 'Сварочные электроды 3мм', 15000.00, (SELECT id FROM public.categories WHERE name_uz = 'Asboblar'), 'kg', 500, false),
('Payvandlash elektrod 4mm', 'Сварочный электрод 4мм', 'Payvandlash elektrodlari 4mm', 'Сварочные электроды 4мм', 16500.00, (SELECT id FROM public.categories WHERE name_uz = 'Asboblar'), 'kg', 400, false),
('Bolg''a 500g', 'Молоток 500г', 'Metall bolg''a 500 gramm', 'Металлический молоток 500 грамм', 35000.00, (SELECT id FROM public.categories WHERE name_uz = 'Asboblar'), 'dona', 50, false),
('Beton aralashtirgich', 'Бетономешалка', 'Kichik hajmli beton aralashtirgich', 'Малогабаритная бетономешалка', 1500000.00, (SELECT id FROM public.categories WHERE name_uz = 'Asboblar'), 'dona', 5, true),
('Elektr kabeli 2.5mm', 'Электрический кабель 2.5мм', 'Uy uchun elektr kabeli 2.5mm', 'Электрический кабель для дома 2.5мм', 8500.00, (SELECT id FROM public.categories WHERE name_uz = 'Elektr'), 'metr', 1000, false);

-- Insert sample ads
INSERT INTO public.ads (title_uz, title_ru, description_uz, description_ru, image_url, order_index, is_active) VALUES
('Yangi armatura keldi!', 'Новая арматура поступила!', 'Sifatli armatura 12-16mm gacha', 'Качественная арматура 12-16мм', '/placeholder.svg?height=200&width=800', 1, true),
('Trubalar chegirmada', 'Трубы со скидкой', '25% chegirma barcha trubalarga', 'Скидка 25% на все трубы', '/placeholder.svg?height=200&width=800', 2, true),
('Professional asboblar', 'Профессиональные инструменты', 'Yuqori sifatli asbob-uskunalar', 'Высококачественные инструменты', '/placeholder.svg?height=200&width=800', 3, true);

-- Insert sample users
INSERT INTO public.users (telegram_id, first_name, last_name, username, phone, role) VALUES
(123456789, 'Admin', 'User', 'admin', '+998901234567', 'admin'),
(987654321, 'Karim', 'Ustakov', 'karim_usta', '+998901111111', 'worker'),
(555666777, 'Olim', 'Alimov', 'olim_client', '+998909876543', 'client');

-- Insert company settings
INSERT INTO public.company_settings (company_name, company_address, company_phone, company_email, is_delivery) VALUES
('MetalBaza LLC', 'Toshkent shahar, Chilonzor tumani', '+998901234567', 'info@metalbaza.uz', true);

-- Create cleanup function for expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM public.temp_login_tokens 
    WHERE expires_at < NOW() OR is_used = true;
END;
$$ LANGUAGE plpgsql;
