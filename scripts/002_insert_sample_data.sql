-- Insert sample data for MetalBaza application
-- This script populates tables with initial data

-- Insert sample categories
INSERT INTO categories (name_uz, name_ru, description_uz, description_ru, icon) VALUES
('Qurilish materiallari', 'Строительные материалы', 'Asosiy qurilish materiallari', 'Основные строительные материалы', 'building'),
('Asboblar', 'Инструменты', 'Qurilish va ta''mirlash asboblari', 'Строительные и ремонтные инструменты', 'wrench'),
('Transport', 'Транспорт', 'Yuklar tashish uchun transport vositalari', 'Транспортные средства для перевозки грузов', 'truck'),
('Elektr jihozlari', 'Электрооборудование', 'Elektr jihozlari va aksessuarlar', 'Электрооборудование и аксессуары', 'zap')
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (category_id, name_uz, name_ru, description_uz, description_ru, price, unit, is_rental, stock_quantity) VALUES
(
    (SELECT id FROM categories WHERE name_uz = 'Qurilish materiallari' LIMIT 1),
    'Tsement M400',
    'Цемент M400',
    'Yuqori sifatli tsement, qurilish ishlari uchun',
    'Высококачественный цемент для строительных работ',
    85000,
    'tonna',
    false,
    100
),
(
    (SELECT id FROM categories WHERE name_uz = 'Qurilish materiallari' LIMIT 1),
    'G''isht qizil',
    'Кирпич красный',
    'An''anaviy qizil g''isht, devor qurilishi uchun',
    'Традиционный красный кирпич для строительства стен',
    450,
    'dona',
    false,
    5000
),
(
    (SELECT id FROM categories WHERE name_uz = 'Asboblar' LIMIT 1),
    'Perforator Bosch',
    'Перфоратор Bosch',
    'Professional perforator, og''ir ishlar uchun',
    'Профессиональный перфоратор для тяжелых работ',
    1200000,
    'dona',
    false,
    15
),
(
    (SELECT id FROM categories WHERE name_uz = 'Asboblar' LIMIT 1),
    'Elektr drill',
    'Электродрель',
    'Kuchli elektr drill, har xil materiallar uchun',
    'Мощная электродрель для различных материалов',
    350000,
    'dona',
    true,
    25
),
(
    (SELECT id FROM categories WHERE name_uz = 'Transport' LIMIT 1),
    'Yuk mashinasi KAMAZ',
    'Грузовик КАМАЗ',
    'Og''ir yuklarni tashish uchun yuk mashinasi',
    'Грузовик для перевозки тяжелых грузов',
    500000,
    'kun',
    true,
    3
),
(
    (SELECT id FROM categories WHERE name_uz = 'Elektr jihozlari' LIMIT 1),
    'Generator 5kW',
    'Генератор 5кВт',
    'Quvvatli generator, elektr ta''minoti uchun',
    'Мощный генератор для электроснабжения',
    150000,
    'kun',
    true,
    8
)
ON CONFLICT DO NOTHING;

-- Insert sample ads
INSERT INTO ads (title_uz, title_ru, description_uz, description_ru, is_active, display_order) VALUES
('Yangi mahsulotlar keldi!', 'Новые товары поступили!', 'Eng so''nggi qurilish materiallari va asboblar', 'Новейшие строительные материалы и инструменты', true, 1),
('Chegirmalar mavsumi', 'Сезон скидок', '30% gacha chegirma barcha mahsulotlarga', 'Скидки до 30% на все товары', true, 2),
('Professional asboblar', 'Профессиональные инструменты', 'Yuqori sifatli professional asboblar', 'Высококачественные профессиональные инструменты', true, 3)
ON CONFLICT DO NOTHING;

-- Insert sample admin user
INSERT INTO users (phone, first_name, last_name, telegram_username, telegram_id, role, type) VALUES
('+998901234567', 'Admin', 'User', 'admin_user', 123456789, 'admin', 'telegram')
ON CONFLICT (phone) DO NOTHING;
