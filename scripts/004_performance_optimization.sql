-- Performance optimization and additional indexes
-- This script adds performance improvements and useful functions

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_category_available ON products(category_id, is_available);
CREATE INDEX IF NOT EXISTS idx_products_price_range ON products(price) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_date ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_users_role_type ON users(role, type);

-- Add full-text search indexes for product search
CREATE INDEX IF NOT EXISTS idx_products_search_uz ON products USING gin(to_tsvector('simple', name_uz || ' ' || COALESCE(description_uz, '')));
CREATE INDEX IF NOT EXISTS idx_products_search_ru ON products USING gin(to_tsvector('russian', COALESCE(name_ru, '') || ' ' || COALESCE(description_ru, '')));

-- Create function for product search
CREATE OR REPLACE FUNCTION search_products(search_query TEXT, lang TEXT DEFAULT 'uz')
RETURNS TABLE (
    id UUID,
    name_uz VARCHAR,
    name_ru VARCHAR,
    description_uz TEXT,
    description_ru TEXT,
    price DECIMAL,
    unit VARCHAR,
    is_rental BOOLEAN,
    is_available BOOLEAN,
    category_name VARCHAR,
    relevance REAL
) AS $$
BEGIN
    IF lang = 'ru' THEN
        RETURN QUERY
        SELECT 
            p.id,
            p.name_uz,
            p.name_ru,
            p.description_uz,
            p.description_ru,
            p.price,
            p.unit,
            p.is_rental,
            p.is_available,
            c.name_ru AS category_name,
            ts_rank(to_tsvector('russian', COALESCE(p.name_ru, '') || ' ' || COALESCE(p.description_ru, '')), 
                   plainto_tsquery('russian', search_query)) AS relevance
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_available = true
          AND to_tsvector('russian', COALESCE(p.name_ru, '') || ' ' || COALESCE(p.description_ru, '')) @@ plainto_tsquery('russian', search_query)
        ORDER BY relevance DESC;
    ELSE
        RETURN QUERY
        SELECT 
            p.id,
            p.name_uz,
            p.name_ru,
            p.description_uz,
            p.description_ru,
            p.price,
            p.unit,
            p.is_rental,
            p.is_available,
            c.name_uz AS category_name,
            ts_rank(to_tsvector('simple', p.name_uz || ' ' || COALESCE(p.description_uz, '')), 
                   plainto_tsquery('simple', search_query)) AS relevance
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_available = true
          AND to_tsvector('simple', p.name_uz || ' ' || COALESCE(p.description_uz, '')) @@ plainto_tsquery('simple', search_query)
        ORDER BY relevance DESC;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to get popular products
CREATE OR REPLACE FUNCTION get_popular_products(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    name_uz VARCHAR,
    name_ru VARCHAR,
    price DECIMAL,
    unit VARCHAR,
    order_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name_uz,
        p.name_ru,
        p.price,
        p.unit,
        COUNT(oi.id) AS order_count
    FROM products p
    LEFT JOIN order_items oi ON p.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id
    WHERE p.is_available = true
      AND (o.status IS NULL OR o.status IN ('confirmed', 'processing', 'completed'))
    GROUP BY p.id, p.name_uz, p.name_ru, p.price, p.unit
    ORDER BY order_count DESC, p.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user order history
CREATE OR REPLACE FUNCTION get_user_order_history(user_telegram_id BIGINT)
RETURNS TABLE (
    order_id UUID,
    total_amount DECIMAL,
    status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    item_count BIGINT,
    product_names TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id AS order_id,
        o.total_amount,
        o.status,
        o.created_at,
        COUNT(oi.id) AS item_count,
        STRING_AGG(p.name_uz, ', ') AS product_names
    FROM orders o
    JOIN users u ON o.user_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE u.telegram_id = user_telegram_id
    GROUP BY o.id, o.total_amount, o.status, o.created_at
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to update product stock
CREATE OR REPLACE FUNCTION update_product_stock(
    product_id UUID,
    quantity_change INTEGER,
    operation VARCHAR DEFAULT 'subtract'
) RETURNS BOOLEAN AS $$
DECLARE
    current_stock INTEGER;
BEGIN
    -- Get current stock
    SELECT stock_quantity INTO current_stock
    FROM products
    WHERE id = product_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update stock based on operation
    IF operation = 'add' THEN
        UPDATE products
        SET stock_quantity = stock_quantity + quantity_change,
            updated_at = NOW()
        WHERE id = product_id;
    ELSIF operation = 'subtract' THEN
        -- Check if we have enough stock
        IF current_stock < quantity_change THEN
            RETURN FALSE;
        END IF;
        
        UPDATE products
        SET stock_quantity = stock_quantity - quantity_change,
            updated_at = NOW()
        WHERE id = product_id;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for dashboard statistics (refresh manually or with cron)
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE type = 'telegram') AS total_telegram_users,
    (SELECT COUNT(*) FROM orders WHERE status = 'pending') AS pending_orders,
    (SELECT COUNT(*) FROM orders WHERE status = 'completed') AS completed_orders,
    (SELECT COUNT(*) FROM products WHERE is_available = true) AS available_products,
    (SELECT COUNT(*) FROM products WHERE stock_quantity <= min_order_quantity) AS low_stock_products,
    (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'completed' AND created_at >= CURRENT_DATE - INTERVAL '30 days') AS revenue_last_30_days,
    CURRENT_TIMESTAMP AS last_updated;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_stats_updated ON dashboard_stats(last_updated);

-- Function to refresh dashboard stats
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW dashboard_stats;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comments to tables
COMMENT ON TABLE users IS 'User accounts for both Telegram and web users';
COMMENT ON TABLE categories IS 'Product categories with multilingual support';
COMMENT ON TABLE products IS 'Products available for sale or rental';
COMMENT ON TABLE orders IS 'Customer orders with status tracking';
COMMENT ON TABLE order_items IS 'Individual items within orders';
COMMENT ON TABLE ads IS 'Promotional advertisements and banners';

-- Add helpful comments to important columns
COMMENT ON COLUMN products.is_rental IS 'Whether this product is available for rental';
COMMENT ON COLUMN products.stock_quantity IS 'Current stock quantity available';
COMMENT ON COLUMN order_items.rental_duration_days IS 'Duration in days for rental items';
COMMENT ON COLUMN users.telegram_id IS 'Telegram user ID for bot integration';
