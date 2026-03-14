-- Phase 1: Product thermosphere (溫層) attribute
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS thermosphere text NOT NULL DEFAULT '0001';
-- 0001=常溫, 0002=冷藏, 0003=冷凍 (matches T-Cat API codes)

COMMENT ON COLUMN public.products.thermosphere IS '溫層: 0001=常溫, 0002=冷藏, 0003=冷凍';

-- Phase 2: 7-11 B2S support on orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS store_id text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS store_name text DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS store_address text DEFAULT NULL;

COMMENT ON COLUMN public.orders.store_id IS '7-11 門市代號 (B2S)';
COMMENT ON COLUMN public.orders.store_name IS '7-11 門市名稱';
COMMENT ON COLUMN public.orders.store_address IS '7-11 門市地址';
