-- cart_items: 加入 variant_id 欄位，讓購物車可以記錄變體資訊
ALTER TABLE public.cart_items
  ADD COLUMN variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL;

-- 舊的唯一約束只看 (user_id, product_id)，無法區分同商品不同變體
ALTER TABLE public.cart_items
  DROP CONSTRAINT cart_items_user_id_product_id_key;

-- 新的唯一約束：同使用者 + 同商品 + 同變體 只能有一筆
-- 使用 UNIQUE NULLS NOT DISTINCT 讓 variant_id 為 NULL 時也算同一筆
CREATE UNIQUE INDEX cart_items_user_product_variant_idx
  ON public.cart_items (user_id, product_id, variant_id)
  NULLS NOT DISTINCT;
