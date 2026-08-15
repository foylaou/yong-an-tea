-- ============================================================
-- Split line_bot_liff_id / line_bot_basic_id out of protected_settings
--
-- Both were seeded into protected_settings (admin-only read) alongside
-- channel_secret/channel_access_token in 20260815000001. That's wrong for
-- these two specifically: the LIFF ID has to be readable client-side (the
-- storefront calls liff.init({ liffId }) in the browser), and the Basic ID
-- is just the public @-handle used to build an "add friend" link/QR — moved
-- to site_settings (public read) under a new line_bot_public group instead.
-- ============================================================

INSERT INTO public.site_settings (key, value, "group", description)
SELECT key, value, 'line_bot_public', description
FROM public.protected_settings
WHERE key IN ('line_bot_liff_id', 'line_bot_basic_id')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

DELETE FROM public.protected_settings
WHERE key IN ('line_bot_liff_id', 'line_bot_basic_id');
