// schema.ts
import { pgTable, serial, text, integer, timestamp, boolean, jsonb, real, date, time, uuid, varchar, numeric, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 定義列舉類型 (用於限制特定欄位的可選值)
export const productCategoryEnum = pgEnum('product_category', ['tea', 'accessory', 'gift']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'shipped', 'delivered', 'cancelled']);

// 茶品類別表 (Categories)
// 包含茶品的不同類別
export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),                // 自動增加的主鍵ID
    name: text('name').notNull(),                 // 類別名稱，不可為空
    slug: text('slug').notNull().unique(),        // URL友好的唯一標識符
    description: text('description'),             // 類別描述 (可選)
    image: text('image'),                         // 類別圖片URL (可選)
    isActive: boolean('is_active').default(true), // 是否啟用，預設為true
    displayOrder: integer('display_order').default(0), // 顯示順序
    createdAt: timestamp('created_at').defaultNow().notNull(), // 創建時間，預設為當前時間
    updatedAt: timestamp('updated_at').defaultNow().notNull(), // 更新時間
    nameZh: text('name_zh'), // 類別中文名稱
});

// 定義茶品類別的關係
export const categoriesRelations = relations(categories, ({ many }) => ({
    products: many(products), // 一個類別可以有多個產品 (一對多)
}));

// 產品表 (Products)
// 存儲所有茶品及相關商品
export const products = pgTable('products', {
    id: serial('id').primaryKey(),                // 主鍵ID
    name: text('name').notNull(),                 // 產品名稱
    slug: text('slug').notNull().unique(),        // URL友好的唯一標識符
    description: text('description'),             // 產品描述
    categoryId: integer('category_id').references(() => categories.id), // 外鍵，關聯到categories表
    price: numeric('price', { precision: 10, scale: 2 }).notNull(), // 價格，帶精度的數值類型
    salePrice: numeric('sale_price', { precision: 10, scale: 2 }), // 促銷價格 (可選)
    sku: text('sku').notNull(),                   // 庫存單位，產品編號
    stock: integer('stock').default(0),           // 庫存數量
    weight: real('weight'),                       // 重量 (克)
    dimensions: jsonb('dimensions'),              // 尺寸 (JSON格式，如 {length, width, height})
    images: text('images').array(),               // 產品圖片URL數組
    isActive: boolean('is_active').default(true), // 是否啟用
    isFeatured: boolean('is_featured').default(false), // 是否為特色產品
    category: productCategoryEnum('category'),    // 使用列舉類型定義產品大類
    metadata: jsonb('metadata'),                  // 額外元數據 (JSON格式)
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    nameZh: text('name_zh'), // 產品中文名稱
});

// 定義產品的關係
export const productsRelations = relations(products, ({ one, many }) => ({
    category: one(categories, {
        fields: [products.categoryId],  // 產品表中的外鍵
        references: [categories.id],    // 類別表中的主鍵
    }), // 多對一：多個產品屬於一個類別
    orderItems: many(orderItems),     // 一對多：一個產品可以出現在多個訂單項目中
    productAttributes: many(productAttributes), // 一對多：一個產品可以有多個屬性
}));

// 產品屬性表 (Product Attributes)
// 用於存儲產品的附加屬性，如茶品的產地、發酵程度等
export const productAttributes = pgTable('product_attributes', {
    id: serial('id').primaryKey(),
    productId: integer('product_id').references(() => products.id).notNull(), // 關聯到產品
    name: text('name').notNull(),     // 屬性名稱
    value: text('value').notNull(),   // 屬性值
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    nameZh: text('name_zh'), // 屬性中文名稱
});

// 定義產品屬性的關係
export const productAttributesRelations = relations(productAttributes, ({ one }) => ({
    product: one(products, {
        fields: [productAttributes.productId],
        references: [products.id],
    }), // 多對一：多個屬性屬於一個產品
}));

// 用戶表 (Users)
// 存儲註冊用戶信息
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(), // UUID作為主鍵
    email: text('email').notNull().unique(),     // 電子郵件，唯一
    name: text('name'),                         // 用戶名稱
    avatarUrl: text('avatar_url'),              // 頭像URL
    isAdmin: boolean('is_admin').default(false), // 是否為管理員
    phone: varchar('phone', { length: 20 }),    // 電話號碼，限制長度
    address: jsonb('address'),                   // 地址信息 (JSON格式)
    passwordHash: text('password_hash'),         // 密碼雜湊，用於本地認證
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    nameZh: text('name_zh'), // 用戶中文名稱
});

// 定義用戶的關係
export const usersRelations = relations(users, ({ many }) => ({
    orders: many(orders),  // 一對多：一個用戶可以有多個訂單
}));

