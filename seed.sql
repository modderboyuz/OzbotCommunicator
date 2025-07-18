-- MetalBaza SQL ma'lumotlar bazasini yaratish va namuna ma'lumotlar qo'shish

-- Kategoriyalar qo'shish
INSERT INTO categories (name_uz, name_ru, icon, order_index, is_active) VALUES
('Temir-beton', 'Железобетон', 'temir-beton', 1, true),
('Metalloprokat', 'Металлопрокат', 'metalloprokat', 2, true),
('Polimerlar', 'Полимеры', 'polimerlar', 3, true),
('Asbest-sement', 'Асбест-цемент', 'asbest-sement', 4, true),
('Jihozlar', 'Оборудование', 'jihozlar', 5, true),
('Arenda', 'Аренда', 'arenda', 6, true);

-- Mahsulotlar qo'shish
INSERT INTO products (name_uz, name_ru, description_uz, description_ru, price, category_id, is_available, is_rental, unit) VALUES
('Temir armatura A500C', 'Арматура A500C', 'Diametri 12mm, uzunligi 12m, yuqori sifatli po''lat', 'Диаметр 12мм, длина 12м, высококачественная сталь', 45000.00, (SELECT id FROM categories WHERE name_uz = 'Temir-beton'), true, false, 'dona'),
('Metall varaq 2mm', 'Металлический лист 2мм', '1250x2500mm o''lcham, galvanizli', 'Размер 1250x2500мм, оцинкованный', 120000.00, (SELECT id FROM categories WHERE name_uz = 'Metalloprokat'), true, false, 'dona'),
('Tsement M400', 'Цемент M400', '50kg qop, yuqori mustahkamlik', 'Мешок 50кг, высокая прочность', 35000.00, (SELECT id FROM categories WHERE name_uz = 'Temir-beton'), true, false, 'qop'),
('Polikarbonat varaq', 'Лист поликарбоната', '6mm qalinlik, 2.1x6m o''lcham', 'Толщина 6мм, размер 2.1x6м', 280000.00, (SELECT id FROM categories WHERE name_uz = 'Polimerlar'), true, false, 'dona'),
('Ekskavator ijarasi', 'Аренда экскаватора', 'Kunlik ijara, operatori bilan, 20 tonna', 'Суточная аренда с оператором, 20 тонн', 450000.00, (SELECT id FROM categories WHERE name_uz = 'Arenda'), true, true, 'kun'),
('Beton aralashtiruvchi', 'Бетономешалка', 'Kunlik ijara, 500L hajm', 'Суточная аренда, объем 500л', 120000.00, (SELECT id FROM categories WHERE name_uz = 'Arenda'), true, true, 'kun'),
('Temir truba', 'Железная труба', 'Diametri 50mm, uzunligi 6m', 'Диаметр 50мм, длина 6м', 65000.00, (SELECT id FROM categories WHERE name_uz = 'Metalloprokat'), true, false, 'dona'),
('Asbest-sement plita', 'Асбестоцементная плита', '3000x1500mm, 12mm qalinlik', 'Размер 3000x1500мм, толщина 12мм', 85000.00, (SELECT id FROM categories WHERE name_uz = 'Asbest-sement'), true, false, 'dona');

-- Reklamalar qo'shish
INSERT INTO ads (title_uz, title_ru, description_uz, description_ru, is_active, start_date, end_date) VALUES
('Yangi mahsulotlar 30% chegirma bilan!', 'Новые товары со скидкой 30%!', 'Cheklangan vaqt uchun barcha yangi mahsulotlar', 'Ограниченное время для всех новых товаров', true, NOW(), NOW() + INTERVAL '30 days'),
('Temir armatura aksiyasi', 'Акция на арматуру', 'A500C armatura uchun maxsus narxlar', 'Специальные цены на арматуру A500C', true, NOW(), NOW() + INTERVAL '15 days'),
('Jihozlar ijarasi - 20% chegirma', 'Аренда оборудования - скидка 20%', 'Barcha qurilish jihozlari uchun', 'Для всего строительного оборудования', true, NOW(), NOW() + INTERVAL '20 days');

-- Test admin foydalanuvchisi (Telegram bot orqali ro'yxatdan o'tgandan keyin yangilanadi)
INSERT INTO users (phone, first_name, last_name, telegram_username, telegram_id, role, type) VALUES
('+998901234567', 'Admin', 'User', 'admin_user', 123456789, 'admin', 'telegram');

-- Namuna buyurtma
INSERT INTO orders (user_id, total_amount, status, delivery_address, notes) VALUES
((SELECT id FROM users WHERE phone = '+998901234567'), 500000.00, 'pending', 'Toshkent, Chilonzor tumani', 'Tezkor yetkazib berish kerak');

-- Buyurtma elementlari
INSERT INTO order_items (order_id, product_id, quantity, price_per_unit, total_price) VALUES
((SELECT id FROM orders WHERE user_id = (SELECT id FROM users WHERE phone = '+998901234567')), 
 (SELECT id FROM products WHERE name_uz = 'Temir armatura A500C'), 
 10, 45000.00, 450000.00),
((SELECT id FROM orders WHERE user_id = (SELECT id FROM users WHERE phone = '+998901234567')), 
 (SELECT id FROM products WHERE name_uz = 'Tsement M400'), 
 2, 35000.00, 70000.00);
