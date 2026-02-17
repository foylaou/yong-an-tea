-- ============================================================
-- Add missing product field: category_banner_img
-- 5 products use this field in markdown data
-- ============================================================

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_banner_img text;
