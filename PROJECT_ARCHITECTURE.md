# Helendo 電商平台 — 專案架構規劃書

> 版本：v1.0
> 日期：2026-02-16
> 目標：將現有靜態電商模板升級為具備後台管理功能的完整電商平台

---

## 一、現況分析

### 1.1 目前技術棧

| 項目 | 技術 |
|------|------|
| 框架 | Next.js 16.1.6 (React 19) |
| 樣式 | Tailwind CSS v4 |
| 狀態管理 | Redux Toolkit + Redux Persist |
| 動畫 | Framer Motion |
| 資料來源 | Markdown 靜態檔案 (gray-matter) |
| 部署 | 靜態匯出 (next export) |

### 1.2 現有功能

- 商品展示（多種佈局：3/4/5/6 欄、側欄、輪播）
- 購物車 / 願望清單（純前端 localStorage）
- 部落格系統（Markdown + Disqus 留言）
- 多種首頁版型
- 商品篩選（分類、價格、標籤）
- 結帳頁面（無實際串接）

### 1.3 主要限制

- 所有資料為靜態 Markdown，無法動態管理
- 無使用者驗證系統
- 無訂單管理流程
- 無後台管理介面
- 無 SEO 動態管理能力

---

## 二、升級目標

將 Helendo 從靜態模板升級為 **可透過後台操作的完整電商平台**，具備：

1. **Supabase 後端**：資料庫、認證、檔案儲存
2. **後台管理系統** (`/admin`)：完整 CRUD 操作
3. **SEO 管理**：每頁可自訂 meta 資訊
4. **訂單管理**：從下單到出貨的完整流程
5. **會員系統**：註冊、登入、訂單查詢

---

## 三、技術架構

### 3.1 整體架構圖

```
┌─────────────────────────────────────────────────────────┐
│                      前台 (Front Store)                  │
│              Next.js SSR/SSG + Tailwind CSS              │
│         首頁 / 商品 / 購物車 / 結帳 / 會員中心            │
├─────────────────────────────────────────────────────────┤
│                     後台 (Admin Panel)                   │
│                    /admin/* 路由群組                      │
│       商品管理 / 訂單管理 / 會員管理 / SEO 管理           │
├─────────────────────────────────────────────────────────┤
│                    Supabase Backend                      │
│  ┌───────────┬──────────┬───────────┬─────────────────┐ │
│  │ PostgreSQL │   Auth   │  Storage  │ Row Level       │ │
│  │ Database   │  驗證服務 │ 檔案儲存  │ Security (RLS)  │ │
│  └───────────┴──────────┴───────────┴─────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 3.2 新增技術選型

| 項目 | 技術 | 說明 |
|------|------|------|
| 後端服務 | Supabase | PostgreSQL + Auth + Storage + Realtime |
| ORM/查詢 | @supabase/supabase-js | Supabase JavaScript Client |
| 認證 | Supabase Auth | Email/Password + OAuth (Google, Facebook) |
| 檔案儲存 | Supabase Storage | 商品圖片、部落格圖片 |
| 後台 UI | Tailwind CSS + Headless UI | 與前台一致的設計語言 |
| 表單管理 | React Hook Form + Zod | 後台表單驗證 |
| 富文本編輯 | TipTap 或 React Quill | 商品描述 / 部落格編輯器 |
| 圖表 | Recharts | 後台數據儀表板 |
| 表格 | TanStack Table | 後台資料列表 |

---

## 四、資料庫設計 (Supabase PostgreSQL)

### 4.1 ER 關聯圖

```
users (Supabase Auth)
  │
  ├──< profiles (1:1)
  ├──< orders (1:N)
  │       └──< order_items (1:N) >── products
  ├──< cart_items (1:N) >── products
  ├──< wishlist_items (1:N) >── products
  └──< addresses (1:N)

products
  ├──< product_images (1:N)
  ├──< product_variants (1:N)
  └──>< categories (M:N via product_categories)

categories
  └── parent_id (自關聯，支援多層分類)

blogs
  ├──< blog_tags (M:N via blog_tag_map)
  └──> blog_categories

seo_metadata
  └── 關聯各頁面 (page_type + page_id)

site_settings
  └── 全站設定 (key-value)
