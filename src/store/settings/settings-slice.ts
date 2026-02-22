import { create } from 'zustand';

interface SiteSettings {
  // currency
  currency_symbol: string;
  decimal_places: number;
  // contact
  company_name: string;
  address: string;
  phone: string;
  email: string;
  business_hours: string;
  map_embed_url: string;
  // social
  social_facebook: string;
  social_twitter: string;
  social_instagram: string;
  social_pinterest: string;
  social_tumblr: string;
  // product display
  shop_layout: string;
  products_per_page: number;
  // variant
  homepage_variant: number;
  header_variant: number;
  footer_variant: number;
  // general
  site_name: string;
  site_description: string;
  logo_url: string;
  favicon_url: string;
  copyright_text: string;
  // content / UI text
  section_title_bestselling: string;
  section_title_latest_blog: string;
  section_title_explore_blog: string;
  section_title_popular_products: string;
  section_title_newsletter: string;
  newsletter_desc: string;
  section_title_newsletter_v3: string;
  newsletter_desc_v3: string;
  btn_shop_now: string;
  btn_view_more: string;
  btn_view_all: string;
  btn_all_products: string;
  btn_load_more: string;
  btn_all_loaded: string;
  btn_subscribe: string;
  new_arrival_title: string;
  new_arrival_desc: string;
  new_arrival_excerpt: string;
  email_placeholder: string;
  // video
  video_title: string;
  video_desc: string;
  video_image: string;
  video_image_alt: string;
  video_url: string;
  // blog
  blog_enabled: string;
  // offer
  offer_enabled: string;
  offer_title: string;
  offer_desc: string;
  offer_countdown_date: string;
  offer_link: string;
  offer_image: string;
  // brands
  brands_json: string;
  // hero
  hero_hide_header_at_top: string;
  hero_default_json: string;
  hero_boxed_json: string;
  hero_carousel_json: string;
  hero_collection_json: string;
  // featured products
  featured_products_json: string;
  // about
  about_video_banner: string;
  about_video_banner_alt: string;
  about_video_url: string;
  about_support_info_json: string;
  about_perfection_title: string;
  about_perfection_desc: string;
  about_progress_json: string;
  about_banner_alt: string;
  about_banner_one: string;
  about_banner_two: string;
  about_banner_three: string;
  about_banner_four: string;
  about_banner_five: string;
  about_address_title_one: string;
  about_address_desc_one: string;
  about_address_title_two: string;
  about_address_desc_two: string;
  // contact UI text
  contact_form_title: string;
  contact_form_desc: string;
  contact_info_title: string;
  contact_info_desc: string;
  contact_social_title: string;
  // faq
  faq_items_json: string;
  faq_page_title: string;
  faq_page_desc: string;
  // error page
  error404_image: string;
  error404_image_alt: string;
  error404_title: string;
  error404_desc: string;
  error404_link_path: string;
  error404_link_text: string;
  // auth page
  auth_tab_menu_json: string;
  // coming soon
  coming_soon_title: string;
  coming_soon_desc: string;
  coming_soon_count_title: string;
  coming_soon_social_title: string;
  // cart page
  cart_th_list_json: string;
  cart_coupon_title: string;
  cart_coupon_desc: string;
  cart_coupon_btn_text: string;
  cart_shop_page_btn_text: string;
  cart_clear_btn_text: string;
  cart_proceed_btn_text: string;
  // wishlist page
  wishlist_th_list_json: string;
  wishlist_clear_btn_text: string;
  // product detail
  product_tab_menu_json: string;
  product_desc_title: string;
  product_feature_title: string;
  product_review_heading: string;
  product_review_title: string;
  product_rating_count: string;
  // grid layout
  grid_tab_2col_json: string;
  grid_tab_3col_json: string;
  grid_tab_3col_alt_json: string;
  // header / footer
  header_menu_json: string;
  header_contact_title: string;
  header_social_title: string;
  footer_address_title: string;
  footer_info_title: string;
  footer_info_links_json: string;
  footer_about_title: string;
  footer_about_links_json: string;
  footer_newsletter_title: string;
  footer_menu_links_json: string;
  footer_social_title: string;
  footer_social_media_title: string;
  footer_logo_alt: string;
  footer_logo_path: string;
  // state
  loaded: boolean;
}