// 訂單表 (Orders)
// 存儲用戶的訂單信息
export const orders = pgTable('orders', {
    id: serial('id').primaryKey(),
    userId: uuid('user_id').references(() => users.id).notNull(), // 關聯到用戶
    orderNumber: text('order_number').notNull().unique(), // 訂單編號
    status: orderStatusEnum('status').default('pending'), // 訂單狀態，使用列舉
    total: numeric('total', { precision: 10, scale: 2 }).notNull(), // 訂單總金額
    shippingAddress: jsonb('shipping_address').notNull(), // 送貨地址
    billingAddress: jsonb('billing_address'), // 帳單地址
    shippingMethod: text('shipping_method').notNull(), // 送貨方式
    paymentMethod: text('payment_method').notNull(), // 支付方式
    paymentStatus: text('payment_status').default('pending'), // 支付狀態
    notes: text('notes'), // 訂單備註
    orderDate: date('order_date').defaultNow().notNull(), // 訂單日期
    orderTime: time('order_time').defaultNow().notNull(), // 訂單時間
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    notesZh: text('notes_zh'), // 訂單中文備註
});

// 定義訂單的關係
export const ordersRelations = relations(orders, ({ one, many }) => ({
    user: one(users, {
        fields: [orders.userId],
        references: [users.id],
    }), // 多對一：多個訂單屬於一個用戶
    orderItems: many(orderItems), // 一對多：一個訂單包含多個訂單項目
}));

// 訂單項目表 (Order Items)
// 存儲訂單中的每個產品項目
export const orderItems = pgTable('order_items', {
    id: serial('id').primaryKey(),
    orderId: integer('order_id').references(() => orders.id).notNull(), // 關聯到訂單
    productId: integer('product_id').references(() => products.id).notNull(), // 關聯到產品
    quantity: integer('quantity').notNull().default(1), // 數量
    unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(), // 單價
    totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(), // 總價
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 定義訂單項目的關係
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id],
    }), // 多對一：多個訂單項目屬於一個訂單
    product: one(products, {
        fields: [orderItems.productId],
        references: [products.id],
    }), // 多對一：訂單項目關聯到一個產品
}));

// 標籤表 (Tags)
// 用於產品分類和搜索
export const tags = pgTable('tags', {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(), // 標籤名稱
    slug: text('slug').notNull().unique(), // URL友好標識符
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    nameZh: text('name_zh'), // 標籤中文名稱
});

// 產品與標籤的多對多關係中間表
// 實現多對多關係：一個產品可以有多個標籤，一個標籤可以關聯多個產品
export const productsTags = pgTable('products_tags', {
    id: serial('id').primaryKey(),
    productId: integer('product_id').references(() => products.id).notNull(),
    tagId: integer('tag_id').references(() => tags.id).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 定義產品與標籤的多對多關係
export const productsTagsRelations = relations(productsTags, ({ one }) => ({
    product: one(products, {
        fields: [productsTags.productId],
        references: [products.id],
    }),
    tag: one(tags, {
        fields: [productsTags.tagId],
        references: [tags.id],
    }),
}));

// 擴展產品關係，加入標籤多對多
export const productsTagsExtendedRelations = relations(products, ({ many }) => ({
    productTags: many(productsTags),  // 通過中間表關聯到標籤
}));

// 擴展標籤關係，加入產品多對多
export const tagsProductsRelations = relations(tags, ({ many }) => ({
    productTags: many(productsTags),  // 通過中間表關聯到產品
}));

// 購物車表 (Carts)
// 存儲用戶的購物車信息
export const carts = pgTable('carts', {
    id: uuid('id').primaryKey().defaultRandom(), // 購物車ID
    userId: uuid('user_id').references(() => users.id), // 關聯到用戶 (可能為null，處理未登錄用戶)
    sessionId: text('session_id'), // 會話ID，用於未登錄用戶
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 購物車項目表 (Cart Items)
// 存儲購物車中的產品項目
export const cartItems = pgTable('cart_items', {
    id: serial('id').primaryKey(),
    cartId: uuid('cart_id').references(() => carts.id).notNull(), // 關聯到購物車
    productId: integer('product_id').references(() => products.id).notNull(), // 關聯到產品
    quantity: integer('quantity').notNull().default(1), // 數量
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 定義購物車和購物車項目的關係
export const cartsRelations = relations(carts, ({ one, many }) => ({
    user: one(users, {
        fields: [carts.userId],
        references: [users.id],
    }), // 多對一：多個購物車屬於一個用戶 (處理多設備登錄)
    cartItems: many(cartItems), // 一對多：一個購物車包含多個購物車項目
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
    cart: one(carts, {
        fields: [cartItems.cartId],
        references: [carts.id],
    }), // 多對一：多個購物車項目屬於一個購物車
    product: one(products, {
        fields: [cartItems.productId],
        references: [products.id],
    }), // 多對一：購物車項目關聯到一個產品
}));