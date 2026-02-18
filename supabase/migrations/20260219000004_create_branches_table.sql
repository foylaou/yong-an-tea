-- ============================================================
-- Branches (分店管理) — replaces static contact settings
-- ============================================================
CREATE TABLE public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  address text,
  business_hours text,
  map_embed_url text,
  image_url text,
  is_primary boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Anyone can view active branches
CREATE POLICY "Anyone can view active branches"
  ON public.branches FOR SELECT
  USING (is_active = true);

-- Admin full access
CREATE POLICY "Admin can manage branches"
  ON public.branches FOR ALL
  USING (public.is_admin());

CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed: migrate existing contact settings into first branch
INSERT INTO public.branches (name, phone, email, address, business_hours, map_embed_url, is_primary, sort_order)
SELECT
  COALESCE((SELECT value #>> '{}' FROM public.site_settings WHERE key = 'company_name'), '永安茶園'),
  COALESCE((SELECT value #>> '{}' FROM public.site_settings WHERE key = 'phone'), ''),
  COALESCE((SELECT value #>> '{}' FROM public.site_settings WHERE key = 'email'), ''),
  COALESCE((SELECT value #>> '{}' FROM public.site_settings WHERE key = 'address'), ''),
  COALESCE((SELECT value #>> '{}' FROM public.site_settings WHERE key = 'business_hours'), ''),
  COALESCE((SELECT value #>> '{}' FROM public.site_settings WHERE key = 'map_embed_url'), ''),
  true,
  0;
