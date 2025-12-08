-- 永安茶園初始數據庫架構
-- 創建日期: 2025-12-08

-- 啟用必要的擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 創建枚舉類型（如果不存在則創建）
DO $$ BEGIN
    CREATE TYPE product_category AS ENUM ('tea', 'accessory', 'gift');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- 1. 茶品類別表 (categories)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    name_zh TEXT,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 創建索引
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_categories_display_order ON categories(display_order);

-- 添加註釋
COMMENT ON TABLE categories IS '茶品類別表';
COMMENT ON COLUMN categories.name IS '類別名稱（英文）';
COMMENT ON COLUMN categories.name_zh IS '類別名稱（中文）';
COMMENT ON COLUMN categories.slug IS 'URL友好標識符';

-- ============================================
-- 2. 產品表 (products)
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    name_zh TEXT,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    price NUMERIC(10, 2) NOT NULL,
    sale_price NUMERIC(10, 2),
    sku TEXT NOT NULL,
    stock INTEGER DEFAULT 0,
    weight REAL,
    dimensions JSONB,
    images TEXT[],
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    category product_category,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 創建索引
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_price ON products(price);

-- 添加註釋
COMMENT ON TABLE products IS '產品表';
COMMENT ON COLUMN products.name IS '產品名稱（英文）';
COMMENT ON COLUMN products.name_zh IS '產品名稱（中文）';
COMMENT ON COLUMN products.sku IS '庫存單位編號';

-- ============================================
-- 3. 產品屬性表 (product_attributes)
-- ============================================
CREATE TABLE IF NOT EXISTS product_attributes (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_zh TEXT,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 創建索引
CREATE INDEX idx_product_attributes_product_id ON product_attributes(product_id);

-- 添加註釋
COMMENT ON TABLE product_attributes IS '產品屬性表（如產地、發酵程度等）';

-- ============================================
-- 4. 用戶表 (users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    name_zh TEXT,
    avatar_url TEXT,
    is_admin BOOLEAN DEFAULT false,
    phone VARCHAR(20),
    address JSONB,
    password_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 創建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_admin ON users(is_admin);

-- 添加註釋
COMMENT ON TABLE users IS '用戶表';
COMMENT ON COLUMN users.email IS '電子郵件';
COMMENT ON COLUMN users.is_admin IS '是否為管理員';

-- ============================================
-- 5. 訂單表 (orders)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_number TEXT NOT NULL UNIQUE,
    status order_status DEFAULT 'pending',
    total NUMERIC(10, 2) NOT NULL,
    shipping_address JSONB NOT NULL,
    billing_address JSONB,
    shipping_method TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    notes TEXT,
    notes_zh TEXT,
    order_date DATE DEFAULT CURRENT_DATE NOT NULL,
    order_time TIME DEFAULT CURRENT_TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 創建索引
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_date ON orders(order_date DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- 添加註釋
COMMENT ON TABLE orders IS '訂單表';
COMMENT ON COLUMN orders.order_number IS '訂單編號';
COMMENT ON COLUMN orders.status IS '訂單狀態';

-- ============================================
-- 6. 訂單項目表 (order_items)
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT positive_quantity CHECK (quantity > 0)
);

-- 創建索引
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- 添加註釋
COMMENT ON TABLE order_items IS '訂單項目表';

-- ============================================
-- 7. 標籤表 (tags)
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    name_zh TEXT,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 創建索引
CREATE INDEX idx_tags_slug ON tags(slug);

-- 添加註釋
COMMENT ON TABLE tags IS '標籤表';

-- ============================================
-- 8. 產品標籤關聯表 (products_tags)
-- ============================================
CREATE TABLE IF NOT EXISTS products_tags (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(product_id, tag_id)
);

-- 創建索引
CREATE INDEX idx_products_tags_product_id ON products_tags(product_id);
CREATE INDEX idx_products_tags_tag_id ON products_tags(tag_id);

-- 添加註釋
COMMENT ON TABLE products_tags IS '產品標籤關聯表（多對多）';

-- ============================================
-- 9. 購物車表 (carts)
-- ============================================
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 創建索引
CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_carts_session_id ON carts(session_id);

-- 添加註釋
COMMENT ON TABLE carts IS '購物車表';
COMMENT ON COLUMN carts.session_id IS '會話ID（用於未登錄用戶）';

-- ============================================
-- 10. 購物車項目表 (cart_items)
-- ============================================
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT positive_cart_quantity CHECK (quantity > 0)
);

-- 創建索引
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- 添加註釋
COMMENT ON TABLE cart_items IS '購物車項目表';

-- ============================================
-- 創建更新時間觸發器函數
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 為所有表添加更新時間觸發器
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_attributes_updated_at BEFORE UPDATE ON product_attributes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
