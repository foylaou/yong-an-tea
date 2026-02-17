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
  hero_default_json: string;
  hero_boxed_json: string;
  hero_carousel_json: string;
  hero_collection_json: string;
  // featured products
  featured_products_json: string;
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
  company_name: 'Helendo',
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
  products_per_page: 9,
  // variant defaults
  homepage_variant: 1,
  header_variant: 1,
  footer_variant: 1,
  // general defaults
  site_name: 'Helendo',
  site_description: '',
  logo_url: '',
  favicon_url: '',
  copyright_text: '© {year} Helendo. 版權所有。',
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
  video_title: 'Helendo 商店',
  video_desc: '從一幅肖像開始，追尋純粹的形態與清晰的輪廓，經過層層提煉，最終回歸本質。同樣地，從本質出發，循著相同的過程反向探索，終將呈現出完整的面貌。',
  video_image: '/images/video-banner/1.jpg',
  video_image_alt: '影片彈窗',
  video_url: 'https://www.youtube.com/embed/fkoEj95puX0',
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
  hero_default_json: JSON.stringify([
    { id: 'hero-default-01', backgroundImage: '/images/hero/home-default/1.jpg', subtitle: '椅子 <br /> 精選系列 <br /> 2023', title: '歡迎來到 <br /> Helendo 商店', desc: '我們精心挑選各式居家生活用品，<br /> 為您打造舒適美好的生活空間' },
    { id: 'hero-default-02', backgroundImage: '/images/hero/home-default/2.jpg', subtitle: '椅子 <br /> 精選系列 <br /> 2023', title: '歡迎來到 <br /> Helendo 商店', desc: '我們精心挑選各式居家生活用品，<br /> 為您打造舒適美好的生活空間' },
    { id: 'hero-default-03', backgroundImage: '/images/hero/home-default/3.jpg', subtitle: '椅子 <br /> 精選系列 <br /> 2023', title: '歡迎來到 <br /> Helendo 商店', desc: '我們精心挑選各式居家生活用品，<br /> 為您打造舒適美好的生活空間' },
  ]),
  hero_boxed_json: JSON.stringify([
    { id: 'hero-boxed-01', image: '/images/hero/home-boxed/1.png', imageAlt: '輪播圖片', subtitle: 'Helendo 商店', title: 'Hailey <br /> 木質椅' },
    { id: 'hero-boxed-02', image: '/images/hero/home-boxed/2.png', imageAlt: '輪播圖片', subtitle: 'Helendo 商店', title: 'Hailey <br /> 木質椅' },
  ]),
  hero_carousel_json: JSON.stringify([
    { id: 'hero-carousel-01', backgroundImage: '/images/hero/home-carousel/1.jpg', title: '鬧鐘 <br /> Carbon', desc: '我們精心挑選各式居家生活用品，<br /> 為您打造舒適美好的生活空間' },
    { id: 'hero-carousel-02', backgroundImage: '/images/hero/home-carousel/2.jpg', title: 'Angel <br /> 木質椅', desc: '我們精心挑選各式居家生活用品，<br /> 為您打造舒適美好的生活空間' },
    { id: 'hero-carousel-03', backgroundImage: '/images/hero/home-carousel/3.jpg', title: '竹製 <br /> 藤編籃', desc: '我們精心挑選各式居家生活用品，<br /> 為您打造舒適美好的生活空間' },
  ]),
  hero_collection_json: JSON.stringify([
    { id: 'hero-collection-01', subtitle: 'Helendo 商店', title: '香料罐', desc: '我們提供各式精選居家用品，<br /> 為您的生活增添獨特風格。', image: '/images/hero/home-collection/1.png', imageAlt: '輪播圖片' },
    { id: 'hero-collection-02', subtitle: 'Helendo 商店', title: '藤編包', desc: '我們提供各式精選居家用品，<br /> 為您的生活增添獨特風格。', image: '/images/hero/home-collection/2.png', imageAlt: '輪播圖片' },
    { id: 'hero-collection-03', subtitle: 'Helendo 商店', title: '鬧鐘', desc: '我們提供各式精選居家用品，<br /> 為您的生活增添獨特風格。', image: '/images/hero/home-collection/3.png', imageAlt: '輪播圖片' },
  ]),
  // featured products default
  featured_products_json: JSON.stringify([
    { id: '1', subTitle: '精選商品', title: 'Nancy Chair', excerpt: '我們精心挑選各式優質家居用品，為您的生活空間增添獨特風格。每件商品都經過嚴格品質把關。', image: '/images/featured-product/nancy-chair.png', altImage: '精選商品圖片', path: '/products/nancy-chair', buttonText: '僅 $90', bgLabel: '木質布藝' },
    { id: '2', subTitle: '精選商品', title: 'Table Wood Pine', excerpt: '結合實用與美學的設計，<br/>為您的居家空間帶來全新體驗。', image: '/images/featured-product/table-wood-pine.png', altImage: '精選商品圖片', path: '/products/table-wood-pine', buttonText: '僅 $50', bgLabel: '松木' },
    { id: '3', subTitle: '精選商品', title: 'Art Deco Home', excerpt: '探索我們精心設計的裝飾藝術系列，<br/>讓您的家充滿藝術氣息。', image: '/images/featured-product/art-deco-home.png', altImage: '精選商品圖片', path: '/products/art-deco-home', buttonText: '僅 $30', bgLabel: '裝飾藝術' },
  ]),
  // state
  loaded: false,

  hydrate: (data) => set({ ...data, loaded: true }),
}));

export function formatPrice(price: number): string {
  const { currency_symbol, decimal_places } = useSettingsStore.getState();
  return `${currency_symbol}${price.toFixed(decimal_places)}`;
}
