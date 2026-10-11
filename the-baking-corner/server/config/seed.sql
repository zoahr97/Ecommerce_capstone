-- ==========================================
-- 0. Reset Tables (Clean Slate)
-- ==========================================
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE products;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- 1. Insert Products (36 Items Total)
-- ==========================================
INSERT INTO products (name, description, price, category, stock, image_url) VALUES 

-- ============ INGREDIENTS (VIP ITEMS FIRST) ============
('Dark Chocolate 70%', 'Belgian dark chocolate coins for baking, 1 kg', 65.00, 'ingredients', 30, '/images/Dark-Chocolate-70%.jpg'),
('Milk Chocolate 34%', 'High-quality milk chocolate coins for melting, 1 kg', 62.00, 'ingredients', 25, '/images/Milk-Chocolate-34%.jpg'),
('White Chocolate 30%', 'Rich white chocolate coins for baking and coating, 1 kg', 68.00, 'ingredients', 20, '/images/White-Chocolate-30%.jpg'),
('Dutch Cocoa Powder', 'High-fat premium cocoa powder 22-24%, 500g', 24.00, 'ingredients', 35, '/images/Dutch-Cocoa-Powder.jpg'),
('Premium Vanilla Extract', 'Pure Madagascar vanilla extract, 50 ml', 42.00, 'ingredients', 20, '/images/Premium-Vanilla-Extract.jpg'),
('100% Pistachio Paste', 'Pure pistachio paste with no added sugar, 200g', 55.00, 'ingredients', 15, '/images/100%-Pistachio-Paste.jpg'),
('Cornstarch', 'Gluten-free cornstarch for baking and creams, 500g', 12.00, 'ingredients', 40, '/images/Cornstarch.jpg'),
('Active Dry Yeast', 'Vacuum-packed dry yeast for yeast doughs, 500g', 15.00, 'ingredients', 40, '/images/Active-Dry-Yeast.jpg'),
('Red Gel Food Coloring', 'Concentrated gel food coloring for creams and fondant', 18.00, 'ingredients', 25, '/images/Red-Gel-Food-Coloring.jpg'),
('Blue Gel Food Coloring', 'Concentrated gel food coloring for creams and fondant', 18.00, 'ingredients', 22, '/images/Blue-Gel-Food-Coloring.jpg'),
('Powdered Sugar', 'Finely ground powdered sugar for icing and whipping, 1 kg', 9.00, 'ingredients', 60, '/images/Powdered-Sugar.jpg'),
('Rainbow Sprinkles', 'Decorative sprinkle pack for cakes and desserts, 250g', 14.00, 'ingredients', 45, '/images/Rainbow-Sprinkles.jpg'),
('Baking Powder', 'Pack of 10 baking powder sachets (100g total)', 6.00, 'ingredients', 80, '/images/Baking-Powder.jpg'),
('Baking Soda', 'Baking soda powder for baking, 250g', 5.00, 'ingredients', 70, '/images/Baking-Soda.jpg'),
('White Wheat Flour', 'All-purpose wheat flour for baking, 1 kg', 8.50, 'ingredients', 50, '/images/White-Wheat-Flour.jpg'),
('Fish Gelatin Powder', 'Kosher gelatin powder for stabilizing mousses and desserts, 100g', 16.00, 'ingredients', 30, '/images/Fish-Gelatin-Powder.jpg'),
('Shredded Coconut', 'Natural white shredded coconut flakes, 200g', 14.90, 'ingredients', 35, '/images/Shredded-Coconut.jpg'),
('Blanched Sliced Almonds', 'Premium blanched and sliced almonds, 200g', 24.00, 'ingredients', 30, '/images/Blanched-Sliced-Almonds.jpg'),
('Chopped Walnuts', 'Freshly chopped walnuts for baking, 200g', 28.00, 'ingredients', 25, '/images/Chopped-Walnuts.jpg'),
('Canola Baking Oil', 'Neutral-flavored canola oil for baking, 1 L', 15.50, 'ingredients', 50, '/images/Canola-Baking-Oil.jpg'),

