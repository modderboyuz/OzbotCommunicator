-- Fix constraints and add missing columns
-- This script addresses any constraint issues and adds missing functionality

-- Update products table to ensure all required fields have proper constraints
ALTER TABLE products 
    ALTER COLUMN price SET NOT NULL,
    ALTER COLUMN name_uz SET NOT NULL;

-- Add unique constraint to category names
ALTER TABLE categories 
    ADD CONSTRAINT unique_category_name_uz UNIQUE (name_uz);

-- Ensure order items have proper constraints
ALTER TABLE order_items
    ALTER COLUMN quantity SET NOT NULL,
    ALTER COLUMN unit_price SET NOT NULL,
    ALTER COLUMN total_price SET NOT NULL,
    ADD CONSTRAINT positive_quantity CHECK (quantity > 0),
    ADD CONSTRAINT positive_unit_price CHECK (unit_price > 0),
    ADD CONSTRAINT positive_total_price CHECK (total_price > 0);

-- Add constraint to ensure total_price = quantity * unit_price
-- This will be enforced at application level for flexibility

-- Update orders table constraints
ALTER TABLE orders
    ADD CONSTRAINT positive_total_amount CHECK (total_amount >= 0);

-- Add product availability check
ALTER TABLE products
    ADD CONSTRAINT non_negative_stock CHECK (stock_quantity >= 0),
    ADD CONSTRAINT positive_min_order CHECK (min_order_quantity > 0);

-- Create function to update order total when order items change
CREATE OR REPLACE FUNCTION update_order_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE orders 
    SET total_amount = (
        SELECT COALESCE(SUM(total_price), 0) 
        FROM order_items 
        WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
    )
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update order totals
DROP TRIGGER IF EXISTS update_order_total_on_insert ON order_items;
DROP TRIGGER IF EXISTS update_order_total_on_update ON order_items;
DROP TRIGGER IF EXISTS update_order_total_on_delete ON order_items;

CREATE TRIGGER update_order_total_on_insert
    AFTER INSERT ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_order_total();

CREATE TRIGGER update_order_total_on_update
    AFTER UPDATE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_order_total();

CREATE TRIGGER update_order_total_on_delete
    AFTER DELETE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_order_total();

-- Add RLS (Row Level Security) preparation (can be enabled later if needed)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create view for order summary
CREATE OR REPLACE VIEW order_summary AS
SELECT 
    o.id,
    o.user_id,
    u.first_name || ' ' || u.last_name AS user_name,
    u.phone,
    o.total_amount,
    o.status,
    o.delivery_address,
    o.delivery_date,
    o.created_at,
    COUNT(oi.id) AS item_count
FROM orders o
JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, u.id, u.first_name, u.last_name, u.phone, o.total_amount, o.status, o.delivery_address, o.delivery_date, o.created_at;

-- Create view for product inventory
CREATE OR REPLACE VIEW product_inventory AS
SELECT 
    p.id,
    p.name_uz,
    p.name_ru,
    c.name_uz AS category_name,
    p.price,
    p.unit,
    p.stock_quantity,
    p.min_order_quantity,
    p.is_available,
    p.is_rental,
    CASE 
        WHEN p.stock_quantity <= p.min_order_quantity THEN 'LOW'
        WHEN p.stock_quantity = 0 THEN 'OUT_OF_STOCK'
        ELSE 'AVAILABLE'
    END AS stock_status
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;
