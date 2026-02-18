-- Seed header/footer settings from legacy markdown data
-- Use to_jsonb(text) to store values as JSON strings (matching app behavior)
INSERT INTO site_settings (key, value, "group") VALUES
  ('header_menu_json', to_jsonb('[{"id":1,"title":"首頁","path":"/","holderCName":""},{"id":2,"title":"商品","path":"/products/left-sidebar","holderCName":"header-submenu-holder group","submenuCName":"header-submenu","headerSubmenu":[{"id":"product-categories","submenuTitle":"商品分類","submenuPath":"/products/categories"},{"id":"cart","submenuTitle":"購物車","submenuPath":"/cart"},{"id":"wishlist","submenuTitle":"願望清單","submenuPath":"/wishlist"}]},{"id":3,"title":"部落格","path":"/blogs/sidebar","holderCName":""},{"id":4,"title":"頁面","path":"/","holderCName":"header-submenu-holder group","submenuCName":"header-submenu","headerSubmenu":[{"id":"about","submenuTitle":"關於我們","submenuPath":"/about"},{"id":"contact","submenuTitle":"聯絡我們","submenuPath":"/contact"},{"id":"faq","submenuTitle":"常見問題","submenuPath":"/faq"}]}]'::text), 'header_footer'),
  ('header_contact_title', to_jsonb('聯繫我們'::text), 'header_footer'),
  ('header_social_title', to_jsonb('追蹤我們的社群'::text), 'header_footer'),
  ('footer_address_title', to_jsonb('地址'::text), 'header_footer'),
  ('footer_info_title', to_jsonb('幫助與資訊'::text), 'header_footer'),
  ('footer_info_links_json', to_jsonb('[{"id":1,"title":"幫助與聯繫","path":"/contact"},{"id":2,"title":"退換貨政策","path":"/contact"},{"id":3,"title":"線上商店","path":"/"},{"id":4,"title":"服務條款","path":"/contact"}]'::text), 'header_footer'),
  ('footer_about_title', to_jsonb('關於我們'::text), 'header_footer'),
  ('footer_about_links_json', to_jsonb('[{"id":1,"title":"關於我們","path":"/about"},{"id":2,"title":"我們的服務","path":"/about"},{"id":3,"title":"常見問題","path":"/faq"},{"id":4,"title":"聯絡我們","path":"/contact"}]'::text), 'header_footer'),
  ('footer_newsletter_title', to_jsonb('電子報'::text), 'header_footer'),
  ('footer_menu_links_json', to_jsonb('[{"id":1,"title":"服務條款","path":"/about"},{"id":2,"title":"隱私權政策","path":"/about"},{"id":3,"title":"地圖","path":"/contact"}]'::text), 'header_footer'),
  ('footer_social_title', to_jsonb('追蹤我們的社群'::text), 'header_footer'),
  ('footer_social_media_title', to_jsonb('社群媒體'::text), 'header_footer'),
  ('footer_logo_alt', to_jsonb('頁尾標誌'::text), 'header_footer'),
  ('footer_logo_path', to_jsonb('/'::text), 'header_footer')
ON CONFLICT (key) DO NOTHING;