-- ============ EQUIPMENT ============
('Springform Pan 24cm', 'Round non-stick detachable baking pan', 55.00, 'equipment', 15, '/images/Springform-Pan-24cm.jpg'),
('Springform Pan 26cm', 'Round non-stick detachable baking pan', 60.00, 'equipment', 12, '/images/Springform-Pan-26cm.jpg'),
('Reusable Loaf Pan', 'High-quality metal pan for loaf cakes', 32.00, 'equipment', 25, '/images/Reusable-Loaf-Pan.jpg'),
('Muffin Silicone Pan', '12-cavity silicone pan for muffins and cupcakes', 45.00, 'equipment', 18, '/images/Muffin-Silicone-Pan.jpg'),
('Large Silicone Spatula', 'Heat-resistant silicone spatula up to 250°C', 22.00, 'equipment', 40, '/images/Large-Silicone-Spatula.jpg'),
('Digital Kitchen Scale', 'Precision digital scale accurate to 1g', 89.00, 'equipment', 10, '/images/Digital-Kitchen-Scale.jpg'),
('Professional Whisk', 'Sturdy stainless steel whisk for whipping', 35.00, 'equipment', 25, '/images/Professional-Whisk.jpg'),
('Disposable Piping Bags', 'Pack of 100 thick, heavy-duty piping bags (40cm)', 30.00, 'equipment', 50, '/images/Disposable-Piping-Bags.jpg'),
('Piping Nozzles Set', 'Set of 12 stainless steel nozzles in various shapes', 48.00, 'equipment', 20, '/images/Piping-Nozzles-Set.jpg'),
('Adjustable Rolling Pin', 'Wooden rolling pin with silicone rings for dough thickness control', 65.00, 'equipment', 14, '/images/Adjustable-Rolling-Pin.jpg'),
('Dough Scraper', 'Stainless steel scraper for cutting and cleaning work surfaces', 18.00, 'equipment', 30, '/images/Dough-Scraper.jpg'),
('Silicone Baking Mat', 'Reusable oven silicone baking mat (Silpat) 30x40 cm', 42.00, 'equipment', 22, '/images/Silicone-Baking-Mat.jpg'),
('Rotating Cake Turntable', 'Stainless steel rotating stand for cake decorating', 110.00, 'equipment', 8, '/images/Rotating-Cake-Turntable.jpg'),
('Digital Food Thermometer', 'Digital probe thermometer for precise sugar and chocolate work', 55.00, 'equipment', 15, '/images/Digital-Food-Thermometer.jpg'),
('Cake Cooling Rack', 'Rectangular stainless steel wire rack for cooling baked goods', 38.00, 'equipment', 18, '/images/Cake-Cooling-Rack.jpg'),
('Flexible Silicone Spatula', 'Flexible heat-resistant silicone spatula', 25.00, 'equipment', 40, '/images/Flexible-Silicone-Spatula.jpg');


