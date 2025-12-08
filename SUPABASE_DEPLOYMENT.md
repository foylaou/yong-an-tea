# 永安茶園 - Supabase Self-hosted 部署指南

## 📋 目錄

1. [部署概述](#部署概述)
2. [前置需求](#前置需求)
3. [數據庫遷移](#數據庫遷移)
4. [Storage Buckets 設置](#storage-buckets-設置)
5. [環境變數配置](#環境變數配置)
6. [本地開發](#本地開發)
7. [生產環境部署](#生產環境部署)
8. [故障排除](#故障排除)

---

## 🎯 部署概述

本專案使用 **Self-hosted Supabase** 作為後端服務，包括：
- **PostgreSQL** 數據庫
- **Storage** 文件存儲
- **Auth** 身份驗證
- **Realtime** 實時功能（可選）

**部署域名：** `https://supabase.foyserver.uk`

---

## 📦 前置需求

### 已完成配置
- ✅ Self-hosted Supabase 已運行
- ✅ 域名已配置：`supabase.foyserver.uk`
- ✅ SSL 證書已設置
- ✅ 環境變數已配置

### 需要的工具
- Node.js 18+ 和 pnpm
- Supabase CLI
- PostgreSQL 客戶端（可選）

---

## 🗄️ 數據庫遷移

### 方式 1：使用 Supabase CLI（推薦）

#### 步驟 1：安裝 Supabase CLI

```bash
# macOS / Linux
brew install supabase/tap/supabase

# Windows (使用 Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# 或使用 npm
npm install -g supabase
```

#### 步驟 2：連接到遠程 Supabase

```bash
# 在項目根目錄執行
cd /home/foy/WebstormProjects/yong-an-tea

# 連接到生產環境數據庫
supabase link --project-ref yong-an-tea

# 會提示輸入數據庫密碼：5237c8ab5e25e56297cc5efabcc8fbe9
```

#### 步驟 3：推送遷移

```bash
# 推送所有遷移到生產環境
supabase db push

# 或者依次執行每個遷移
supabase db push --db-url "postgresql://postgres:5237c8ab5e25e56297cc5efabcc8fbe9@supabase.foyserver.uk:5432/postgres"
```

#### 步驟 4：載入初始數據

```bash
# 執行 seed 文件
psql "postgresql://postgres:5237c8ab5e25e56297cc5efabcc8fbe9@supabase.foyserver.uk:5432/postgres" -f supabase/seed.sql
```

### 方式 2：直接執行 SQL（備選）

如果你更喜歡手動執行，可以使用以下方法：

```bash
# 連接到數據庫
psql "postgresql://postgres:5237c8ab5e25e56297cc5efabcc8fbe9@supabase.foyserver.uk:5432/postgres"

# 依次執行遷移文件
\i supabase/migrations/20251208000000_initial_schema.sql
\i supabase/migrations/20251208000001_row_level_security.sql
\i supabase/migrations/20251208000002_storage_buckets.sql

# 載入種子數據
\i supabase/seed.sql

# 退出
\q
```

### 方式 3：使用 Supabase Studio

1. 訪問 `https://supabase.foyserver.uk`
2. 使用管理員帳號登錄：
   - 用戶名：`foy`
   - 密碼：`t0955787053S`
3. 進入 SQL Editor
4. 複製並執行每個遷移文件的內容

---

## 📦 Storage Buckets 設置

### 自動創建（通過 Migration）

Storage Buckets 已經在 `20251208000002_storage_buckets.sql` 中定義，執行遷移後會自動創建。

### 驗證 Buckets

登錄 Supabase Studio，檢查以下 Buckets 是否已創建：

1. ✅ `product-images` - 產品圖片
2. ✅ `category-images` - 分類圖片
3. ✅ `user-avatars` - 用戶頭像
4. ✅ `blog-images` - 博客圖片
5. ✅ `assets` - 公共資源

### 上傳測試圖片（可選）

```bash
# 使用 Supabase CLI 上傳
supabase storage cp public/images/products/*.jpg supabase://product-images/
```

---

## 🔐 環境變數配置

### 項目環境變數（`.env.local`）

已自動生成，位於項目根目錄：

```bash
# 查看
cat .env.local
```

內容包括：
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase API URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - 公開金鑰
- `SUPABASE_SERVICE_ROLE_KEY` - 服務端金鑰
- `SUPABASE_DB_*` - 數據庫連接資訊

### 更新現有代碼

如果你的代碼中有使用舊的 Supabase 客戶端，需要更新：

#### 創建 Supabase 客戶端

創建文件 `src/lib/supabase.ts`：

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 服務端專用客戶端（可繞過 RLS）
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

---

## 💻 本地開發

### 啟動本地 Supabase（可選）

如果你想在本地開發時使用本地 Supabase：

```bash
# 啟動本地 Supabase
supabase start

# 這會啟動：
# - PostgreSQL (localhost:54322)
# - Studio (localhost:54323)
# - API (localhost:54321)
```

### 使用生產環境

開發時也可以直接連接生產環境：

```bash
# 使用 .env.local 中的配置
pnpm dev
```

---

## 🚀 生產環境部署

### 步驟 1：構建項目

```bash
pnpm build
```

### 步驟 2：環境變數檢查

確保生產環境有以下環境變數：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://supabase.foyserver.uk
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 步驟 3：部署

根據你的部署平台：

#### Vercel

```bash
vercel --prod
```

#### Docker

```bash
docker build -t yong-an-tea .
docker run -p 3000:3000 --env-file .env.local yong-an-tea
```

---

## 🧪 測試連接

### 測試數據庫連接

創建測試腳本 `test-db.js`：

```javascript
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://supabase.foyserver.uk',
  'your-anon-key'
)

async function testConnection() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .limit(5)

  if (error) {
    console.error('❌ 連接失敗:', error)
  } else {
    console.log('✅ 連接成功!')
    console.log('類別數量:', data.length)
  }
}

testConnection()
```

執行：

```bash
node test-db.js
```

### 測試 Storage

```javascript
const { data, error } = await supabase
  .storage
  .from('product-images')
  .list()

console.log('Bucket 文件:', data)
```

---

## 🔧 故障排除

### 問題 1：無法連接數據庫

**錯誤：** `Error: connect ECONNREFUSED`

**解決方案：**
1. 檢查 Supabase 是否正在運行：
   ```bash
   docker ps | grep supabase
   ```
2. 檢查防火牆設置
3. 驗證域名解析：
   ```bash
   ping supabase.foyserver.uk
   ```

### 問題 2：RLS 阻止訪問

**錯誤：** `new row violates row-level security policy`

**解決方案：**
1. 確認用戶已登錄（如需要）
2. 檢查 RLS 策略是否正確
3. 使用 `supabaseAdmin` 客戶端（僅後端）

### 問題 3：Migration 失敗

**錯誤：** `relation "xxx" already exists`

**解決方案：**
```bash
# 重置數據庫（謹慎使用！會刪除所有數據）
supabase db reset

# 重新推送
supabase db push
```

### 問題 4：Storage 上傳失敗

**錯誤：** `Failed to upload: policy violation`

**解決方案：**
1. 檢查 Bucket 是否存在
2. 驗證 Storage 策略
3. 確認文件類型在允許列表中

---

## 📊 數據庫管理

### 備份數據庫

```bash
# 使用 pg_dump
pg_dump "postgresql://postgres:5237c8ab5e25e56297cc5efabcc8fbe9@supabase.foyserver.uk:5432/postgres" > backup.sql

# 或使用 Supabase CLI
supabase db dump -f backup.sql
```

### 恢復數據庫

```bash
psql "postgresql://postgres:5237c8ab5e25e56297cc5efabcc8fbe9@supabase.foyserver.uk:5432/postgres" < backup.sql
```

### 查看數據庫統計

```sql
-- 查看所有表的行數
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_stat_user_tables.n_live_tup AS rows
FROM pg_tables
LEFT JOIN pg_stat_user_tables ON pg_tables.tablename = pg_stat_user_tables.relname
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🔐 安全建議

### 1. 環境變數安全

- ❌ **不要** 將 `.env.local` 提交到 Git
- ✅ **務必** 使用 `.gitignore` 排除
- ✅ **建議** 在 CI/CD 中使用密鑰管理服務

### 2. API 金鑰保護

- `ANON_KEY` 可以公開（有 RLS 保護）
- `SERVICE_ROLE_KEY` **僅供後端使用**，絕不暴露給前端

### 3. Row Level Security

所有表都應該啟用 RLS：

```sql
-- 檢查哪些表未啟用 RLS
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename NOT IN (
  SELECT tablename
  FROM pg_tables t
  JOIN pg_class c ON c.relname = t.tablename
  WHERE c.relrowsecurity = true
);
```

### 4. 定期更新密鑰

建議每 90 天更新一次 JWT_SECRET 和其他密鑰。

---

## 📚 相關資源

- [Supabase 官方文檔](https://supabase.com/docs)
- [Self-hosting 指南](https://supabase.com/docs/guides/self-hosting)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage 文檔](https://supabase.com/docs/guides/storage)

---

## ✅ 部署檢查清單

部署前請確認：

- [ ] 數據庫遷移已執行
- [ ] Storage Buckets 已創建
- [ ] 環境變數已配置
- [ ] RLS 策略已啟用
- [ ] 測試數據已載入（可選）
- [ ] 連接測試通過
- [ ] 備份策略已設置
- [ ] SSL 證書有效
- [ ] 監控和日誌已配置

---

**部署完成後，你的永安茶園電商網站應該已經可以正常運行了！** 🎉

如有問題，請參考故障排除章節或聯繫技術支持。