```

### 4.2 資料表結構

#### `profiles` — 使用者資料

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | uuid (PK, FK → auth.users) | 使用者 ID |
| full_name | text | 姓名 |
| phone | text | 電話 |
| avatar_url | text | 大頭貼 URL |
| role | enum('customer', 'admin') | 角色 |
| created_at | timestamptz | 建立時間 |
| updated_at | timestamptz | 更新時間 |

#### `categories` — 商品分類

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | uuid (PK) | 分類 ID |
| name | text | 分類名稱 |
| slug | text (unique) | URL 用 slug |
| description | text | 分類描述 |
| image_url | text | 分類圖片 |
| parent_id | uuid (FK → categories) | 父分類 (支援多層) |
| sort_order | integer | 排序順序 |
| is_active | boolean | 是否啟用 |
| created_at | timestamptz | 建立時間 |

#### `products` — 商品

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | uuid (PK) | 商品 ID |
| title | text | 商品名稱 |
| slug | text (unique) | URL 用 slug |
| description | text | 商品描述 (HTML) |
| short_description | text | 簡短描述 |
| price | numeric(10,2) | 原價 |
| discount_price | numeric(10,2) | 折扣價 |
| sku | text (unique) | 商品編號 |
| stock_quantity | integer | 庫存數量 |
| availability | enum('in_stock', 'out_of_stock', 'preorder') | 庫存狀態 |
| is_featured | boolean | 是否為精選商品 |
| is_active | boolean | 是否上架 |
| tags | text[] | 標籤陣列 |
| created_at | timestamptz | 建立時間 |
| updated_at | timestamptz | 更新時間 |

#### `product_images` — 商品圖片

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | uuid (PK) | 圖片 ID |
| product_id | uuid (FK → products) | 商品 ID |
| url | text | 圖片 URL (Supabase Storage) |
| alt_text | text | 圖片替代文字 |
| sort_order | integer | 排序 |
| is_primary | boolean | 是否為主圖 |

#### `product_variants` — 商品規格

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | uuid (PK) | 規格 ID |
| product_id | uuid (FK → products) | 商品 ID |
| name | text | 規格名稱（如：顏色/尺寸） |
| value | text | 規格值 |
| price_adjustment | numeric(10,2) | 價格調整 |
| stock_quantity | integer | 該規格庫存 |
| sku_suffix | text | SKU 後綴 |

#### `product_categories` — 商品分類關聯 (M:N)

| 欄位 | 類型 | 說明 |
|------|------|------|
| product_id | uuid (FK → products) | 商品 ID |
| category_id | uuid (FK → categories) | 分類 ID |

#### `orders` — 訂單

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | uuid (PK) | 訂單 ID |
| order_number | text (unique) | 訂單編號（如 HD-20260216-001） |
| user_id | uuid (FK → auth.users) | 使用者 ID |
| status | enum('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') | 訂單狀態 |
| subtotal | numeric(10,2) | 小計 |
| shipping_fee | numeric(10,2) | 運費 |
| discount_amount | numeric(10,2) | 折扣金額 |
| total_amount | numeric(10,2) | 總金額 |
| shipping_address | jsonb | 寄送地址 |
| billing_address | jsonb | 帳單地址 |
| payment_method | text | 付款方式 |
| payment_status | enum('unpaid', 'paid', 'refunded') | 付款狀態 |
| notes | text | 訂單備註 |
| created_at | timestamptz | 建立時間 |
| updated_at | timestamptz | 更新時間 |

#### `order_items` — 訂單明細

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | uuid (PK) | 明細 ID |
| order_id | uuid (FK → orders) | 訂單 ID |
| product_id | uuid (FK → products) | 商品 ID |
| variant_id | uuid (FK → product_variants) | 規格 ID (nullable) |
| quantity | integer | 數量 |
| unit_price | numeric(10,2) | 單價（下單時快照） |
| total_price | numeric(10,2) | 小計 |

#### `blogs` — 部落格文章

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | uuid (PK) | 文章 ID |
| title | text | 標題 |
| slug | text (unique) | URL slug |
| content | text | 內容 (HTML) |
| excerpt | text | 摘要 |
| cover_image | text | 封面圖 |
| author_id | uuid (FK → auth.users) | 作者 |
| category_id | uuid (FK → blog_categories) | 分類 |
| status | enum('draft', 'published', 'archived') | 狀態 |
| published_at | timestamptz | 發布時間 |
| is_featured | boolean | 是否精選 |
| created_at | timestamptz | 建立時間 |
| updated_at | timestamptz | 更新時間 |

#### `blog_categories` — 部落格分類

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | uuid (PK) | 分類 ID |
| name | text | 分類名稱 |
| slug | text (unique) | URL slug |

#### `blog_tags` / `blog_tag_map` — 部落格標籤

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | uuid (PK) | 標籤 ID |
| name | text | 標籤名稱 |
| slug | text (unique) | URL slug |

#### `seo_metadata` — SEO 管理

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | uuid (PK) | SEO ID |
| page_type | enum('home', 'product', 'category', 'blog', 'page') | 頁面類型 |
| page_id | uuid | 關聯頁面 ID (nullable，home 無需) |
| meta_title | text | Meta 標題 |
| meta_description | text | Meta 描述 |
| meta_keywords | text | Meta 關鍵字 |
| og_title | text | Open Graph 標題 |
| og_description | text | Open Graph 描述 |
| og_image | text | Open Graph 圖片 |
| canonical_url | text | Canonical URL |
| structured_data | jsonb | JSON-LD 結構化資料 |
| no_index | boolean | 是否禁止索引 |
| created_at | timestamptz | 建立時間 |
| updated_at | timestamptz | 更新時間 |

#### `site_settings` — 全站設定

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | uuid (PK) | 設定 ID |
| key | text (unique) | 設定鍵 |
| value | jsonb | 設定值 |
| group | text | 群組（general, seo, shipping, payment 等） |
| updated_at | timestamptz | 更新時間 |

#### `banners` — 橫幅/輪播管理

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | uuid (PK) | 橫幅 ID |
| title | text | 標題 |
| subtitle | text | 副標題 |
| image_url | text | 圖片 URL |
| link_url | text | 連結 URL |
| position | text | 顯示位置 (hero, sidebar 等) |
| sort_order | integer | 排序 |
| is_active | boolean | 是否啟用 |
| start_date | timestamptz | 開始日期 |
| end_date | timestamptz | 結束日期 |

---

## 五、路由結構

### 5.1 前台路由（保留現有 + 擴充）

```
/                           # 首頁
/products/[slug]            # 商品詳情
/products/categories        # 商品分類頁
/products/category/[slug]   # 分類篩選頁
/products/search            # 搜尋結果頁
/cart                       # 購物車
/checkout                   # 結帳
/blogs/[slug]               # 部落格文章
/blogs                      # 部落格列表
/auth/login                 # 登入
/auth/register              # 註冊
/auth/forgot-password       # 忘記密碼
/account                    # 會員中心
/account/orders             # 我的訂單
/account/orders/[id]        # 訂單詳情
/account/wishlist           # 願望清單
/account/profile            # 個人資料
/account/addresses          # 地址管理
/about                      # 關於我們
/contact                    # 聯繫我們
/faq                        # 常見問題
```

### 5.2 後台路由 (`/admin`)

```
/admin                          # 後台儀表板 (Dashboard)
/admin/login                    # 後台登入

