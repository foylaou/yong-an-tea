-- 新增庫存管理模式欄位：shared = 與商品共用庫存，independent = 各規格獨立庫存
ALTER TABLE public.products
  ADD COLUMN variant_stock_mode text NOT NULL DEFAULT 'shared'
  CHECK (variant_stock_mode IN ('shared', 'independent'));
