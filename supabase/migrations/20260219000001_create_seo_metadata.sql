-- SEO Metadata table: polymorphic design for products, blogs, and static pages
CREATE TABLE IF NOT EXISTS seo_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('product', 'blog', 'page')),
  entity_id UUID,
  page_path TEXT,

  -- Basic Meta
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  canonical_url TEXT,

  -- OpenGraph
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  og_type TEXT DEFAULT 'website',

  -- Twitter Card
  twitter_card TEXT DEFAULT 'summary_large_image',
  twitter_title TEXT,
  twitter_description TEXT,
  twitter_image TEXT,

  -- Structured Data (JSON-LD)
  structured_data JSONB,

  -- Crawling directives
  no_index BOOLEAN NOT NULL DEFAULT FALSE,
  no_follow BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- product/blog must have entity_id; page must have page_path
  CONSTRAINT seo_entity_check CHECK (
    (entity_type IN ('product', 'blog') AND entity_id IS NOT NULL AND page_path IS NULL)
    OR
    (entity_type = 'page' AND page_path IS NOT NULL AND entity_id IS NULL)
  )
);

-- Unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS seo_metadata_entity_uniq
  ON seo_metadata (entity_type, entity_id)
  WHERE entity_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS seo_metadata_page_uniq
  ON seo_metadata (entity_type, page_path)
  WHERE page_path IS NOT NULL;

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_seo_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER seo_metadata_updated_at
  BEFORE UPDATE ON seo_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_seo_metadata_updated_at();

-- RLS
ALTER TABLE seo_metadata ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "seo_metadata_public_read"
  ON seo_metadata FOR SELECT
  USING (true);

-- Admin write (insert, update, delete)
CREATE POLICY "seo_metadata_admin_insert"
  ON seo_metadata FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "seo_metadata_admin_update"
  ON seo_metadata FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "seo_metadata_admin_delete"
  ON seo_metadata FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
