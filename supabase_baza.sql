-- MetalBaza Full Database Migration with Sensitive Data Separation
-- Run this SQL on your Supabase database

-- 1. Create data_users table for sensitive personal information (admin-only access)
CREATE TABLE IF NOT EXISTS public.data_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    birth_date DATE NULL,
    passport_series TEXT NULL,
    passport_number TEXT NULL,
    passport_image TEXT NULL,
    passport_issued_by TEXT NULL,
    passport_issued_date TIMESTAMP WITHOUT TIME ZONE NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 2. Create temporary login tokens for Telegram OAuth
CREATE TABLE IF NOT EXISTS public.temp_login_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    client_id TEXT NOT NULL,
    timestamp_created TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
    is_used BOOLEAN DEFAULT false,
    telegram_id BIGINT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 3. Ensure all existing tables exist with proper structure
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    telegram_id BIGINT UNIQUE,
    username TEXT,
    first_name TEXT NOT NULL,
    last_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'client' CHECK (role IN ('client', 'worker', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name_uz TEXT NOT NULL,
    name_ru TEXT NOT NULL,
    icon_name TEXT,
    color TEXT DEFAULT '#3B82F6',
    parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name_uz TEXT NOT NULL,
    name_ru TEXT NOT NULL,
    description_uz TEXT,
    description_ru TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    unit TEXT DEFAULT 'dona',
    is_available BOOLEAN DEFAULT true,
    type TEXT DEFAULT 'sale' CHECK (type IN ('sale', 'rent')),
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    delivery_address TEXT,
    phone TEXT,
    notes TEXT,
    customer_name TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title_uz TEXT NOT NULL,
    title_ru TEXT NOT NULL,
    description_uz TEXT,
    description_ru TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.worker_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.worker_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    worker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    job_description TEXT NOT NULL,
    address TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.company_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL DEFAULT 'MetalBaza',
    phone TEXT DEFAULT '+998901234567',
    address TEXT DEFAULT 'Toshkent, O''zbekiston',
    work_hours TEXT DEFAULT '9:00 - 18:00',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_data_users_user_id ON public.data_users(user_id);
CREATE INDEX IF NOT EXISTS idx_temp_tokens_token ON public.temp_login_tokens(token);
CREATE INDEX IF NOT EXISTS idx_temp_tokens_expires ON public.temp_login_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON public.users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_cart_user_product ON public.cart_items(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_worker_reviews_worker ON public.worker_reviews(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_applications_worker ON public.worker_applications(worker_id);

-- Insert sample data
INSERT INTO public.categories (name_uz, name_ru, icon_name, color, order_index) VALUES
('Metallarga ishlov berish', 'Обработка металлов', 'hammer', '#FF6B35', 1),
('Payvandlash', 'Сварка', 'flame', '#4ECDC4', 2),
('Kesish', 'Резка', 'scissors', '#45B7D1', 3),
('Quyish', 'Литье', 'droplet', '#96CEB4', 4),
('Shakllantirish', 'Формовка', 'shape', '#FFEAA7', 5),
('Silliqlik', 'Полировка', 'circle', '#DDA0DD', 6)
ON CONFLICT DO NOTHING;

INSERT INTO public.products (name_uz, name_ru, description_uz, description_ru, price, image_url, category_id, unit, stock_quantity) 
SELECT 
    'Metall plita', 'Металлическая плита', 'Yuqori sifatli metall plita', 'Высококачественная металлическая плита', 
    150000, '/placeholder.svg?height=300&width=400', c.id, 'dona', 50
FROM public.categories c WHERE c.name_uz = 'Metallarga ishlov berish' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.ads (title_uz, title_ru, description_uz, description_ru, image_url, order_index) VALUES
('Yangi mahsulotlar', 'Новые товары', 'Eng yangi mahsulotlarimiz bilan tanishing', 'Ознакомьтесь с нашими новейшими продуктами', '/placeholder.svg?height=200&width=800', 1),
('Chegirmalar', 'Скидки', '50% gacha chegirma', 'Скидки до 50%', '/placeholder.svg?height=200&width=800', 2),
('Tez yetkazib berish', 'Быстрая доставка', '24 soat ichida yetkazib berish', 'Доставка в течение 24 часов', '/placeholder.svg?height=200&width=800', 3)
ON CONFLICT DO NOTHING;

INSERT INTO public.company_settings (company_name, phone, address, work_hours) VALUES
('MetalBaza', '+998901234567', 'Toshkent, O''zbekiston', '9:00 - 18:00')
ON CONFLICT DO NOTHING;

-- Create functions for data management
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Cleanup old tokens function
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM public.temp_login_tokens 
    WHERE expires_at < NOW() OR is_used = true;
END;
$$ LANGUAGE plpgsql;
