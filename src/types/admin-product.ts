/**
 * Product shape matching the real DB/API (snake_case), used by the Nexus
 * admin product table/form. The legacy `Product` type in
 * src/types/product.ts is storefront-facing (camelCase, derived from
 * markdown/build-time data) and doesn't match what the admin API actually
 * returns — this one does.
 */
export interface ProductVariant {
  id: string;
  product_id?: string;
  name: string;
  price: number;
  discount_price: number | null;
  wholesale_price: number | null;
  stock_qty: number | null;
  sku: string | null;
  image_index: number | null;
  sort_order?: number;
}

export interface ProductImage {
  id: string;
  product_id?: string;
  sm_url: string;
  md_url: string;
  alt_text: string | null;
  sort_order?: number;
}

export interface ProductCategoryLink {
  category_id: string;
  categories?: { id: string; name: string };
}

export interface ProductAttribute {
  name: string;
  value: string;
  unit?: string;
}

export interface AdminProduct {
  id: string;
  title: string;
  slug: string;
  sku: string | null;
  price: number;
  discount_price: number | null;
  wholesale_price: number | null;
  desc_text: string | null;
  xs_image: string | null;
  sm_image: string | null;
  md_image: string | null;
  home_collection_img: string | null;
  category_banner_img: string | null;
  alt_image: string | null;
  tag: string | null;
  availability: 'in-stock' | 'out-of-stock';
  thermosphere: '0001' | '0002' | '0003';
  stock_qty: number;
  max_qty: number;
  variant_stock_mode: 'shared' | 'independent';
  attributes_json: string | null;
  sold_out_sticker: string | null;
  best_seller_sticker: string | null;
  offer_sticker: string | null;
  is_featured: boolean;
  is_new_arrival: boolean;
  show_in_banner: boolean;
  banner_order: number | null;
  is_active: boolean;
  sort_order: number;
  puck_data?: unknown;
  created_at?: string;
  updated_at?: string;
  product_categories?: ProductCategoryLink[];
  product_variants?: ProductVariant[];
  product_images?: ProductImage[];
}
