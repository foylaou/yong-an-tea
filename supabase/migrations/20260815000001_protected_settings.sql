-- ============================================================
-- Protected Settings
--
-- site_settings has "Anyone can view site settings" USING (true) — needed
-- so the storefront's unauthenticated SettingsProvider can read branding/
-- copy, but it means every row is world-readable via the public anon key,
-- not just to logged-in admins. Several groups store live secrets there
-- (smtp_pass, linepay_channel_secret, tcat customer tokens,
-- line_login_channel_secret, unused payment hash key/iv) — all currently
-- exposed to anyone who queries the table.
--
-- protected_settings is the same key/value/group shape, but with no public
-- read policy at all — admin-only, both directions. The groups below move
-- here wholesale (not just the secret fields) so each group's config stays
-- in one place instead of being split across two tables.
-- ============================================================

CREATE TABLE public.protected_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}',
  "group" text NOT NULL,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_protected_settings_group ON public.protected_settings ("group");

CREATE TRIGGER update_protected_settings_updated_at
  BEFORE UPDATE ON public.protected_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.protected_settings ENABLE ROW LEVEL SECURITY;

-- No public select policy — admin only, both read and write.
CREATE POLICY "Admin manage protected settings"
  ON public.protected_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Move the groups that carry secrets wholesale, so route/component code
-- that reads e.g. tcat_sender_name doesn't need to know it now lives
-- alongside tcat_prod_customer_token in a different table.
INSERT INTO public.protected_settings (key, value, "group", description, updated_at)
SELECT key, value, "group", description, updated_at
FROM public.site_settings
WHERE "group" IN ('line_login', 'linepay', 'payment', 'smtp', 'logistics')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

DELETE FROM public.site_settings
WHERE "group" IN ('line_login', 'linepay', 'payment', 'smtp', 'logistics');

-- Seed LINE Bot (Messaging API) settings — new group, protected from the start.
INSERT INTO public.protected_settings (key, value, "group", description) VALUES
  ('line_bot_enabled', 'false', 'line_bot', '是否啟用 LINE 官方帳號串接'),
  ('line_bot_channel_id', '""', 'line_bot', 'Messaging API Channel ID'),
  ('line_bot_channel_secret', '""', 'line_bot', 'Messaging API Channel Secret（驗證 webhook 簽章用）'),
  ('line_bot_channel_access_token', '""', 'line_bot', 'Messaging API Channel Access Token（呼叫 API 用）'),
  ('line_bot_basic_id', '""', 'line_bot', '官方帳號 Basic ID（@開頭，顯示加好友連結用）'),
  ('line_bot_liff_id', '""', 'line_bot', 'LIFF App ID')
ON CONFLICT (key) DO NOTHING;
