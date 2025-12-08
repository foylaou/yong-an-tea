-- Row Level Security (RLS) 策略
-- 為各表啟用安全策略

-- ============================================
-- 1. Users 表 RLS
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 用戶可以查看所有用戶的基本信息（但不包括敏感信息）
CREATE POLICY "Users can view basic user info"
    ON users FOR SELECT
    USING (true);

-- 用戶只能更新自己的資料
CREATE POLICY "Users can update own data"
    ON users FOR UPDATE
    USING (auth.uid() = id);

-- 用戶可以插入自己的資料
CREATE POLICY "Users can insert own data"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 管理員可以查看所有用戶資料
CREATE POLICY "Admins can view all users"
    ON users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ============================================
-- 2. Categories 表 RLS
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看啟用的分類
CREATE POLICY "Anyone can view active categories"
    ON categories FOR SELECT
    USING (is_active = true OR auth.uid() IN (SELECT id FROM users WHERE is_admin = true));

-- 只有管理員可以插入分類
CREATE POLICY "Only admins can insert categories"
    ON categories FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 只有管理員可以更新分類
CREATE POLICY "Only admins can update categories"
    ON categories FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 只有管理員可以刪除分類
CREATE POLICY "Only admins can delete categories"
    ON categories FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ============================================
-- 3. Products 表 RLS
-- ============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看啟用的產品
CREATE POLICY "Anyone can view active products"
    ON products FOR SELECT
    USING (is_active = true OR auth.uid() IN (SELECT id FROM users WHERE is_admin = true));

-- 只有管理員可以插入產品
CREATE POLICY "Only admins can insert products"
    ON products FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 只有管理員可以更新產品
CREATE POLICY "Only admins can update products"
    ON products FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 只有管理員可以刪除產品
CREATE POLICY "Only admins can delete products"
    ON products FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ============================================
-- 4. Product Attributes 表 RLS
-- ============================================
ALTER TABLE product_attributes ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看產品屬性
CREATE POLICY "Anyone can view product attributes"
    ON product_attributes FOR SELECT
    USING (true);

-- 只有管理員可以管理產品屬性
CREATE POLICY "Only admins can manage product attributes"
    ON product_attributes FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ============================================
-- 5. Orders 表 RLS
-- ============================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 用戶只能查看自己的訂單
CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);

-- 管理員可以查看所有訂單
CREATE POLICY "Admins can view all orders"
    ON orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 用戶可以創建自己的訂單
CREATE POLICY "Users can create own orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 用戶可以更新自己的訂單（僅限特定狀態）
CREATE POLICY "Users can update own pending orders"
    ON orders FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending');

-- 管理員可以更新所有訂單
CREATE POLICY "Admins can update all orders"
    ON orders FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ============================================
-- 6. Order Items 表 RLS
-- ============================================
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 用戶可以查看自己訂單的項目
CREATE POLICY "Users can view own order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- 管理員可以查看所有訂單項目
CREATE POLICY "Admins can view all order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 用戶可以創建自己訂單的項目
CREATE POLICY "Users can create own order items"
    ON order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND orders.user_id = auth.uid()
        )
    );

-- ============================================
-- 7. Tags 表 RLS
-- ============================================
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看標籤
CREATE POLICY "Anyone can view tags"
    ON tags FOR SELECT
    USING (true);

-- 只有管理員可以管理標籤
CREATE POLICY "Only admins can manage tags"
    ON tags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ============================================
-- 8. Products Tags 表 RLS
-- ============================================
ALTER TABLE products_tags ENABLE ROW LEVEL SECURITY;

-- 所有人可以查看產品標籤關聯
CREATE POLICY "Anyone can view products tags"
    ON products_tags FOR SELECT
    USING (true);

-- 只有管理員可以管理產品標籤關聯
CREATE POLICY "Only admins can manage products tags"
    ON products_tags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- ============================================
-- 9. Carts 表 RLS
-- ============================================
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- 用戶只能查看自己的購物車
CREATE POLICY "Users can view own cart"
    ON carts FOR SELECT
    USING (auth.uid() = user_id OR session_id = current_setting('request.headers')::json->>'x-session-id');

-- 用戶可以創建自己的購物車
CREATE POLICY "Users can create own cart"
    ON carts FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 用戶可以更新自己的購物車
CREATE POLICY "Users can update own cart"
    ON carts FOR UPDATE
    USING (auth.uid() = user_id OR session_id = current_setting('request.headers')::json->>'x-session-id');

-- 用戶可以刪除自己的購物車
CREATE POLICY "Users can delete own cart"
    ON carts FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- 10. Cart Items 表 RLS
-- ============================================
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- 用戶可以查看自己購物車的項目
CREATE POLICY "Users can view own cart items"
    ON cart_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM carts
            WHERE carts.id = cart_items.cart_id
            AND carts.user_id = auth.uid()
        )
    );

-- 用戶可以添加項目到自己的購物車
CREATE POLICY "Users can insert own cart items"
    ON cart_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM carts
            WHERE carts.id = cart_items.cart_id
            AND carts.user_id = auth.uid()
        )
    );

-- 用戶可以更新自己購物車的項目
CREATE POLICY "Users can update own cart items"
    ON cart_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM carts
            WHERE carts.id = cart_items.cart_id
            AND carts.user_id = auth.uid()
        )
    );

-- 用戶可以刪除自己購物車的項目
CREATE POLICY "Users can delete own cart items"
    ON cart_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM carts
            WHERE carts.id = cart_items.cart_id
            AND carts.user_id = auth.uid()
        )
    );
