-- =============================================
-- 永安茶園 - 測試數據種子文件
-- =============================================

-- ============================================
-- 1. 創建測試管理員用戶
-- ============================================
INSERT INTO users (id, email, name, name_zh, is_admin, created_at, updated_at)
VALUES
    ('00000000-0000-0000-0000-000000000001'::uuid, 's225002731@gmail.com', 'Admin', '管理員', true, NOW(), NOW()),
    ('00000000-0000-0000-0000-000000000002'::uuid, 'test@example.com', 'Test User', '測試用戶', false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. 創建茶品類別
-- ============================================
INSERT INTO categories (name, name_zh, slug, description, is_active, display_order, created_at, updated_at)
VALUES
    ('Green Tea', '綠茶', 'green-tea', '清新爽口的綠茶系列', true, 1, NOW(), NOW()),
    ('Black Tea', '紅茶', 'black-tea', '濃郁醇厚的紅茶系列', true, 2, NOW(), NOW()),
    ('Oolong Tea', '烏龍茶', 'oolong-tea', '半發酵的烏龍茶系列', true, 3, NOW(), NOW()),
    ('Pu-erh Tea', '普洱茶', 'puerh-tea', '陳年普洱茶系列', true, 4, NOW(), NOW()),
    ('White Tea', '白茶', 'white-tea', '輕發酵白茶系列', true, 5, NOW(), NOW()),
    ('Tea Accessories', '茶具', 'tea-accessories', '精選茶具配件', true, 6, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 3. 創建標籤
-- ============================================
INSERT INTO tags (name, name_zh, slug, created_at, updated_at)
VALUES
    ('Organic', '有機', 'organic', NOW(), NOW()),
    ('High Mountain', '高山', 'high-mountain', NOW(), NOW()),
    ('Spring Harvest', '春茶', 'spring-harvest', NOW(), NOW()),
    ('Winter Harvest', '冬茶', 'winter-harvest', NOW(), NOW()),
    ('Light Roast', '輕焙', 'light-roast', NOW(), NOW()),
    ('Heavy Roast', '重焙', 'heavy-roast', NOW(), NOW()),
    ('Award Winning', '得獎', 'award-winning', NOW(), NOW()),
    ('Limited Edition', '限量', 'limited-edition', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 4. 創建示範產品（根據你的圖片）
-- ============================================
INSERT INTO products (
    name, name_zh, slug, description, category_id, price, sale_price, sku, stock, weight,
    is_active, is_featured, category, created_at, updated_at
)
VALUES
    -- 不知春
    (
        'Bu Zhi Chun', '不知春', 'bu-zhi-chun',
        '台東鹿野高山茶，清香回甘，茶湯金黃明亮',
        (SELECT id FROM categories WHERE slug = 'oolong-tea'),
        800.00, 720.00, 'TEA-001', 50, 150,
        true, true, 'tea', NOW(), NOW()
    ),
    -- 福鹿冬片
    (
        'Fu Lu Winter', '福鹿冬片', 'fu-lu-winter',
        '台東鹿野冬季茶，茶香濃郁，口感醇厚',
        (SELECT id FROM categories WHERE slug = 'oolong-tea'),
        900.00, null, 'TEA-002', 30, 150,
        true, true, 'tea', NOW(), NOW()
    ),
    -- 紅烏龍
    (
        'Red Oolong', '紅烏龍', 'red-oolong',
        '台東特色紅烏龍，果香濃郁，甘甜順口',
        (SELECT id FROM categories WHERE slug = 'oolong-tea'),
        1000.00, 900.00, 'TEA-003', 40, 150,
        true, true, 'tea', NOW(), NOW()
    ),
    -- 紅烏龍禮盒
    (
        'Red Oolong Gift Box', '紅烏龍禮盒', 'red-oolong-gift-box',
        '精美禮盒裝，送禮自用兩相宜',
        (SELECT id FROM categories WHERE slug = 'oolong-tea'),
        2500.00, null, 'GIFT-001', 20, 600,
        true, false, 'gift', NOW(), NOW()
    ),
    -- 紅烏龍手工茶餅
    (
        'Red Oolong Tea Cake', '紅烏龍手工茶餅', 'red-oolong-tea-cake',
        '手工製作茶餅，方便攜帶，風味獨特',
        (SELECT id FROM categories WHERE slug = 'oolong-tea'),
        1200.00, null, 'TEA-004', 25, 200,
        true, false, 'tea', NOW(), NOW()
    )
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 5. 為產品添加圖片（使用現有的 public 圖片）
-- ============================================
UPDATE products SET images = ARRAY[
    '/images/products/不知春.jpg'
] WHERE slug = 'bu-zhi-chun';

UPDATE products SET images = ARRAY[
    '/images/products/福鹿冬片.jpg'
] WHERE slug = 'fu-lu-winter';

UPDATE products SET images = ARRAY[
    '/images/products/紅烏龍.jpg'
] WHERE slug = 'red-oolong';

UPDATE products SET images = ARRAY[
    '/images/products/紅烏龍禮盒.jpg'
] WHERE slug = 'red-oolong-gift-box';

UPDATE products SET images = ARRAY[
    '/images/products/紅烏龍手工茶餅.jpg'
] WHERE slug = 'red-oolong-tea-cake';

-- ============================================
-- 6. 添加產品屬性
-- ============================================
INSERT INTO product_attributes (product_id, name, name_zh, value, created_at, updated_at)
SELECT
    p.id,
    'Origin',
    '產地',
    '台東鹿野',
    NOW(),
    NOW()
FROM products p
WHERE p.slug IN ('bu-zhi-chun', 'fu-lu-winter', 'red-oolong', 'red-oolong-tea-cake')
ON CONFLICT DO NOTHING;

INSERT INTO product_attributes (product_id, name, name_zh, value, created_at, updated_at)
SELECT
    p.id,
    'Fermentation',
    '發酵程度',
    '半發酵',
    NOW(),
    NOW()
FROM products p
WHERE p.slug IN ('bu-zhi-chun', 'fu-lu-winter')
ON CONFLICT DO NOTHING;

INSERT INTO product_attributes (product_id, name, name_zh, value, created_at, updated_at)
SELECT
    p.id,
    'Fermentation',
    '發酵程度',
    '重發酵',
    NOW(),
    NOW()
FROM products p
WHERE p.slug IN ('red-oolong', 'red-oolong-tea-cake')
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. 關聯產品和標籤
-- ============================================
-- 不知春：有機、高山、春茶
INSERT INTO products_tags (product_id, tag_id, created_at)
SELECT
    p.id,
    t.id,
    NOW()
FROM products p
CROSS JOIN tags t
WHERE p.slug = 'bu-zhi-chun'
AND t.slug IN ('organic', 'high-mountain', 'spring-harvest')
ON CONFLICT DO NOTHING;

-- 福鹿冬片：高山、冬茶
INSERT INTO products_tags (product_id, tag_id, created_at)
SELECT
    p.id,
    t.id,
    NOW()
FROM products p
CROSS JOIN tags t
WHERE p.slug = 'fu-lu-winter'
AND t.slug IN ('high-mountain', 'winter-harvest')
ON CONFLICT DO NOTHING;

-- 紅烏龍：有機、得獎、重焙
INSERT INTO products_tags (product_id, tag_id, created_at)
SELECT
    p.id,
    t.id,
    NOW()
FROM products p
CROSS JOIN tags t
WHERE p.slug = 'red-oolong'
AND t.slug IN ('organic', 'award-winning', 'heavy-roast')
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. 創建示範博客文章
-- ============================================
INSERT INTO blogs (
    slug, title, title_zh, content, excerpt, featured_image,
    author_id, category, tags, is_published, published_at, created_at, updated_at
)
VALUES
    (
        'intro-to-oolong-tea',
        'Introduction to Oolong Tea',
        '烏龍茶入門指南',
        '烏龍茶是一種半發酵茶，介於綠茶和紅茶之間。它起源於中國福建省，後來在台灣發揚光大...',
        '了解烏龍茶的基本知識、製作工藝和品飲方法',
        '/images/blogs/oolong-intro.jpg',
        '00000000-0000-0000-0000-000000000001'::uuid,
        '茶知識',
        ARRAY['烏龍茶', '茶知識', '入門'],
        true,
        NOW(),
        NOW(),
        NOW()
    ),
    (
        'taitung-tea-culture',
        'Taitung Tea Culture',
        '台東茶文化探索',
        '台東鹿野高台是台灣重要的茶葉產區，這裡的茶葉因為得天獨厚的自然環境而品質優良...',
        '探索台東鹿野的茶文化和特色茶品',
        '/images/blogs/taitung-tea.jpg',
        '00000000-0000-0000-0000-000000000001'::uuid,
        '茶產地',
        ARRAY['台東', '鹿野', '茶產地'],
        true,
        NOW(),
        NOW(),
        NOW()
    )
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 9. 創建示範評論
-- ============================================
INSERT INTO reviews (
    product_id, user_id, rating, title, comment,
    is_verified_purchase, is_approved, created_at, updated_at
)
SELECT
    p.id,
    '00000000-0000-0000-0000-000000000002'::uuid,
    5,
    '非常好喝的茶',
    '茶香濃郁，回甘持久，非常推薦！',
    true,
    true,
    NOW(),
    NOW()
FROM products p
WHERE p.slug = 'red-oolong'
ON CONFLICT DO NOTHING;

-- ============================================
-- 完成提示
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '===================================';
    RAISE NOTICE '永安茶園測試數據已成功載入！';
    RAISE NOTICE '===================================';
    RAISE NOTICE '已創建:';
    RAISE NOTICE '- 2 位用戶（包含 1 位管理員）';
    RAISE NOTICE '- 6 個茶品類別';
    RAISE NOTICE '- 8 個標籤';
    RAISE NOTICE '- 5 個產品';
    RAISE NOTICE '- 2 篇博客文章';
    RAISE NOTICE '- 1 則產品評論';
    RAISE NOTICE '===================================';
END $$;
