-- ============================================================
-- 熟客折扣（方案一：優惠綁顧客）
--
-- discount_type NULL 代表這位客戶沒有熟客折扣（一般客戶）。
-- 欄位命名/型別直接比照 coupons 表已經在用的 discount_type/discount_value，
-- 不重新設計。
-- ============================================================

ALTER TABLE public.customers
  ADD COLUMN discount_type text CHECK (discount_type IN ('percentage', 'fixed_amount')),
  ADD COLUMN discount_value numeric(10,2) NOT NULL DEFAULT 0;
