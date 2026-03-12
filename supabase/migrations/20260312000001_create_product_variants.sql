-- Product variants table (e.g., 罐裝 500, 無罐裝 400)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  discount_price NUMERIC(10,2),
  stock_qty INTEGER NOT NULL DEFAULT 0,
  sku TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);

-- RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "admin_manage_variants" ON public.product_variants
  FOR ALL USING (public.is_admin());

-- Public can read active variants of active products
CREATE POLICY "public_read_active_variants" ON public.product_variants
  FOR SELECT USING (is_active = true);
