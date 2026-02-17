-- Add detail_desc, features, attributes_json, stock_qty columns to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS detail_desc text,
  ADD COLUMN IF NOT EXISTS features text,
  ADD COLUMN IF NOT EXISTS attributes_json text DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS stock_qty integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_qty integer NOT NULL DEFAULT 0;
