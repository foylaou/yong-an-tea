-- Migration: Move MD file data into site_settings
-- This adds new groups: faq, error_page, auth_page, coming_soon,
-- cart_page, wishlist_page, product_detail, grid_layout
-- and expands existing contact group with UI text fields.
-- NOTE: value column is jsonb, so text values must be valid JSON strings (double-quoted).

-- ============================================================
-- contact group (expand with 5 UI text fields)
-- ============================================================
INSERT INTO site_settings (key, value, "group") VALUES
  ('contact_form_title', '"與我們聯繫"', 'contact'),
  ('contact_form_desc', '"寫信給我們！"', 'contact'),
  ('contact_info_title', '"我們的地址"', 'contact'),
  ('contact_info_desc', '"歡迎透過以下方式與我們聯繫，我們將盡快回覆您。"', 'contact'),
  ('contact_social_title', '"追蹤我們的社群"', 'contact')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- faq group
-- ============================================================
INSERT INTO site_settings (key, value, "group") VALUES
  ('faq_items_json', '[{"id":"01","question":"如何幫助您的業務？","answer":"透過與客戶的深入合作與需求討論，我們能夠達成相互理解，獲得客戶信任，提供適當的建議，並推薦合適的技術方案來幫助您的業務轉型。"},{"id":"02","question":"Helendo 有哪些優勢？","answer":"Helendo 注重每一個細節，確保系統運行順暢且反應迅速。Helendo 採用最新的精簡技術來保護客戶的資料庫，並建立高度機密的防火牆。"},{"id":"03","question":"工作流程如何簡化？","answer":"我們透過精簡冗餘的複雜運算與冗長的程式碼，確保 Helendo 能夠流暢運行，並在各種行動裝置與瀏覽器上保持最佳的設計呈現。"},{"id":"04","question":"產品工程與服務","answer":"我們的服務涵蓋產品生命週期中提升客戶體驗的各個環節，包括測試與維修、服務管理，以及端到端的保固管理。"}]', 'faq'),
  ('faq_page_title', '"常見問題"', 'faq'),
  ('faq_page_desc', '"以下是我們最常被詢問的問題，希望能幫助您找到所需的答案。"', 'faq')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- error_page group
-- ============================================================
INSERT INTO site_settings (key, value, "group") VALUES
  ('error404_image', '"/images/error-404/confused.png"', 'error_page'),
  ('error404_image_alt', '"錯誤圖片"', 'error_page'),
  ('error404_title', '"糟糕！找不到頁面"', 'error_page'),
  ('error404_desc', '"很抱歉，我們找不到您要的頁面。請嘗試搜尋或返回"', 'error_page'),
  ('error404_link_path', '"/"', 'error_page'),
  ('error404_link_text', '"首頁"', 'error_page')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- auth_page group
-- ============================================================
INSERT INTO site_settings (key, value, "group") VALUES
  ('auth_tab_menu_json', '[{"id":"auth-menu-01","authMenuName":"登入","tabStateNo":1},{"id":"auth-menu-02","authMenuName":"註冊","tabStateNo":2}]', 'auth_page')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- coming_soon group
-- ============================================================
INSERT INTO site_settings (key, value, "group") VALUES
  ('coming_soon_title', '"即將推出..."', 'coming_soon'),
  ('coming_soon_desc', '"我們正在精心準備全新內容，敬請期待。新版本將帶來更多精彩功能與體驗。"', 'coming_soon'),
  ('coming_soon_count_title', '"全新更新倒數計時："', 'coming_soon'),
  ('coming_soon_social_title', '"追蹤我們："', 'coming_soon')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- cart_page group
