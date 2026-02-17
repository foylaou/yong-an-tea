-- ============================================================
-- Add product display fields + SKU type change + site-assets bucket
-- ============================================================

-- 1. New product fields for homepage display
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS show_in_banner BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS banner_order INTEGER NOT NULL DEFAULT 0;

-- 2. SKU: int → text (allows alphanumeric codes like TEA-001)
ALTER TABLE public.products ALTER COLUMN sku TYPE TEXT USING sku::TEXT;

-- 3. Create site-assets storage bucket (for hero, brands, video, offer images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-assets',
  'site-assets',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Anyone can read public bucket objects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Public read access for site assets'
      AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public read access for site assets"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'site-assets');
  END IF;
END $$;

-- Admin can upload
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Admin can upload site assets'
      AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Admin can upload site assets"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'site-assets'
        AND public.is_admin()
      );
  END IF;
END $$;

-- Admin can update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Admin can update site assets'
      AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Admin can update site assets"
      ON storage.objects FOR UPDATE
      USING (
        bucket_id = 'site-assets'
        AND public.is_admin()
      );
  END IF;
END $$;

-- Admin can delete
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Admin can delete site assets'
      AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Admin can delete site assets"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'site-assets'
        AND public.is_admin()
      );
  END IF;
END $$;
