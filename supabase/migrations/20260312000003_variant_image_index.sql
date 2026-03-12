-- Add image_index to product_variants to link a variant to a gallery image
alter table public.product_variants
  add column image_index int default null;
