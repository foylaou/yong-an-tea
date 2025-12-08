# 永安茶園 - Supabase 配置快速開始

## 🚀 快速開始

### 1. 執行自動設置腳本（推薦）

```bash
# 進入項目目錄
cd /home/foy/WebstormProjects/yong-an-tea

# 執行設置腳本
./scripts/setup-supabase.sh
```

這個腳本會自動：
- ✅ 檢查數據庫連接
- ✅ 執行所有遷移
- ✅ 載入測試數據
- ✅ 驗證設置

### 2. 手動設置（如果腳本失敗）

```bash
# 連接到數據庫
psql "postgresql://postgres:5237c8ab5e25e56297cc5efabcc8fbe9@supabase.foyserver.uk:5432/postgres"

# 執行遷移
\i supabase/migrations/20251208000000_initial_schema.sql
\i supabase/migrations/20251208000001_row_level_security.sql
\i supabase/migrations/20251208000002_storage_buckets.sql

# 載入測試數據
\i supabase/seed.sql

# 退出
\q
```

---

## 📁 項目結構

```
yong-an-tea/
├── .env.local                       # 環境變數（已生成）
├── .env.example                     # 環境變數範例
├── SUPABASE_DEPLOYMENT.md           # 詳細部署文檔
├── README_SUPABASE.md               # 本文件
├── 資料庫架構.md                    # 數據庫架構文檔
├── supabase/
│   ├── config.toml                  # Supabase 配置
│   ├── seed.sql                     # 測試數據
│   └── migrations/                  # 數據庫遷移
│       ├── 20251208000000_initial_schema.sql
│       ├── 20251208000001_row_level_security.sql
│       └── 20251208000002_storage_buckets.sql
└── scripts/
    └── setup-supabase.sh            # 自動設置腳本
```

---

## 🗄️ 數據庫表

已創建的表：

1. **categories** - 茶品類別
2. **products** - 產品
3. **product_attributes** - 產品屬性
4. **users** - 用戶
5. **orders** - 訂單
6. **order_items** - 訂單項目
7. **tags** - 標籤
8. **products_tags** - 產品標籤關聯
9. **carts** - 購物車
10. **cart_items** - 購物車項目
11. **blogs** - 博客文章
12. **reviews** - 產品評論
13. **wishlist** - 願望清單

---

## 💾 Storage Buckets

已配置的 Buckets：

1. **product-images** - 產品圖片（5MB 限制）
2. **category-images** - 分類圖片（3MB 限制）
3. **user-avatars** - 用戶頭像（2MB 限制）
4. **blog-images** - 博客圖片（5MB 限制）
5. **assets** - 公共資源（10MB 限制）

---

## 🔑 訪問憑證

### Supabase Studio
- **URL:** https://supabase.foyserver.uk
- **用戶名:** foy
- **密碼:** t0955787053S

### 測試帳號
- **Email:** s225002731@gmail.com
- **角色:** 管理員

---

## 💻 開發使用

### 安裝依賴

```bash
pnpm install
```

### 啟動開發服務器

```bash
pnpm dev
```

### 創建 Supabase 客戶端

在 `src/lib/supabase.ts` 中：

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 管理員客戶端（僅後端使用）
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

### 查詢範例

```typescript
// 查詢所有產品
const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('is_active', true)

// 創建訂單
const { data: order } = await supabase
  .from('orders')
  .insert({
    user_id: userId,
    order_number: 'ORD-001',
    total: 1000,
    shipping_address: {...},
    payment_method: 'credit_card'
  })
  .select()
  .single()

// 上傳圖片
const { data: uploadData } = await supabase
  .storage
  .from('product-images')
  .upload(`${productId}/main.jpg`, file)
```

---

## ✅ 檢查清單

設置完成後，請確認：

- [ ] 數據庫遷移已執行
- [ ] Storage Buckets 已創建
- [ ] 測試數據已載入
- [ ] 可以訪問 Supabase Studio
- [ ] 環境變數已配置
- [ ] 開發服務器可以連接數據庫

---

## 📚 相關文檔

- [SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md) - 詳細部署指南
- [資料庫架構.md](./資料庫架構.md) - 完整數據庫架構
- [Supabase 官方文檔](https://supabase.com/docs)

---

## 🆘 需要幫助？

如果遇到問題：

1. 查看 [SUPABASE_DEPLOYMENT.md](./SUPABASE_DEPLOYMENT.md) 的故障排除章節
2. 檢查 Supabase 服務是否運行
3. 驗證環境變數配置
4. 查看數據庫日誌

---

**配置完成後，你的永安茶園專案已經準備就緒！** 🎉
