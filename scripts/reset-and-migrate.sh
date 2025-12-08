#!/bin/bash

# =============================================
# 永安茶園 - 重置並重新執行遷移
# 警告：此操作會刪除所有現有數據！
# =============================================

set -e

echo "====================================="
echo "警告：此操作將刪除所有現有數據！"
echo "====================================="
echo ""

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 數據庫連接
DB_URL="postgresql://postgres:5237c8ab5e25e56297cc5efabcc8fbe9@supabase.foyserver.uk:5432/postgres"

# 確認操作
read -p "確定要重置數據庫嗎？這將刪除所有數據！(輸入 YES 繼續) " -r
echo ""

if [[ ! $REPLY == "YES" ]]; then
    echo "操作已取消"
    exit 0
fi

echo ""
echo "開始重置數據庫..."
echo ""

# 1. 刪除所有表
echo "1. 刪除現有的表和類型..."
psql "$DB_URL" <<EOF
-- 刪除所有 storage policies
DROP POLICY IF EXISTS "公開讀取產品圖片" ON storage.objects;
DROP POLICY IF EXISTS "公開讀取類別圖片" ON storage.objects;
DROP POLICY IF EXISTS "公開讀取用戶頭像" ON storage.objects;
DROP POLICY IF EXISTS "公開讀取博客圖片" ON storage.objects;
DROP POLICY IF EXISTS "公開讀取公共資源" ON storage.objects;
DROP POLICY IF EXISTS "用戶上傳自己的頭像" ON storage.objects;
DROP POLICY IF EXISTS "用戶更新自己的頭像" ON storage.objects;
DROP POLICY IF EXISTS "用戶刪除自己的頭像" ON storage.objects;

-- 刪除 storage buckets
DELETE FROM storage.buckets WHERE id IN ('product-images', 'category-images', 'user-avatars', 'blog-images', 'assets');

-- 刪除所有表（按依賴順序）
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS blogs CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS products_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_attributes CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 刪除函數
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 刪除枚舉類型
DROP TYPE IF EXISTS product_category CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;

-- 刪除擴展（如果需要）
-- DROP EXTENSION IF EXISTS "uuid-ossp";

EOF

echo -e "${GREEN}✅ 清理完成${NC}"
echo ""

# 2. 重新執行遷移
echo "2. 重新執行遷移..."
psql "$DB_URL" -f supabase/migrations/20251208000000_initial_schema.sql
echo -e "${GREEN}✅ Schema 創建完成${NC}"
echo ""

# 3. 載入測試數據（可選）
read -p "是否載入測試數據？(y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "3. 載入測試數據..."
    psql "$DB_URL" -f supabase/seed.sql
    echo -e "${GREEN}✅ 測試數據載入完成${NC}"
else
    echo "跳過測試數據"
fi

echo ""
echo "====================================="
echo -e "${GREEN}重置完成！${NC}"
echo "====================================="
