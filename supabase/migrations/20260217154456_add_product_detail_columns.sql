-- Add missing product detail columns
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS attributes_json text DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS stock_qty integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_qty integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS detail_desc text DEFAULT '',
  ADD COLUMN IF NOT EXISTS features text DEFAULT '';
