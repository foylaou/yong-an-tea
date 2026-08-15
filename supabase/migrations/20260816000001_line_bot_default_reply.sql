-- ============================================================
-- Admin-configurable fallback reply for messages the bot's keyword
-- dispatch (order status / coupon query) doesn't match — was hardcoded in
-- the webhook route; moving it into settings so it doesn't need a code
-- change + redeploy to reword. Also configurable to send nothing at all
-- (line_bot_default_reply_enabled = false), for admins who'd rather the
-- bot stay silent on anything it doesn't recognize.
-- ============================================================

INSERT INTO public.protected_settings (key, value, "group", description) VALUES
  ('line_bot_default_reply_enabled', 'true', 'line_bot', '訊息沒有符合任何關鍵字時，是否要回覆預設訊息'),
  ('line_bot_default_reply', '"目前可以輸入「訂單」查詢出貨狀況，或輸入「優惠」查詢目前的優惠券。"', 'line_bot', '訊息沒有符合任何關鍵字時的預設回覆內容')
ON CONFLICT (key) DO NOTHING;
