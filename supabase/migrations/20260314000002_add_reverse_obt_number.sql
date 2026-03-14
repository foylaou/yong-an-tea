-- 逆物流退貨取件單號
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS reverse_obt_number text DEFAULT NULL;

COMMENT ON COLUMN public.orders.reverse_obt_number IS '逆物流託運單號 (退貨取件)';
