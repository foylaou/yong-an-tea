-- ============================================================
-- LINE Login: add line_user_id to profiles + settings seed
-- ============================================================

-- Add LINE user ID to profiles for OAuth linking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS line_user_id text UNIQUE;
CREATE INDEX IF NOT EXISTS idx_profiles_line_user_id ON public.profiles (line_user_id) WHERE line_user_id IS NOT NULL;

-- Seed LINE Login settings
INSERT INTO public.site_settings (key, value, "group") VALUES
  ('line_login_channel_id', '""', 'line_login'),
  ('line_login_channel_secret', '""', 'line_login')
ON CONFLICT (key) DO NOTHING;