interface SettingsActions {
  hydrate: (data: Partial<SiteSettings>) => void;
}

export const useSettingsStore = create<SiteSettings & SettingsActions>()((set) => ({
  // currency defaults
  currency_symbol: '$',
  decimal_places: 2,
  // contact defaults
  company_name: '永安茶園',
  address: '',
  phone: '',
  email: '',
  business_hours: '',
  map_embed_url: '',
  // social defaults
  social_facebook: '',
  social_twitter: '',
  social_instagram: '',
  social_pinterest: '',
  social_tumblr: '',
  // product display defaults
  shop_layout: 'left-sidebar',
  products_per_page: 9,
  // variant defaults
  homepage_variant: 1,
  header_variant: 1,
  footer_variant: 1,
  // general defaults
  site_name: '永安茶園',
  site_description: '永安茶園 — 嚴選台灣好茶，產地直送，品味自然甘醇。',
  logo_url: '',
  favicon_url: '',
  copyright_text: '© {year} 永安茶園. 版權所有。',
  // content / UI text defaults
  section_title_bestselling: '暢銷商品',
  section_title_latest_blog: '最新文章',
  section_title_explore_blog: '探索我們的部落格',
  section_title_popular_products: 'Popular Products',
  section_title_newsletter: '訂閱電子報',
  newsletter_desc: '訂閱我們的電子報，享有 50% 折扣優惠',
  section_title_newsletter_v3: '註冊即享 50% 折扣',
  newsletter_desc_v3: '訂閱我們的電子報即享 50% 折扣優惠。顧客的喜悅是我們最大的榮幸。',
  btn_shop_now: '立即選購',
  btn_view_more: '查看更多',
  btn_view_all: '查看全部',
  btn_all_products: 'All Products',
  btn_load_more: '載入更多',
  btn_all_loaded: '所有商品已載入完畢！',
  btn_subscribe: '訂閱',
  new_arrival_title: 'New Arrival',
  new_arrival_desc: 'On the other hand, we denounce with right indignation and dislike men demoralized by the charms.',
  new_arrival_excerpt: '多年來已發展出各種版本，有時是偶然的，有時是刻意的。',
  email_placeholder: '您的電子郵件地址',
  // video defaults
  video_title: '',
  video_desc: '',
  video_image: '/images/video-banner/1.jpg',
  video_image_alt: '影片彈窗',
  video_url: 'https://www.youtube.com/embed/fkoEj95puX0',
  // blog default
  blog_enabled: 'true',
  // offer defaults
  offer_enabled: 'true',
  offer_title: '裝飾精選系列 <span class="offer">5 折優惠</span>',
  offer_desc: '精選裝飾系列現正舉辦限時特惠活動，各式精美居家裝飾品以半價優惠回饋顧客，把握機會為您的居家空間增添質感。',
  offer_countdown_date: '2026-12-31',
  offer_link: '/',
  offer_image: '/images/offer-colection/countdown.jpg',
  // brands default
  brands_json: JSON.stringify([
    { id: '1', brandImg: '/images/brand/1.jpg', brandImgAlt: '品牌圖片' },
    { id: '2', brandImg: '/images/brand/2.jpg', brandImgAlt: '品牌圖片' },
    { id: '3', brandImg: '/images/brand/3.jpg', brandImgAlt: '品牌圖片' },
    { id: '4', brandImg: '/images/brand/4.jpg', brandImgAlt: '品牌圖片' },
    { id: '5', brandImg: '/images/brand/5.jpg', brandImgAlt: '品牌圖片' },
  ]),
  // hero defaults
  hero_hide_header_at_top: 'false',
  hero_default_json: JSON.stringify([
    { id: 'hero-default-01', backgroundImage: '/images/hero/home-default/1.jpg', subtitle: '', title: '', desc: '', textColor: '#000000', subtitleColor: '#dcb14a', overlayColor: '#000000', overlayOpacity: 0, overlayDirection: 'full', buttonStyle: 'dark' },
    { id: 'hero-default-02', backgroundImage: '/images/hero/home-default/2.jpg', subtitle: '', title: '', desc: '', textColor: '#000000', subtitleColor: '#dcb14a', overlayColor: '#000000', overlayOpacity: 0, overlayDirection: 'full', buttonStyle: 'dark' },
    { id: 'hero-default-03', backgroundImage: '/images/hero/home-default/3.jpg', subtitle: '', title: '', desc: '', textColor: '#000000', subtitleColor: '#dcb14a', overlayColor: '#000000', overlayOpacity: 0, overlayDirection: 'full', buttonStyle: 'dark' },
  ]),
  hero_boxed_json: JSON.stringify([
    { id: 'hero-boxed-01', image: '/images/hero/home-boxed/1.png', imageAlt: '輪播圖片', subtitle: '', title: '' },
    { id: 'hero-boxed-02', image: '/images/hero/home-boxed/2.png', imageAlt: '輪播圖片', subtitle: '', title: '' },
  ]),
  hero_carousel_json: JSON.stringify([
    { id: 'hero-carousel-01', backgroundImage: '/images/hero/home-carousel/1.jpg', title: '鬧鐘 <br /> Carbon', desc: '我們精心挑選各式居家生活用品，<br /> 為您打造舒適美好的生活空間', textColor: '#000000', overlayColor: '#000000', overlayOpacity: 0, overlayDirection: 'full', buttonStyle: 'dark' },
    { id: 'hero-carousel-02', backgroundImage: '/images/hero/home-carousel/2.jpg', title: 'Angel <br /> 木質椅', desc: '我們精心挑選各式居家生活用品，<br /> 為您打造舒適美好的生活空間', textColor: '#000000', overlayColor: '#000000', overlayOpacity: 0, overlayDirection: 'full', buttonStyle: 'dark' },
    { id: 'hero-carousel-03', backgroundImage: '/images/hero/home-carousel/3.jpg', title: '竹製 <br /> 藤編籃', desc: '我們精心挑選各式居家生活用品，<br /> 為您打造舒適美好的生活空間', textColor: '#000000', overlayColor: '#000000', overlayOpacity: 0, overlayDirection: 'full', buttonStyle: 'dark' },
  ]),
  hero_collection_json: JSON.stringify([
    { id: 'hero-collection-01', subtitle: '', title: '香料罐', desc: '', image: '/images/hero/home-collection/1.png', imageAlt: '輪播圖片' },
    { id: 'hero-collection-02', subtitle: '', title: '藤編包', desc: '', image: '/images/hero/home-collection/2.png', imageAlt: '輪播圖片' },
    { id: 'hero-collection-03', subtitle: '', title: '鬧鐘', desc: '', image: '/images/hero/home-collection/3.png', imageAlt: '輪播圖片' },
  ]),
  // featured products default
  featured_products_json: JSON.stringify([
    { id: '1', subTitle: '精選商品', title: 'Nancy Chair', excerpt: '我們精心挑選各式優質家居用品，為您的生活空間增添獨特風格。每件商品都經過嚴格品質把關。', image: '/images/featured-product/nancy-chair.png', altImage: '精選商品圖片', path: '/products/nancy-chair', buttonText: '僅 $90', bgLabel: '木質布藝' },
    { id: '2', subTitle: '精選商品', title: 'Table Wood Pine', excerpt: '結合實用與美學的設計，<br/>為您的居家空間帶來全新體驗。', image: '/images/featured-product/table-wood-pine.png', altImage: '精選商品圖片', path: '/products/table-wood-pine', buttonText: '僅 $50', bgLabel: '松木' },
    { id: '3', subTitle: '精選商品', title: 'Art Deco Home', excerpt: '探索我們精心設計的裝飾藝術系列，<br/>讓您的家充滿藝術氣息。', image: '/images/featured-product/art-deco-home.png', altImage: '精選商品圖片', path: '/products/art-deco-home', buttonText: '僅 $30', bgLabel: '裝飾藝術' },
  ]),
  // about defaults
  about_video_banner: '/images/about/video-banner.jpg',
  about_video_banner_alt: '影片橫幅',
  about_video_url: 'https://www.youtube.com/embed/fkoEj95puX0',
  about_support_info_json: JSON.stringify([
    { id: 'info-01', infoIcon: 'IoBagHandleOutline', title: '線上購物', desc: '我們提供多樣化的商品選擇，滿足您的各種需求。' },
    { id: 'info-02', infoIcon: 'IoLogoPaypal', title: '付款方式', desc: '支援多種安全付款方式，讓您購物更安心。' },
    { id: 'info-03', infoIcon: 'IoNavigateOutline', title: '免運費', desc: '符合條件的訂單享有免運費優惠。' },
    { id: 'info-04', infoIcon: 'IoStopwatchOutline', title: '退換貨政策', desc: '提供完善的退換貨服務，保障您的權益。' },
  ]),
  about_perfection_title: '功能與完美的結合',
  about_perfection_desc: '我們致力於為您提供最優質的產品與服務。透過精心的設計與不斷的創新，我們將功能性與美學完美融合，為您帶來卓越的使用體驗。我們相信，好的設計能夠改善生活品質。',
  about_progress_json: JSON.stringify([
    { title: '創意', progressText: '82%' },
    { title: '行銷', progressText: '82%' },
    { title: '設計', progressText: '70%' },
  ]),
  about_banner_alt: '關於橫幅',
  about_banner_one: '/images/about/banner/1-780x770.jpg',
  about_banner_two: '/images/about/banner/2-380x380.jpg',
  about_banner_three: '/images/about/banner/3-380x380.jpg',
  about_banner_four: '/images/about/banner/4-380x380.jpg',
  about_banner_five: '/images/about/banner/5-780x380.jpg',
  about_address_title_one: '台北',
  about_address_desc_one: '台北市信義區信義路五段7號 <br/> (02) 2345-6789 <br/> info@helendo.com',
  about_address_title_two: '台中',
  about_address_desc_two: '台中市西屯區台灣大道三段99號 <br/> (04) 2345-6789 <br/> office@helendo.com',
  // contact UI text defaults
  contact_form_title: '與我們聯繫',
  contact_form_desc: '寫信給我們！',
  contact_info_title: '我們的地址',
  contact_info_desc: '歡迎透過以下方式與我們聯繫，我們將盡快回覆您。',
  contact_social_title: '追蹤我們的社群',
  // faq defaults
  faq_items_json: JSON.stringify([
    { id: '01', question: '如何幫助您的業務？', answer: '透過與客戶的深入合作與需求討論，我們能夠達成相互理解，獲得客戶信任，提供適當的建議，並推薦合適的技術方案來幫助您的業務轉型。' },
    { id: '02', question: 'Helendo 有哪些優勢？', answer: 'Helendo 注重每一個細節，確保系統運行順暢且反應迅速。Helendo 採用最新的精簡技術來保護客戶的資料庫，並建立高度機密的防火牆。' },
    { id: '03', question: '工作流程如何簡化？', answer: '我們透過精簡冗餘的複雜運算與冗長的程式碼，確保 Helendo 能夠流暢運行，並在各種行動裝置與瀏覽器上保持最佳的設計呈現。' },
    { id: '04', question: '產品工程與服務', answer: '我們的服務涵蓋產品生命週期中提升客戶體驗的各個環節，包括測試與維修、服務管理，以及端到端的保固管理。' },
  ]),
  faq_page_title: '常見問題',
  faq_page_desc: '以下是我們最常被詢問的問題，希望能幫助您找到所需的答案。',
  // error page defaults
  error404_image: '/images/error-404/confused.png',
  error404_image_alt: '錯誤圖片',
  error404_title: '糟糕！找不到頁面',
  error404_desc: '很抱歉，我們找不到您要的頁面。請嘗試搜尋或返回',
  error404_link_path: '/',
  error404_link_text: '首頁',
  // auth page defaults
  auth_tab_menu_json: JSON.stringify([
    { id: 'auth-menu-01', authMenuName: '登入', tabStateNo: 1 },
    { id: 'auth-menu-02', authMenuName: '註冊', tabStateNo: 2 },
  ]),
  // coming soon defaults
  coming_soon_title: '即將推出...',
  coming_soon_desc: '我們正在精心準備全新內容，敬請期待。新版本將帶來更多精彩功能與體驗。',
  coming_soon_count_title: '全新更新倒數計時：',
  coming_soon_social_title: '追蹤我們：',
  // cart page defaults
  cart_th_list_json: JSON.stringify([
    { id: 'cart-th-01', thCName: 'font-medium product-name py-3', thName: '商品' },
    { id: 'cart-th-02', thCName: 'font-medium product-price py-3', thName: '價格' },
    { id: 'cart-th-03', thCName: 'font-medium py-3', thName: '數量' },
    { id: 'cart-th-04', thCName: 'font-medium py-3', thName: '合計' },
    { id: 'cart-th-05', thCName: 'font-medium py-3 sr-only-custom', thName: '移除' },
  ]),
  cart_coupon_title: '優惠券折扣',
  cart_coupon_desc: '如果您有優惠券代碼，請在此輸入。',
  cart_coupon_btn_text: '套用優惠券',
  cart_shop_page_btn_text: '繼續購物',
  cart_clear_btn_text: '清空購物車',
  cart_proceed_btn_text: '前往結帳',
  // wishlist page defaults
  wishlist_th_list_json: JSON.stringify([
    { id: 'wishlist-th-01', thCName: 'font-medium product-name py-3', thName: '商品' },
    { id: 'wishlist-th-02', thCName: 'font-medium product-price py-3', thName: '單價' },
    { id: 'wishlist-th-03', thCName: 'font-medium py-3 sr-only-custom', thName: '立即購買' },
    { id: 'wishlist-th-04', thCName: 'font-medium py-3 sr-only-custom', thName: '移除' },
  ]),
  wishlist_clear_btn_text: '清空願望清單',
  // product detail defaults
  product_tab_menu_json: JSON.stringify([
    { id: 'tab-menu-01', name: '商品描述', tabMenuItemCName: 'description', separatorCName: 'tab-menu-separator', tabStateNumber: 1 },
    { id: 'tab-menu-02', name: '其他資訊', tabMenuItemCName: 'additional-information', separatorCName: 'tab-menu-separator', tabStateNumber: 2 },
    { id: 'tab-menu-03', name: '評價', tabMenuItemCName: 'reviews', separatorCName: 'tab-menu-separator', tabStateNumber: 3 },
  ]),
  product_desc_title: '商品描述',
  product_feature_title: '產品特色',
  product_review_heading: '成為第一個評價的人',
  product_review_title: '您的評分',
  product_rating_count: '5',
  // grid layout defaults
  grid_tab_2col_json: JSON.stringify([
    { id: 'grid-tab-list-01', gridColumns: 'grid-03', gridColumnImg: '/images/grid-icon/columns-03.png', gridImgAlt: '格狀圖片', tabStateNo: 1 },
    { id: 'grid-tab-list-02', gridColumns: 'grid-04', gridColumnImg: '/images/grid-icon/columns-04.png', gridImgAlt: '格狀圖片', tabStateNo: 2 },
  ]),
  grid_tab_3col_json: JSON.stringify([
    { id: 'grid-tab-list-01', gridColumns: 'grid-03', gridColumnImg: '/images/grid-icon/columns-03.png', gridImgAlt: '格狀圖片', tabStateNo: 1 },
    { id: 'grid-tab-list-02', gridColumns: 'grid-04', gridColumnImg: '/images/grid-icon/columns-04.png', gridImgAlt: '格狀圖片', tabStateNo: 2 },
    { id: 'grid-tab-list-03', gridColumns: 'grid-05', gridColumnImg: '/images/grid-icon/columns-05.png', gridImgAlt: '格狀圖片', tabStateNo: 3 },
  ]),
  grid_tab_3col_alt_json: JSON.stringify([
    { id: 'grid-tab-list-01', gridColumns: 'grid-04', gridColumnImg: '/images/grid-icon/columns-04.png', gridImgAlt: '格狀圖片', tabStateNo: 1 },
    { id: 'grid-tab-list-02', gridColumns: 'grid-05', gridColumnImg: '/images/grid-icon/columns-05.png', gridImgAlt: '格狀圖片', tabStateNo: 2 },
    { id: 'grid-tab-list-03', gridColumns: 'grid-06', gridColumnImg: '/images/grid-icon/columns-06.png', gridImgAlt: '格狀圖片', tabStateNo: 3 },
  ]),
  // header / footer defaults
  header_menu_json: JSON.stringify([
    { id: 1, title: '首頁', path: '/', holderCName: '', },
    { id: 2, title: '商品', path: '/products', holderCName: 'header-submenu-holder group', submenuCName: 'header-submenu', headerSubmenu: [
      { id: 'product-categories', submenuTitle: '商品分類', submenuPath: '/products/categories' },
      { id: 'cart', submenuTitle: '購物車', submenuPath: '/cart' },
      { id: 'wishlist', submenuTitle: '願望清單', submenuPath: '/wishlist' },
    ]},
    { id: 3, title: '部落格', path: '/blogs/sidebar', holderCName: '' },
    { id: 4, title: '頁面', path: '/', holderCName: 'header-submenu-holder group', submenuCName: 'header-submenu', headerSubmenu: [
      { id: 'about', submenuTitle: '關於我們', submenuPath: '/about' },
      { id: 'contact', submenuTitle: '聯絡我們', submenuPath: '/contact' },
      { id: 'faq', submenuTitle: '常見問題', submenuPath: '/faq' },
    ]},
  ]),
  header_contact_title: '聯繫我們',
  header_social_title: '追蹤我們的社群',
  footer_address_title: '地址',
  footer_info_title: '幫助與資訊',
  footer_info_links_json: JSON.stringify([
    { id: 1, title: '幫助與聯繫', path: '/contact' },
    { id: 2, title: '退換貨政策', path: '/contact' },
    { id: 3, title: '線上商店', path: '/' },
    { id: 4, title: '服務條款', path: '/contact' },
  ]),
  footer_about_title: '關於我們',
  footer_about_links_json: JSON.stringify([
    { id: 1, title: '關於我們', path: '/about' },
    { id: 2, title: '我們的服務', path: '/about' },
    { id: 3, title: '常見問題', path: '/faq' },
    { id: 4, title: '聯絡我們', path: '/contact' },
  ]),
  footer_newsletter_title: '電子報',
  footer_menu_links_json: JSON.stringify([
    { id: 1, title: '服務條款', path: '/about' },
    { id: 2, title: '隱私權政策', path: '/about' },
    { id: 3, title: '地圖', path: '/contact' },
  ]),
  footer_social_title: '追蹤我們的社群',
  footer_social_media_title: '社群媒體',
  footer_logo_alt: '頁尾標誌',
  footer_logo_path: '/',
  // state
  loaded: false,

  hydrate: (data) => set({ ...data, loaded: true }),
}));

export function formatPrice(price: number): string {
  const { currency_symbol, decimal_places } = useSettingsStore.getState();
  return `${currency_symbol}${price.toFixed(decimal_places)}`;
}
