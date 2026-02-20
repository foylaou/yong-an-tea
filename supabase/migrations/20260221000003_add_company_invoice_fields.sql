-- 訂單新增公司發票欄位
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS company_tax_id text;