-- ==========================================
-- 2. Insert Admins & Customers
-- ==========================================
INSERT INTO users (first_name, last_name, email, password, role) VALUES
('Shira Rachel', 'Tal', 'shira@thebakingcorner.com', '$2b$10$aAZma8vCGGsUgzkSwchmCOh42l67gKYT3tNwK5uLNFkR2xejk2ufW', 'admin'),
('Zohar', 'Timsut', 'Zohar@thebakingcorner.com', '$2b$10$aAZma8vCGGsUgzkSwchmCOh42l67gKYT3tNwK5uLNFkR2xejk2ufW', 'admin'),
('Israel', 'Israeli', 'israel@gmail.com', '$2b$10$yxSUdieRtkMQ.5TbRTZ0dOmNkszKVubRjHc4rNZJ5wiaQHmTaXRtC', 'customer'),
('Noa', 'Cohen', 'noa.cohen@gmail.com', '$2b$10$yxSUdieRtkMQ.5TbRTZ0dOmNkszKVubRjHc4rNZJ5wiaQHmTaXRtC', 'customer'),
('Daniel', 'Levi', 'daniel.levi@gmail.com', '$2b$10$yxSUdieRtkMQ.5TbRTZ0dOmNkszKVubRjHc4rNZJ5wiaQHmTaXRtC', 'customer'),
('Maya', 'Mizrachi', 'maya.m@gmail.com', '$2b$10$yxSUdieRtkMQ.5TbRTZ0dOmNkszKVubRjHc4rNZJ5wiaQHmTaXRtC', 'customer'),
('Ori', 'Peretz', 'ori.p@gmail.com', '$2b$10$yxSUdieRtkMQ.5TbRTZ0dOmNkszKVubRjHc4rNZJ5wiaQHmTaXRtC', 'customer'),
('Tamar', 'Biton', 'tamar.b@gmail.com', '$2b$10$yxSUdieRtkMQ.5TbRTZ0dOmNkszKVubRjHc4rNZJ5wiaQHmTaXRtC', 'customer'),
('Yossi', 'Avraham', 'yossi.a@gmail.com', '$2b$10$yxSUdieRtkMQ.5TbRTZ0dOmNkszKVubRjHc4rNZJ5wiaQHmTaXRtC', 'customer'),
('Shira', 'Haddad', 'shira.h@gmail.com', '$2b$10$yxSUdieRtkMQ.5TbRTZ0dOmNkszKVubRjHc4rNZJ5wiaQHmTaXRtC', 'customer'),
('Omer', 'Dahan', 'omer.d@gmail.com', '$2b$10$yxSUdieRtkMQ.5TbRTZ0dOmNkszKVubRjHc4rNZJ5wiaQHmTaXRtC', 'customer');

-- ==========================================
-- 3. Insert Sample Orders
-- ==========================================
INSERT INTO orders (user_id, total_amount, status) VALUES 
(4, 114.50, 'delivered'),
(5, 89.00, 'pending'),
(6, 142.00, 'shipped'),
(7, 42.00, 'delivered'),
(8, 175.00, 'pending'),
(9, 65.00, 'cancelled'),
(10, 210.00, 'delivered'),
(11, 55.00, 'pending');

-- ==========================================
-- 4. Insert Order Items 
-- ==========================================
-- Order 1 (User 4)
INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES 
(1, 7, 2, 8.50),   -- 2 x White Wheat Flour (Now ID 7)
(1, 5, 1, 42.00),  -- 1 x Vanilla Extract (Now ID 5)
(1, 21, 1, 55.00); -- 1 x Springform Pan 24cm (ID 21)

-- Order 2 (User 5)
INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES 
(2, 26, 1, 89.00); -- 1 x Digital Kitchen Scale (ID 26)

-- Order 3 (User 6)
INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES 
(3, 1, 2, 65.00),  -- 2 x Dark Chocolate 70% (Now ID 1)
(3, 13, 2, 6.00);  -- 2 x Baking Powder (ID 13)

-- Order 4 (User 7)
INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES 
(4, 32, 1, 42.00); -- 1 x Silicone Baking Mat (ID 32)

-- Order 5 (User 8)
INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES 
(5, 33, 1, 110.00), -- 1 x Rotating Cake Turntable (ID 33)
(5, 30, 1, 65.00);  -- 1 x Adjustable Rolling Pin (ID 30)

-- Order 6 (User 9)
INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES 
(6, 34, 1, 55.00);  -- 1 x Food Thermometer (ID 34)

-- Order 7 (User 10)
INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES 
(7, 6, 2, 55.00),   -- 2 x Pistachio Paste (Now ID 6)
(7, 29, 1, 48.00),  -- 1 x Piping Nozzles Set (ID 29)
(7, 28, 1, 30.00),  -- 1 x Disposable Piping Bags (ID 28)
(7, 25, 1, 22.00);  -- 1 x Large Silicone Spatula (ID 25)

-- Order 8 (User 11)
INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES 
(8, 24, 1, 45.00),  -- 1 x Muffin Silicone Pan (ID 24)
(8, 11, 1, 10.00);  -- 1 x Powdered Sugar (Now ID 11)