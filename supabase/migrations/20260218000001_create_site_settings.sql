-- Site Settings table (key-value with JSONB)
create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}',
  "group" text not null,
  description text,
  updated_at timestamptz not null default now()
);

-- Index on group for tab filtering
create index idx_site_settings_group on public.site_settings ("group");

-- Reuse existing updated_at trigger
create trigger update_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.update_updated_at_column();

-- RLS
alter table public.site_settings enable row level security;

-- Anyone can read settings
create policy "Anyone can view site settings"
  on public.site_settings for select
  using (true);

-- Only admin can insert/update/delete
create policy "Admin can manage site settings"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- Seed default values
insert into public.site_settings (key, value, "group", description) values
  -- General
  ('site_name', '"Helendo"', 'general', '網站名稱'),
  ('site_description', '"Helendo - React eCommerce Template"', 'general', '網站描述'),
  ('logo_url', '"/images/logo/dark-logo.png"', 'general', 'Logo 圖片路徑'),
  ('favicon_url', '"/favicon.png"', 'general', 'Favicon 路徑'),

  -- Homepage
  ('homepage_variant', '1', 'homepage', '首頁版型 (1-5)'),
  ('header_variant', '1', 'homepage', 'Header 樣式 (1-4)'),
  ('footer_variant', '1', 'homepage', 'Footer 樣式 (1-3)'),

  -- Currency
  ('default_currency', '"TWD"', 'currency', '預設幣別'),
  ('currency_symbol', '"$"', 'currency', '幣別符號'),
  ('decimal_places', '2', 'currency', '小數位數 (0-4)'),
  ('available_currencies', '["TWD","USD","EUR"]', 'currency', '可用幣別清單'),

  -- Contact
  ('company_name', '"Helendo"', 'contact', '公司名稱'),
  ('address', '"台北市信義區信義路五段7號"', 'contact', '公司地址'),
  ('phone', '"(02) 2345-6789"', 'contact', '聯絡電話'),
  ('email', '"support@helendo.com.tw"', 'contact', '聯絡信箱'),

  -- Social
  ('social_facebook', '"https://www.facebook.com/"', 'social', 'Facebook 連結'),
  ('social_twitter', '"https://twitter.com/"', 'social', 'Twitter 連結'),
  ('social_instagram', '"https://instagram.com/"', 'social', 'Instagram 連結'),
  ('social_pinterest', '"https://pinterest.com/"', 'social', 'Pinterest 連結'),
  ('social_tumblr', '"https://www.tumblr.com/"', 'social', 'Tumblr 連結'),

  -- Product Display
  ('default_grid_columns', '4', 'product_display', '商品列表欄數 (3-6)'),
  ('products_per_page', '12', 'product_display', '每頁商品數 (4-48)'),
  ('default_sort_order', '"newest"', 'product_display', '預設排序方式');
