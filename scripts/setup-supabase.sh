#!/bin/bash

# =============================================
# 永安茶園 Supabase 設置腳本
# =============================================

set -e  # 遇到錯誤立即退出

echo "====================================="
echo "永安茶園 Supabase 設置腳本"
echo "====================================="
echo ""

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 檢查必要工具
check_tools() {
    echo "檢查必要工具..."

    if ! command -v psql &> /dev/null; then
        echo -e "${RED}❌ psql 未安裝，請先安裝 PostgreSQL 客戶端${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ psql 已安裝${NC}"
}

# 檢查環境變數
check_env() {
    echo ""
    echo "檢查環境變數..."

    if [ ! -f .env.local ]; then
        echo -e "${RED}❌ .env.local 文件不存在${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ .env.local 文件存在${NC}"
}

# 測試數據庫連接
test_connection() {
    echo ""
    echo "測試數據庫連接..."

    DB_URL="postgresql://postgres:5237c8ab5e25e56297cc5efabcc8fbe9@supabase.foyserver.uk:5432/postgres"

    if psql "$DB_URL" -c "SELECT version();" &> /dev/null; then
        echo -e "${GREEN}✅ 數據庫連接成功${NC}"
    else
        echo -e "${RED}❌ 數據庫連接失敗${NC}"
        echo "請檢查："
        echo "  1. Supabase 服務是否運行"
        echo "  2. 網絡連接是否正常"
        echo "  3. 數據庫密碼是否正確"
        exit 1
    fi
}

# 執行遷移
run_migrations() {
    echo ""
    echo "執行數據庫遷移..."

    DB_URL="postgresql://postgres:5237c8ab5e25e56297cc5efabcc8fbe9@supabase.foyserver.uk:5432/postgres"

    # 檢查 migrations 目錄
    if [ ! -d "supabase/migrations" ]; then
        echo -e "${RED}❌ migrations 目錄不存在${NC}"
        exit 1
    fi

    # 依次執行遷移文件
    for migration in supabase/migrations/*.sql; do
        if [ -f "$migration" ]; then
            echo "執行: $migration"
            if psql "$DB_URL" -f "$migration" > /dev/null 2>&1; then
                echo -e "${GREEN}✅ $migration 執行成功${NC}"
            else
                echo -e "${YELLOW}⚠️  $migration 可能已經執行過或遇到錯誤${NC}"
            fi
        fi
    done
}

# 載入種子數據
load_seed() {
    echo ""
    read -p "是否載入測試數據？(y/n) " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "載入測試數據..."

        DB_URL="postgresql://postgres:5237c8ab5e25e56297cc5efabcc8fbe9@supabase.foyserver.uk:5432/postgres"

        if [ -f "supabase/seed.sql" ]; then
            if psql "$DB_URL" -f "supabase/seed.sql" > /dev/null 2>&1; then
                echo -e "${GREEN}✅ 測試數據載入成功${NC}"
            else
                echo -e "${YELLOW}⚠️  測試數據可能已經存在${NC}"
            fi
        else
            echo -e "${RED}❌ seed.sql 文件不存在${NC}"
        fi
    else
        echo "跳過測試數據載入"
    fi
}

# 驗證設置
verify_setup() {
    echo ""
    echo "驗證設置..."

    DB_URL="postgresql://postgres:5237c8ab5e25e56297cc5efabcc8fbe9@supabase.foyserver.uk:5432/postgres"

    # 檢查表是否存在
    echo "檢查數據庫表..."
    TABLES=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

    if [ "$TABLES" -gt 0 ]; then
        echo -e "${GREEN}✅ 找到 $TABLES 個表${NC}"
    else
        echo -e "${RED}❌ 未找到任何表${NC}"
        exit 1
    fi

    # 檢查 Storage Buckets
    echo "檢查 Storage Buckets..."
    BUCKETS=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM storage.buckets;")

    if [ "$BUCKETS" -gt 0 ]; then
        echo -e "${GREEN}✅ 找到 $BUCKETS 個 Bucket${NC}"
    else
        echo -e "${YELLOW}⚠️  未找到 Storage Bucket${NC}"
    fi
}

# 顯示訪問信息
show_info() {
    echo ""
    echo "====================================="
    echo "設置完成！"
    echo "====================================="
    echo ""
    echo "訪問信息："
    echo "  Supabase URL: https://supabase.foyserver.uk"
    echo "  Studio 用戶名: foy"
    echo "  Studio 密碼: t0955787053S"
    echo ""
    echo "下一步："
    echo "  1. 訪問 Supabase Studio 驗證設置"
    echo "  2. 執行 'pnpm dev' 啟動開發服務器"
    echo "  3. 查看 SUPABASE_DEPLOYMENT.md 了解更多"
    echo ""
}

# 主函數
main() {
    check_tools
    check_env
    test_connection
    run_migrations
    load_seed
    verify_setup
    show_info
}

# 執行主函數
main
