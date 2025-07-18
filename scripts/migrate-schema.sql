-- Add new columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS delivery_price DECIMAL(12,2) DEFAULT 0 NOT NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS free_delivery_threshold DECIMAL(12,2) DEFAULT 0 NOT NULL;

-- Add new columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_amount DECIMAL(12,2) DEFAULT 0 NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_latitude DECIMAL(10,8);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_longitude DECIMAL(11,8);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_delivery BOOLEAN DEFAULT false;

-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS delivery_latitude DECIMAL(10,8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS delivery_longitude DECIMAL(11,8);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;

-- Create company_settings table
CREATE TABLE IF NOT EXISTS company_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_delivery BOOLEAN DEFAULT false NOT NULL,
    company_name TEXT DEFAULT 'MetalBaza' NOT NULL,
    company_address TEXT,
    company_phone TEXT,
    company_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Insert default company settings
INSERT INTO company_settings (is_delivery, company_name, company_address, company_phone, company_email)
VALUES (true, 'MetalBaza', 'Toshkent, O''zbekiston', '+998901234567', 'info@metalbaza.uz')
ON CONFLICT (id) DO NOTHING;

-- If no rows exist, insert the default
INSERT INTO company_settings (is_delivery, company_name, company_address, company_phone, company_email)
SELECT true, 'MetalBaza', 'Toshkent, O''zbekiston', '+998901234567', 'info@metalbaza.uz'
WHERE NOT EXISTS (SELECT 1 FROM company_settings);