-- ============================================================
INSERT INTO site_settings (key, value, "group") VALUES
  ('cart_th_list_json', '[{"id":"cart-th-01","thCName":"font-medium product-name py-3","thName":"商品"},{"id":"cart-th-02","thCName":"font-medium product-price py-3","thName":"價格"},{"id":"cart-th-03","thCName":"font-medium py-3","thName":"數量"},{"id":"cart-th-04","thCName":"font-medium py-3","thName":"合計"},{"id":"cart-th-05","thCName":"font-medium py-3 sr-only-custom","thName":"移除"}]', 'cart_page'),
  ('cart_coupon_title', '"優惠券折扣"', 'cart_page'),
  ('cart_coupon_desc', '"如果您有優惠券代碼，請在此輸入。"', 'cart_page'),
  ('cart_coupon_btn_text', '"套用優惠券"', 'cart_page'),
  ('cart_shop_page_btn_text', '"繼續購物"', 'cart_page'),
  ('cart_clear_btn_text', '"清空購物車"', 'cart_page'),
  ('cart_proceed_btn_text', '"前往結帳"', 'cart_page')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- wishlist_page group
-- ============================================================
INSERT INTO site_settings (key, value, "group") VALUES
  ('wishlist_th_list_json', '[{"id":"wishlist-th-01","thCName":"font-medium product-name py-3","thName":"商品"},{"id":"wishlist-th-02","thCName":"font-medium product-price py-3","thName":"單價"},{"id":"wishlist-th-03","thCName":"font-medium py-3 sr-only-custom","thName":"立即購買"},{"id":"wishlist-th-04","thCName":"font-medium py-3 sr-only-custom","thName":"移除"}]', 'wishlist_page'),
  ('wishlist_clear_btn_text', '"清空願望清單"', 'wishlist_page')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- product_detail group
-- ============================================================
INSERT INTO site_settings (key, value, "group") VALUES
  ('product_tab_menu_json', '[{"id":"tab-menu-01","name":"商品描述","tabMenuItemCName":"description","separatorCName":"tab-menu-separator","tabStateNumber":1},{"id":"tab-menu-02","name":"其他資訊","tabMenuItemCName":"additional-information","separatorCName":"tab-menu-separator","tabStateNumber":2},{"id":"tab-menu-03","name":"評價","tabMenuItemCName":"reviews","separatorCName":"tab-menu-separator","tabStateNumber":3}]', 'product_detail'),
  ('product_desc_title', '"商品描述"', 'product_detail'),
  ('product_feature_title', '"產品特色"', 'product_detail'),
  ('product_review_heading', '"成為第一個評價的人"', 'product_detail'),
  ('product_review_title', '"您的評分"', 'product_detail'),
  ('product_rating_count', '"5"', 'product_detail')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- grid_layout group
-- ============================================================
INSERT INTO site_settings (key, value, "group") VALUES
  ('grid_tab_2col_json', '[{"id":"grid-tab-list-01","gridColumns":"grid-03","gridColumnImg":"/images/grid-icon/columns-03.png","gridImgAlt":"格狀圖片","tabStateNo":1},{"id":"grid-tab-list-02","gridColumns":"grid-04","gridColumnImg":"/images/grid-icon/columns-04.png","gridImgAlt":"格狀圖片","tabStateNo":2}]', 'grid_layout'),
  ('grid_tab_3col_json', '[{"id":"grid-tab-list-01","gridColumns":"grid-03","gridColumnImg":"/images/grid-icon/columns-03.png","gridImgAlt":"格狀圖片","tabStateNo":1},{"id":"grid-tab-list-02","gridColumns":"grid-04","gridColumnImg":"/images/grid-icon/columns-04.png","gridImgAlt":"格狀圖片","tabStateNo":2},{"id":"grid-tab-list-03","gridColumns":"grid-05","gridColumnImg":"/images/grid-icon/columns-05.png","gridImgAlt":"格狀圖片","tabStateNo":3}]', 'grid_layout'),
  ('grid_tab_3col_alt_json', '[{"id":"grid-tab-list-01","gridColumns":"grid-04","gridColumnImg":"/images/grid-icon/columns-04.png","gridImgAlt":"格狀圖片","tabStateNo":1},{"id":"grid-tab-list-02","gridColumns":"grid-05","gridColumnImg":"/images/grid-icon/columns-05.png","gridImgAlt":"格狀圖片","tabStateNo":2},{"id":"grid-tab-list-03","gridColumns":"grid-06","gridColumnImg":"/images/grid-icon/columns-06.png","gridImgAlt":"格狀圖片","tabStateNo":3}]', 'grid_layout')
ON CONFLICT (key) DO NOTHING;
