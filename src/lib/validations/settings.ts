import { z } from 'zod';

// --- Form Schemas (for react-hook-form, use z.number() + valueAsNumber) ---

export const generalSettingsSchema = z.object({
  site_name: z.string().min(1, '網站名稱為必填'),
  site_description: z.string().min(1, '網站描述為必填'),
  logo_url: z.string().min(1, 'Logo 路徑為必填'),
  favicon_url: z.string().min(1, 'Favicon 路徑為必填'),
  copyright_text: z.string().optional(),
});

export const homepageSettingsSchema = z.object({
  homepage_variant: z.number().int().min(1).max(5),
});

export const currencySettingsSchema = z.object({
  default_currency: z.string().min(1, '預設幣別為必填'),
  currency_symbol: z.string().min(1, '幣別符號為必填'),
  decimal_places: z.number().int().min(0).max(4),
  available_currencies: z.string().min(1, '可用幣別為必填'),
});

export const contactSettingsSchema = z.object({
  company_name: z.string().min(1, '公司名稱為必填'),
  address: z.string().min(1, '地址為必填'),
  phone: z.string().min(1, '電話為必填'),
  email: z.string().email('Email 格式不正確'),
  business_hours: z.string().min(1, '營業時間為必填'),
  map_embed_url: z.string().refine(
    (val) => val === '' || /^https:\/\/www\.google\.com\/maps\/embed/.test(val),
    { message: '請輸入有效的 Google Maps 嵌入網址' }
  ),
});

const optionalUrl = z.string().refine(
  (val) => val === '' || /^https?:\/\//.test(val),
  { message: '請輸入有效的 URL（以 http:// 或 https:// 開頭）' }
);

export const socialSettingsSchema = z.object({
  social_facebook: optionalUrl,
  social_twitter: optionalUrl,
  social_instagram: optionalUrl,
  social_pinterest: optionalUrl,
  social_tumblr: optionalUrl,
});

export const sortOrderEnum = z.enum([
  'newest',
  'oldest',
  'price_asc',
  'price_desc',
  'name_asc',
  'name_desc',
]);

export const productDisplaySettingsSchema = z.object({
  default_grid_columns: z.number().int().min(3).max(6),
  products_per_page: z.number().int().min(4).max(48),
  default_sort_order: sortOrderEnum,
});

export const contentSettingsSchema = z.object({
  section_title_bestselling: z.string().optional(),
  section_title_latest_blog: z.string().optional(),
  section_title_explore_blog: z.string().optional(),
  section_title_popular_products: z.string().optional(),
  section_title_newsletter: z.string().optional(),
  newsletter_desc: z.string().optional(),
  section_title_newsletter_v3: z.string().optional(),
  newsletter_desc_v3: z.string().optional(),
  btn_shop_now: z.string().optional(),
  btn_view_more: z.string().optional(),
  btn_view_all: z.string().optional(),
  btn_all_products: z.string().optional(),
  btn_load_more: z.string().optional(),
  btn_all_loaded: z.string().optional(),
  btn_subscribe: z.string().optional(),
  new_arrival_title: z.string().optional(),
  new_arrival_desc: z.string().optional(),
  new_arrival_excerpt: z.string().optional(),
  email_placeholder: z.string().optional(),
});

export const videoSettingsSchema = z.object({
  video_title: z.string().optional(),
  video_desc: z.string().optional(),
  video_image: z.string().optional(),
  video_image_alt: z.string().optional(),
  video_url: z.string().optional(),
});

export const offerSettingsSchema = z.object({
  offer_enabled: z.string().optional(),
  offer_title: z.string().optional(),
  offer_desc: z.string().optional(),
  offer_countdown_date: z.string().optional(),
  offer_link: z.string().optional(),
  offer_image: z.string().optional(),
});

export const brandsSettingsSchema = z.object({
  brands_json: z.string().optional(),
});

export const heroSettingsSchema = z.object({
  hero_default_json: z.string().optional(),
  hero_boxed_json: z.string().optional(),
  hero_carousel_json: z.string().optional(),
  hero_collection_json: z.string().optional(),
});

export const featuredSettingsSchema = z.object({
  featured_products_json: z.string().optional(),
});

// --- Type exports ---

export type GeneralSettingsData = z.infer<typeof generalSettingsSchema>;
export type HomepageSettingsData = z.infer<typeof homepageSettingsSchema>;
export type CurrencySettingsData = z.infer<typeof currencySettingsSchema>;
export type ContactSettingsData = z.infer<typeof contactSettingsSchema>;
export type SocialSettingsData = z.infer<typeof socialSettingsSchema>;
export type ProductDisplaySettingsData = z.infer<typeof productDisplaySettingsSchema>;
export type ContentSettingsData = z.infer<typeof contentSettingsSchema>;
export type VideoSettingsData = z.infer<typeof videoSettingsSchema>;
export type OfferSettingsData = z.infer<typeof offerSettingsSchema>;
export type BrandsSettingsData = z.infer<typeof brandsSettingsSchema>;
export type HeroSettingsData = z.infer<typeof heroSettingsSchema>;
export type FeaturedSettingsData = z.infer<typeof featuredSettingsSchema>;
// --- API Schemas (for server-side validation, accepts array for currencies) ---

export const currencyApiSchema = z.object({
  default_currency: z.string().min(1, '預設幣別為必填'),
  currency_symbol: z.string().min(1, '幣別符號為必填'),
  decimal_places: z.number().int().min(0).max(4),
  available_currencies: z.array(z.string().min(1)).min(1, '至少需要一種幣別'),
});

export const settingsUpdateApiSchema = z.object({
  group: z.enum(['general', 'homepage', 'currency', 'contact', 'social', 'product_display', 'content', 'video', 'offer', 'brands', 'hero', 'featured']),
  settings: z.record(z.string(), z.unknown()),
});

// --- Schema Map (API-side: uses currencyApiSchema for array input) ---

export const settingsSchemaMap: Record<string, z.ZodType> = {
  general: generalSettingsSchema,
  homepage: homepageSettingsSchema,
  currency: currencyApiSchema,
  contact: contactSettingsSchema,
  social: socialSettingsSchema,
  product_display: productDisplaySettingsSchema,
  content: contentSettingsSchema,
  video: videoSettingsSchema,
  offer: offerSettingsSchema,
  brands: brandsSettingsSchema,
  hero: heroSettingsSchema,
  featured: featuredSettingsSchema,
};

// --- Group labels (Chinese) ---

export const groupLabels: Record<string, string> = {
  general: '一般設定',
  homepage: '首頁設定',
  currency: '幣別設定',
  contact: '聯絡資訊',
  social: '社群媒體',
  product_display: '商品顯示',
  content: '文案設定',
  video: '影片區塊',
  offer: '限時優惠',
  brands: '品牌輪播',
  hero: 'Hero Banner',
  featured: '精選商品',
};

export const groupKeys = ['general', 'homepage', 'currency', 'contact', 'social', 'product_display', 'content', 'video', 'offer', 'brands', 'hero', 'featured'] as const;
export type SettingsGroup = (typeof groupKeys)[number];