# 商品管理
/admin/products                 # 商品列表
/admin/products/new             # 新增商品
/admin/products/[id]/edit       # 編輯商品
/admin/categories               # 分類管理
/admin/categories/new           # 新增分類
/admin/categories/[id]/edit     # 編輯分類

# 訂單管理
/admin/orders                   # 訂單列表
/admin/orders/[id]              # 訂單詳情 / 處理

# 會員管理
/admin/customers                # 會員列表
/admin/customers/[id]           # 會員詳情

# 內容管理
/admin/blogs                    # 文章列表
/admin/blogs/new                # 新增文章
/admin/blogs/[id]/edit          # 編輯文章
/admin/blog-categories          # 部落格分類管理

# SEO 管理
/admin/seo                      # SEO 總覽
/admin/seo/pages                # 各頁面 SEO 設定
/admin/seo/sitemap              # Sitemap 設定
/admin/seo/redirects            # 301 轉址管理

# 外觀管理
/admin/banners                  # 橫幅 / Hero 管理
/admin/menus                    # 選單管理

# 系統設定
/admin/settings                 # 一般設定（網站名稱、Logo 等）
/admin/settings/shipping        # 運費設定
/admin/settings/payment         # 金流設定
/admin/settings/email           # Email 模板設定
```

---

## 六、目錄結構（升級後）

```
src/
├── app/                            # Next.js App Router (升級)
│   ├── (store)/                    # 前台路由群組
│   │   ├── layout.js               # 前台共用 Layout
│   │   ├── page.js                 # 首頁
│   │   ├── products/
│   │   │   ├── [slug]/page.js
│   │   │   └── category/[slug]/page.js
│   │   ├── cart/page.js
│   │   ├── checkout/page.js
│   │   ├── blogs/
│   │   ├── auth/
│   │   ├── account/
│   │   └── ...
│   │
│   ├── admin/                      # 後台路由群組
│   │   ├── layout.js               # 後台共用 Layout (側欄 + 頂欄)
│   │   ├── page.js                 # Dashboard
│   │   ├── login/page.js           # 後台登入
│   │   ├── products/
│   │   │   ├── page.js             # 商品列表
│   │   │   ├── new/page.js         # 新增商品
│   │   │   └── [id]/edit/page.js   # 編輯商品
│   │   ├── categories/
│   │   ├── orders/
│   │   ├── customers/
│   │   ├── blogs/
│   │   ├── seo/
│   │   ├── banners/
│   │   └── settings/
│   │
│   ├── api/                        # API Routes (如需要)
│   │   ├── webhooks/               # Supabase Webhooks
│   │   └── revalidate/             # ISR 重新驗證
│   │
│   └── layout.js                   # 根 Layout
│
├── components/
│   ├── store/                      # 前台元件 (搬移現有元件)
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── Product/
│   │   ├── Cart/
│   │   ├── Blog/
│   │   └── ...
│   │
│   ├── admin/                      # 後台元件
│   │   ├── layout/
│   │   │   ├── AdminSidebar.js     # 側欄導航
│   │   │   ├── AdminHeader.js      # 頂部導航
│   │   │   └── AdminBreadcrumb.js  # 麵包屑
│   │   ├── dashboard/
│   │   │   ├── StatsCard.js        # 統計卡片
│   │   │   ├── RecentOrders.js     # 最近訂單
│   │   │   └── SalesChart.js       # 銷售圖表
│   │   ├── products/
│   │   │   ├── ProductForm.js      # 商品表單
│   │   │   ├── ProductTable.js     # 商品列表表格
│   │   │   └── ImageUploader.js    # 圖片上傳
│   │   ├── orders/
│   │   │   ├── OrderTable.js
│   │   │   ├── OrderDetail.js
│   │   │   └── OrderStatusBadge.js
│   │   ├── seo/
│   │   │   ├── SeoForm.js          # SEO 表單
│   │   │   └── SeoPreview.js       # SEO 預覽
│   │   └── common/
│   │       ├── DataTable.js        # 通用資料表格
│   │       ├── Pagination.js       # 分頁
│   │       ├── SearchBar.js        # 搜尋
│   │       ├── Modal.js            # 彈窗
│   │       ├── ConfirmDialog.js    # 確認對話框
│   │       └── RichTextEditor.js   # 富文本編輯器
│   │
│   └── shared/                     # 前後台共用元件
│       ├── LoadingSpinner.js
│       ├── ErrorBoundary.js
│       └── Toast.js
│
├── lib/
│   ├── supabase/
│   │   ├── client.js               # Supabase 瀏覽器端 Client
│   │   ├── server.js               # Supabase 伺服器端 Client
│   │   ├── admin.js                # Supabase Admin Client (Service Role)
│   │   └── middleware.js           # Auth Middleware
│   ├── api/
│   │   ├── products.js             # 商品 API 函式
│   │   ├── orders.js               # 訂單 API 函式
│   │   ├── blogs.js                # 部落格 API 函式
│   │   ├── categories.js           # 分類 API 函式
│   │   ├── seo.js                  # SEO API 函式
│   │   └── upload.js               # 檔案上傳 API 函式
│   └── utils/
│       ├── formatters.js           # 格式化工具
│       ├── validators.js           # 驗證工具
│       └── constants.js            # 常數定義
│
├── hooks/                          # 自訂 Hooks
│   ├── useAuth.js                  # 認證 Hook
│   ├── useAdmin.js                 # 管理員權限 Hook
│   ├── useProducts.js              # 商品資料 Hook
│   ├── useOrders.js                # 訂單資料 Hook
│   └── useSupabase.js              # Supabase 通用 Hook
│
├── store/                          # Redux (保留，漸進式遷移)
│   ├── cart/
│   ├── wishlist/
│   └── product-filter/
│
├── styles/
│   └── globals.css
│
└── middleware.js                    # Next.js Middleware (路由保護)
```

---

## 七、核心功能模組

### 7.1 認證與權限系統

```
認證流程:
┌──────────┐    ┌──────────────┐    ┌─────────────┐
│  前台登入  │───>│ Supabase Auth │───>│ profiles 表  │
│  /auth    │    │ Email+OAuth  │    │ role 欄位    │
└──────────┘    └──────────────┘    └─────────────┘
                                           │
                        ┌──────────────────┼──────────────────┐
                        ▼                  ▼                  ▼
                  role=customer      role=admin          middleware
                  前台功能            後台存取            路由保護
