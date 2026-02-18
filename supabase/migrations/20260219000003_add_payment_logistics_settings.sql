-- LINE Pay + 黑貓物流設定 seed data
INSERT INTO public.site_settings (key, value, "group", description) VALUES
  -- LINE Pay
  ('linepay_channel_id', '""', 'linepay', 'LINE Pay Channel ID'),
  ('linepay_channel_secret', '""', 'linepay', 'LINE Pay Channel Secret Key'),
  ('linepay_sandbox', '"true"', 'linepay', '是否使用 Sandbox 測試環境'),

  -- 黑貓宅急便
  ('tcat_customer_id', '""', 'logistics', '黑貓客戶代號'),
  ('tcat_password', '""', 'logistics', '黑貓密碼'),
  ('tcat_sandbox', '"true"', 'logistics', '是否使用測試環境'),
  ('tcat_sender_name', '""', 'logistics', '寄件人姓名'),
  ('tcat_sender_phone', '""', 'logistics', '寄件人電話'),
  ('tcat_sender_address', '""', 'logistics', '寄件人地址')
ON CONFLICT (key) DO NOTHING;