```

**權限控制策略：**
- **Next.js Middleware**：攔截 `/admin/*` 路由，驗證 JWT + role
- **Supabase RLS**：資料庫層級權限控制，確保安全
- **前端路由守衛**：未登入導向登入頁，無權限顯示 403

**RLS 政策範例：**
```sql
-- 商品：所有人可讀，只有 admin 可寫
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage products"
  ON products FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- 訂單：使用者只能看自己的，admin 可看全部
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT USING (
    auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin'
  );
```

### 7.2 商品管理 (CRUD)

**後台功能清單：**

| 功能 | 說明 |
|------|------|
| 商品列表 | 分頁、搜尋、篩選（分類/狀態/價格區間）、批次操作 |
| 新增商品 | 表單填寫 + 圖片上傳 + 分類選擇 + 規格設定 |
| 編輯商品 | 同新增，預載現有資料 |
| 刪除商品 | 軟刪除（標記 is_active = false）|
| 庫存管理 | 庫存數量調整、低庫存警示 |
| 批次匯入/匯出 | CSV 匯入匯出 |
| 圖片管理 | 拖曳排序、多圖上傳至 Supabase Storage |

**商品表單欄位：**
- 基本資訊：名稱、SKU、價格、折扣價、描述
- 分類與標籤：多選分類、自由標籤
- 圖片：主圖 + 多張附圖（支援拖曳排序）
- 規格：動態新增規格（如尺寸、顏色）
- 庫存：數量、狀態
- SEO：Meta 標題、描述、關鍵字（獨立 SEO 區塊）
- 狀態：上架/下架、精選

### 7.3 訂單管理

**訂單狀態流程：**

```
pending ──> confirmed ──> processing ──> shipped ──> delivered
   │                                        │
   └──> cancelled                           └──> refunded
```

**後台功能：**
- 訂單列表（篩選狀態、日期區間、搜尋訂單編號）
- 訂單詳情（商品明細、客戶資訊、配送資訊）
- 狀態更新（含通知客戶）
- 訂單備註
- 匯出訂單報表

### 7.4 SEO 管理

**核心功能：**

| 功能 | 說明 |
|------|------|
| 全站 SEO 預設 | 預設 meta title 模板、描述等 |
| 頁面級 SEO | 每個頁面可自訂 meta 資訊 |
| 商品 SEO | 每個商品的 meta title、description、OG 圖片 |
| 部落格 SEO | 每篇文章的 SEO 設定 |
| Sitemap 管理 | 自動生成 sitemap.xml，可排除特定頁面 |
| 301 轉址 | 管理舊 URL 到新 URL 的轉址 |
| 結構化資料 | JSON-LD (Product、Article、BreadcrumbList) |
| OG / Twitter Card | 社群分享預覽設定 |
| SEO 預覽 | 即時預覽 Google 搜尋結果外觀 |

**SEO 渲染方式：**
```jsx
// 使用 Next.js Metadata API
export async function generateMetadata({ params }) {
  const seo = await getSeoMetadata('product', params.slug);
  return {
    title: seo.meta_title,
    description: seo.meta_description,
    openGraph: {
      title: seo.og_title,
      description: seo.og_description,
      images: [seo.og_image],
    },
  };
}
```

### 7.5 內容管理（部落格）

- 富文本編輯器（支援圖片插入、程式碼區塊）
- 文章分類與標籤管理
- 草稿/發布/封存狀態
- 排程發布
- 精選文章設定

### 7.6 外觀管理

- **橫幅管理**：首頁 Hero 輪播、促銷橫幅
- **選單管理**：Header / Footer 導航選單
- **全站設定**：Logo、品牌色、聯繫資訊

---

## 八、Supabase 設定

### 8.1 Storage Buckets

```
supabase-storage/
├── products/          # 商品圖片
│   └── {product_id}/  # 按商品分資料夾
├── blogs/             # 部落格圖片
├── banners/           # 橫幅圖片
├── avatars/           # 使用者大頭貼
└── site/              # 網站素材（Logo 等）
```

### 8.2 Database Functions

```sql
-- 訂單編號自動生成
CREATE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'HD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
    LPAD(nextval('order_number_seq')::text, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 庫存自動扣減
CREATE FUNCTION decrease_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### 8.3 Realtime 訂閱（選配）

```javascript
// 後台即時訂單通知
supabase
  .channel('new-orders')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'orders'
  }, (payload) => {
    showNotification('新訂單！', payload.new.order_number);
  })
  .subscribe();
```

---

## 九、安全策略

### 9.1 認證安全

- Supabase Auth 內建 JWT + Refresh Token
- HTTP-only Cookies 存放 Session
- CSRF 防護
- Rate Limiting（登入嘗試次數限制）

### 9.2 資料安全

- **RLS (Row Level Security)**：所有資料表啟用 RLS
- **Input Validation**：前後端雙重驗證 (Zod Schema)
- **SQL Injection 防護**：Supabase Client 自動參數化查詢
- **XSS 防護**：富文本內容消毒 (DOMPurify)
- **檔案上傳限制**：限制檔案類型與大小

### 9.3 環境變數

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # 僅伺服器端
NEXT_PUBLIC_SITE_URL=https://helendo.com
```

---

## 十、開發階段規劃

### Phase 1：基礎建設（第 1-2 週）

- [ ] Supabase 專案建立與資料庫 Schema 建置
- [ ] Next.js 從 Pages Router 遷移至 App Router
- [ ] Supabase Client 整合 (client / server / middleware)
- [ ] 認證系統實作 (登入/註冊/忘記密碼)
- [ ] Middleware 路由保護 (/admin 權限檢查)
- [ ] 將現有 Markdown 商品資料遷移至 Supabase

### Phase 2：後台核心功能（第 3-5 週）

- [ ] 後台 Layout (側欄 + 頂欄 + 麵包屑)
- [ ] Dashboard 儀表板
- [ ] 商品 CRUD（含圖片上傳）
- [ ] 分類管理 CRUD
- [ ] 部落格 CRUD（含富文本編輯器）

### Phase 3：電商功能（第 6-7 週）

- [ ] 前台商品列表改為 Supabase 資料來源
- [ ] 購物車改為 Supabase 儲存（登入後同步）
- [ ] 結帳流程實作
- [ ] 訂單建立與管理
- [ ] 會員中心（個人資料、訂單查詢、地址管理）

### Phase 4：SEO 與進階功能（第 8-9 週）

- [ ] SEO 管理介面
- [ ] 動態 Metadata 生成
- [ ] Sitemap 自動生成
- [ ] 結構化資料 (JSON-LD)
- [ ] 橫幅 / 選單管理
- [ ] 全站設定

### Phase 5：優化與上線（第 10 週）

- [ ] 效能優化（ISR、圖片最佳化、快取策略）
- [ ] SEO 審查與修正
- [ ] 安全審查
- [ ] 部署設定 (Vercel + Supabase)
- [ ] 資料備份策略
- [ ] 監控與錯誤追蹤 (Sentry)

---

## 十一、部署架構

```
┌───────────────┐     ┌──────────────────┐
│   Vercel       │────>│  Supabase Cloud   │
│  (Next.js)     │     │  ┌──────────────┐ │
│                │     │  │ PostgreSQL   │ │
│  - SSR/SSG     │     │  │ Auth         │ │
│  - Edge Func   │     │  │ Storage      │ │
│  - CDN         │     │  │ Realtime     │ │
│                │     │  └──────────────┘ │
└───────────────┘     └──────────────────┘
        │
        ▼
┌───────────────┐
│  Cloudflare    │
│  (可選 CDN)    │
│  - 圖片快取    │
│  - DDoS 防護   │
└───────────────┘
```

---

## 十二、注意事項與建議

1. **漸進式遷移**：不需一次全部重寫，可分階段將 Markdown 資料來源替換為 Supabase
2. **保留現有設計**：前台 UI/UX 維持現有風格，後台採用一致的 Tailwind 設計
3. **Pages → App Router**：建議趁此機會遷移至 App Router，獲得更好的 Layout、Loading、Error 支援
4. **圖片最佳化**：使用 Next.js Image + Supabase Storage Transform 自動調整圖片尺寸
5. **快取策略**：商品列表使用 ISR (revalidate: 60)，商品詳情使用 ISR (revalidate: 300)
6. **TypeScript**：建議遷移至 TypeScript 以提高程式碼品質與開發效率
7. **測試**：建議加入 Vitest + React Testing Library 進行單元/整合測試

---

*本文件為初版架構規劃，實作過程中可依需求調整。*
